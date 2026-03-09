// HTTP Status Code Finder Application Logic

import type {
  HttpStatusCategory,
  HttpStatusCode,
  SearchResult,
  CategoryInfo,
} from "@/types/http-status-finder";

// ---------------------------------------------------------------------------
// Locale type (mirrors locale-store but no React import needed)
// ---------------------------------------------------------------------------
type Locale = string; // "en" | "es" | "fr" | "pt" | "de" | "it" | "zh" | "ja" have full translations; others fallback to "en"

// ---------------------------------------------------------------------------
// Per-status-code localizable strings: description, whenToUse, example
// ---------------------------------------------------------------------------
interface StatusStrings {
  description: string;
  whenToUse: string;
  example: string;
}

const STATUS_STRINGS: Record<Locale, Record<number, StatusStrings>> = {
  en: {
    // 1xx Informational
    100: { description: "The server received the headers and the client may continue sending the body.", whenToUse: "Large requests with Expect: 100-continue.", example: "POST with large file" },
    101: { description: "The server accepts switching protocols as requested.", whenToUse: "When upgrading from HTTP to WebSocket.", example: "Upgrade: websocket" },
    102: { description: "The server received the request and is processing it, but no response is available yet.", whenToUse: "Long WebDAV operations.", example: "WebDAV COPY/MOVE" },
    103: { description: "Allows the client to preload resources while the server prepares the response.", whenToUse: "Sending early Link headers for preload.", example: "Link: </style.css>; rel=preload" },

    // 2xx Success
    200: { description: "The request was successful.", whenToUse: "Standard response for successful GET, POST, PUT.", example: "GET /api/users -> 200" },
    201: { description: "The request was successful and a new resource was created.", whenToUse: "After creating a resource with POST.", example: "POST /api/users -> 201" },
    202: { description: "The request was accepted for processing but not yet completed.", whenToUse: "Asynchronous operations (queues, jobs, emails).", example: "POST /api/reports/generate -> 202" },
    203: { description: "The response was modified by an intermediate proxy.", whenToUse: "Proxy that transforms the origin response.", example: "CDN with modified headers" },
    204: { description: "Successful request but no content to return.", whenToUse: "Successful DELETE or PUT that does not return the object.", example: "DELETE /api/users/1 -> 204" },
    205: { description: "The server processed the request and asks the client to reset the view.", whenToUse: "After submitting a form, reset fields.", example: "POST /form -> 205 (clear form)" },
    206: { description: "The server sends only a portion of the resource (requested range).", whenToUse: "Partial download, video/audio streaming.", example: "Range: bytes=0-1023 -> 206" },
    207: { description: "XML response with multiple status codes for batch operations.", whenToUse: "WebDAV operations on multiple resources.", example: "PROPFIND multi-resource -> 207" },
    208: { description: "The members of a DAV binding have already been enumerated.", whenToUse: "Avoid duplicates in WebDAV responses.", example: "WebDAV with bindings -> 208" },
    226: { description: "The server fulfilled the GET request and the response is a delta representation.", whenToUse: "Delta encoding with Instance Manipulations.", example: "GET with A-IM: feed -> 226" },

    // 3xx Redirection
    300: { description: "There are multiple options for the requested resource.", whenToUse: "Resource available in multiple formats (JSON, XML, PDF).", example: "GET /report -> 300 (JSON or PDF)" },
    301: { description: "The resource has been permanently moved to a new URI.", whenToUse: "Permanent URL migration.", example: "http -> https redirect" },
    302: { description: "The resource is temporarily located at another URI.", whenToUse: "Temporary redirect.", example: "Successful login -> /dashboard" },
    303: { description: "The response to the request can be found at another URI (always GET).", whenToUse: "After POST, redirect to confirmation page with GET.", example: "POST /order -> 303 -> GET /order/123" },
    304: { description: "The resource has not changed since the last request.", whenToUse: "Resource caching (ETag/If-Modified-Since).", example: "Static files (CSS/JS)" },
    307: { description: "Temporary redirect preserving the original HTTP method.", whenToUse: "Redirect a POST to another URL without changing to GET.", example: "Microservices proxy" },
    308: { description: "Permanent redirect preserving the original HTTP method.", whenToUse: "Permanent URL change for a write endpoint.", example: "API Versioning migration" },

    // 4xx Client Error
    400: { description: "The server cannot process the request due to a client error.", whenToUse: "Invalid input, malformed JSON, missing parameters.", example: "POST with invalid body -> 400" },
    401: { description: "Authentication is required to access the resource.", whenToUse: "Expired token, missing credentials.", example: "GET /api/me without token -> 401" },
    402: { description: "Reserved for future use. Indicates that payment is required.", whenToUse: "Payment APIs, expired subscriptions, depleted credits.", example: "API with exhausted free plan -> 402" },
    403: { description: "The client does not have permission for the requested resource.", whenToUse: "Authenticated user without Admin role.", example: "Regular user trying to delete DB" },
    404: { description: "The requested resource does not exist on the server.", whenToUse: "Incorrect URL, deleted resource.", example: "GET /api/users/999 -> 404" },
    405: { description: "The HTTP method is not allowed for this resource.", whenToUse: "POST on a URL that only accepts GET.", example: "POST /robots.txt" },
    406: { description: "The server cannot produce a response matching the client's Accept headers.", whenToUse: "Client asks for XML but server only produces JSON.", example: "Accept: application/xml -> 406" },
    407: { description: "Authentication with the proxy is required.", whenToUse: "Corporate proxy that requires credentials.", example: "Enterprise proxy without auth -> 407" },
    408: { description: "The server timed out waiting for the client's request.", whenToUse: "Client sends data too slowly, idle connection.", example: "Slow upload that expires -> 408" },
    409: { description: "The request could not be completed due to a conflict on the server.", whenToUse: "Creating a user that already exists by email.", example: "Duplicate unique key in DB" },
    410: { description: "The resource existed but is no longer permanently available.", whenToUse: "Intentionally deleted resources (expired offers).", example: "Job posting already closed" },
    411: { description: "The server rejects the request because the Content-Length header is missing.", whenToUse: "APIs that need to know the body size before processing.", example: "PUT without Content-Length -> 411" },
    412: { description: "The header preconditions were not met.", whenToUse: "If-Match with outdated ETag (optimistic locking).", example: "PUT with incorrect If-Match -> 412" },
    413: { description: "The request body exceeds the server's limit.", whenToUse: "File upload larger than the maximum allowed.", example: "Upload 100MB on server with 10MB limit -> 413" },
    414: { description: "The request URI is too long for the server.", whenToUse: "Extremely long query strings.", example: "GET /search?q=... (10K chars) -> 414" },
    415: { description: "The request media type is not supported.", whenToUse: "Sending XML when the API only accepts JSON.", example: "Content-Type: text/xml -> 415" },
    416: { description: "The requested range cannot be satisfied.", whenToUse: "Requesting bytes beyond the file size.", example: "Range: bytes=9999-10000 on 100-byte file -> 416" },
    417: { description: "The server cannot meet the requirements of the Expect header.", whenToUse: "Server does not support Expect: 100-continue.", example: "Expect: 100-continue rejected -> 417" },
    418: { description: "The server is a teapot and cannot brew coffee (RFC 2324).", whenToUse: "Easter egg, humorous health checks.", example: "GET /coffee -> 418" },
    421: { description: "The request was directed at a server that cannot produce a response.", whenToUse: "HTTP/2: request sent to server with incorrect certificate.", example: "SNI mismatch in HTTP/2 -> 421" },
    422: { description: "The request is well-formed but has semantic errors.", whenToUse: "Validation: valid JSON but invalid data (malformed email).", example: "POST {\"email\": \"not-an-email\"} -> 422" },
    423: { description: "The resource is locked.", whenToUse: "WebDAV: resource locked for editing.", example: "PUT on locked file -> 423" },
    424: { description: "The request failed because it depended on another operation that failed.", whenToUse: "WebDAV: cascading operation failure.", example: "COPY depending on failed LOCK -> 424" },
    425: { description: "The server will not process the request because it may be replayed.", whenToUse: "TLS Early Data (0-RTT) with replay risk.", example: "POST with TLS 0-RTT -> 425" },
    426: { description: "The client must switch to a different protocol.", whenToUse: "Server requires TLS or HTTP/2.", example: "HTTP/1.0 -> Upgrade to HTTP/1.1 -> 426" },
    428: { description: "The server requires the request to include preconditions.", whenToUse: "API that requires If-Match to prevent edit conflicts.", example: "PUT without If-Match -> 428" },
    429: { description: "The client has sent too many requests in a given period.", whenToUse: "Rate limiting, API throttling.", example: "100 req/min exceeded -> 429" },
    431: { description: "The request header fields are too large.", whenToUse: "Excessive cookies, huge custom headers.", example: "8KB cookie -> 431" },
    451: { description: "The resource is unavailable for legal reasons.", whenToUse: "DMCA, GDPR, government censorship.", example: "Content blocked by law -> 451" },

    // 5xx Server Error
    500: { description: "Generic server error.", whenToUse: "Unhandled error, unexpected exception.", example: "NullPointerException -> 500" },
    501: { description: "The server does not recognize the request method or cannot fulfill it.", whenToUse: "HTTP method not implemented (PATCH on legacy server).", example: "PATCH on API without support -> 501" },
    502: { description: "The server acting as a proxy received an invalid response.", whenToUse: "Nginx cannot communicate with the microservice.", example: "Upstream server is down" },
    503: { description: "The server cannot handle the request (overload or maintenance).", whenToUse: "Scheduled maintenance.", example: "Downtime for update" },
    504: { description: "The server acting as a proxy did not receive a timely response.", whenToUse: "Microservice takes too long to respond.", example: "Heavy query that times out the proxy" },
    505: { description: "The server does not support the HTTP version used.", whenToUse: "Client using HTTP/0.9 on a modern server.", example: "HTTP/0.9 -> 505" },
    506: { description: "Configuration error: the chosen variant also negotiates content.", whenToUse: "Content negotiation configuration error.", example: "Circular negotiation -> 506" },
    507: { description: "The server does not have enough storage to complete the request.", whenToUse: "Full disk on WebDAV server.", example: "Upload to full disk -> 507" },
    508: { description: "The server detected an infinite loop while processing the request.", whenToUse: "Circular reference in WebDAV.", example: "Circular symlink -> 508" },
    510: { description: "Additional extensions are needed to fulfill the request.", whenToUse: "Additional HTTP extensions required.", example: "HTTP extension not provided -> 510" },
    511: { description: "Network authentication is required to gain access.", whenToUse: "Captive WiFi portal.", example: "Hotel WiFi -> 511" },
  },
  es: {
    // 1xx Informational
    100: { description: "El servidor recibio los headers y el cliente puede continuar enviando el body.", whenToUse: "En solicitudes grandes con Expect: 100-continue.", example: "POST con archivo grande" },
    101: { description: "El servidor acepta cambiar de protocolo segun lo solicitado.", whenToUse: "Al hacer upgrade de HTTP a WebSocket.", example: "Upgrade: websocket" },
    102: { description: "El servidor recibio la solicitud y la esta procesando, pero no hay respuesta aun.", whenToUse: "Operaciones WebDAV largas.", example: "WebDAV COPY/MOVE" },
    103: { description: "Permite al cliente precargar recursos mientras el servidor prepara la respuesta.", whenToUse: "Enviar Link headers anticipados para preload.", example: "Link: </style.css>; rel=preload" },

    // 2xx Success
    200: { description: "La solicitud fue exitosa.", whenToUse: "Respuesta estandar para GET, POST, PUT exitosos.", example: "GET /api/users -> 200" },
    201: { description: "La solicitud fue exitosa y se creo un nuevo recurso.", whenToUse: "Despues de crear un recurso con POST.", example: "POST /api/users -> 201" },
    202: { description: "La solicitud fue aceptada para procesamiento, pero no completada aun.", whenToUse: "Operaciones asincronas (colas, jobs, emails).", example: "POST /api/reports/generate -> 202" },
    203: { description: "La respuesta fue modificada por un proxy intermedio.", whenToUse: "Proxy que transforma la respuesta del origen.", example: "CDN con headers modificados" },
    204: { description: "Peticion exitosa pero no hay contenido que devolver.", whenToUse: "DELETE exitoso o PUT que no devuelve el objeto.", example: "DELETE /api/users/1 -> 204" },
    205: { description: "El servidor proceso la solicitud y pide al cliente resetear la vista.", whenToUse: "Despues de enviar un formulario, resetear campos.", example: "POST /form -> 205 (limpiar formulario)" },
    206: { description: "El servidor envia solo una parte del recurso (rango solicitado).", whenToUse: "Descarga parcial, streaming de video/audio.", example: "Range: bytes=0-1023 -> 206" },
    207: { description: "Respuesta XML con multiples codigos de estado para operaciones batch.", whenToUse: "WebDAV operaciones sobre multiples recursos.", example: "PROPFIND multi-recurso -> 207" },
    208: { description: "Los miembros de un binding DAV ya fueron enumerados previamente.", whenToUse: "Evitar duplicados en respuestas WebDAV.", example: "WebDAV con bindings -> 208" },
    226: { description: "El servidor cumplio la solicitud GET y la respuesta es una representacion delta.", whenToUse: "Delta encoding con Instance Manipulations.", example: "GET con A-IM: feed -> 226" },

    // 3xx Redirection
    300: { description: "Hay multiples opciones para el recurso solicitado.", whenToUse: "Recurso disponible en varios formatos (JSON, XML, PDF).", example: "GET /report -> 300 (JSON o PDF)" },
    301: { description: "El recurso se ha movido permanentemente a una nueva URI.", whenToUse: "Migracion definitiva de URLs.", example: "http -> https redirect" },
    302: { description: "El recurso se encuentra temporalmente en otra URI.", whenToUse: "Redireccion temporal.", example: "Login exitoso -> /dashboard" },
    303: { description: "La respuesta al request se encuentra en otra URI (siempre GET).", whenToUse: "Despues de POST, redirigir a pagina de confirmacion con GET.", example: "POST /order -> 303 -> GET /order/123" },
    304: { description: "El recurso no ha cambiado desde la ultima solicitud.", whenToUse: "Cacheado de recursos (ETag/If-Modified-Since).", example: "Archivos estaticos (CSS/JS)" },
    307: { description: "Redireccion temporal manteniendo el metodo HTTP original.", whenToUse: "Redirigir un POST a otra URL sin cambiar a GET.", example: "Proxy de microservicios" },
    308: { description: "Redireccion permanente manteniendo el metodo HTTP original.", whenToUse: "Cambio de URL definitivo para un endpoint de escritura.", example: "API Versioning migration" },

    // 4xx Client Error
    400: { description: "El servidor no puede procesar la solicitud por error del cliente.", whenToUse: "Input invalido, JSON malformado, parametros faltantes.", example: "POST con body invalido -> 400" },
    401: { description: "Se requiere autenticacion para acceder al recurso.", whenToUse: "Token expirado, sin credenciales.", example: "GET /api/me sin token -> 401" },
    402: { description: "Reservado para uso futuro. Indica que se requiere pago.", whenToUse: "APIs de pago, suscripciones expiradas, creditos agotados.", example: "API con plan gratuito agotado -> 402" },
    403: { description: "El cliente no tiene permisos para el recurso solicitado.", whenToUse: "Usuario autenticado pero sin rol de Admin.", example: "Usuario normal intentando borrar DB" },
    404: { description: "El recurso solicitado no existe en el servidor.", whenToUse: "URL incorrecta, recurso eliminado.", example: "GET /api/users/999 -> 404" },
    405: { description: "El metodo HTTP no esta permitido para este recurso.", whenToUse: "POST en una URL que solo acepta GET.", example: "POST /robots.txt" },
    406: { description: "El servidor no puede generar una respuesta compatible con los headers Accept del cliente.", whenToUse: "Cliente pide XML pero servidor solo genera JSON.", example: "Accept: application/xml -> 406" },
    407: { description: "Se requiere autenticacion ante el proxy.", whenToUse: "Proxy corporativo que requiere credenciales.", example: "Proxy empresarial sin auth -> 407" },
    408: { description: "El servidor agoto el tiempo esperando la solicitud del cliente.", whenToUse: "Cliente envia datos muy lento, conexion idle.", example: "Upload lento que expira -> 408" },
    409: { description: "La solicitud no se pudo completar por un conflicto en el servidor.", whenToUse: "Crear un usuario que ya existe por email.", example: "Duplicate unique key in DB" },
    410: { description: "El recurso existia pero ya no esta disponible permanentemente.", whenToUse: "Recursos eliminados a proposito (ofertas expiradas).", example: "Oferta de trabajo ya cerrada" },
    411: { description: "El servidor rechaza la solicitud porque falta el header Content-Length.", whenToUse: "APIs que requieren saber el tamano del body antes de procesarlo.", example: "PUT sin Content-Length -> 411" },
    412: { description: "Las precondiciones del header no se cumplieron.", whenToUse: "If-Match con ETag desactualizado (optimistic locking).", example: "PUT con If-Match incorrecto -> 412" },
    413: { description: "El cuerpo de la solicitud excede el limite del servidor.", whenToUse: "Upload de archivo mayor al maximo permitido.", example: "Upload 100MB en servidor con limite 10MB -> 413" },
    414: { description: "La URI de la solicitud es demasiado larga para el servidor.", whenToUse: "Query strings extremadamente largos.", example: "GET /search?q=... (10K chars) -> 414" },
    415: { description: "El tipo de medio de la solicitud no es soportado.", whenToUse: "Enviar XML cuando la API solo acepta JSON.", example: "Content-Type: text/xml -> 415" },
    416: { description: "El rango solicitado no puede ser satisfecho.", whenToUse: "Solicitar bytes mas alla del tamano del archivo.", example: "Range: bytes=9999-10000 en archivo de 100 bytes -> 416" },
    417: { description: "El servidor no puede cumplir los requisitos del header Expect.", whenToUse: "Servidor no soporta Expect: 100-continue.", example: "Expect: 100-continue rechazado -> 417" },
    418: { description: "El servidor es una tetera y no puede preparar cafe (RFC 2324).", whenToUse: "Easter egg, health checks con humor.", example: "GET /coffee -> 418" },
    421: { description: "La solicitud fue dirigida a un servidor que no puede producir una respuesta.", whenToUse: "HTTP/2: solicitud enviada a servidor con certificado incorrecto.", example: "SNI mismatch en HTTP/2 -> 421" },
    422: { description: "La solicitud esta bien formada pero tiene errores semanticos.", whenToUse: "Validacion: JSON valido pero datos invalidos (email mal formado).", example: "POST {\"email\": \"no-es-email\"} -> 422" },
    423: { description: "El recurso esta bloqueado.", whenToUse: "WebDAV: recurso bloqueado para edicion.", example: "PUT en archivo bloqueado -> 423" },
    424: { description: "La solicitud fallo por depender de otra operacion que fallo.", whenToUse: "WebDAV: fallo en cascada de operaciones.", example: "COPY que depende de LOCK fallido -> 424" },
    425: { description: "El servidor no procesara la solicitud porque puede ser repetida.", whenToUse: "TLS Early Data (0-RTT) con riesgo de replay.", example: "POST con TLS 0-RTT -> 425" },
    426: { description: "El cliente debe cambiar a un protocolo diferente.", whenToUse: "Servidor requiere TLS o HTTP/2.", example: "HTTP/1.0 -> Upgrade a HTTP/1.1 -> 426" },
    428: { description: "El servidor requiere que la solicitud incluya precondiciones.", whenToUse: "API que exige If-Match para prevenir conflictos de edicion.", example: "PUT sin If-Match -> 428" },
    429: { description: "El cliente ha enviado demasiadas solicitudes en un periodo.", whenToUse: "Rate limiting, throttling de API.", example: "100 req/min excedido -> 429" },
    431: { description: "Los headers de la solicitud son demasiado grandes.", whenToUse: "Cookies excesivas, headers personalizados enormes.", example: "Cookie de 8KB -> 431" },
    451: { description: "El recurso no esta disponible por motivos legales.", whenToUse: "DMCA, GDPR, censura gubernamental.", example: "Contenido bloqueado por ley -> 451" },

    // 5xx Server Error
    500: { description: "Error generico del servidor.", whenToUse: "Error no manejado, excepcion inesperada.", example: "NullPointerException -> 500" },
    501: { description: "El servidor no reconoce el metodo de solicitud o no puede completarlo.", whenToUse: "Metodo HTTP no implementado (PATCH en server legacy).", example: "PATCH en API sin soporte -> 501" },
    502: { description: "El servidor actuando como proxy recibio una respuesta invalida.", whenToUse: "Nginx no puede comunicar con el microservicio.", example: "Upstream server is down" },
    503: { description: "El servidor no puede manejar la solicitud (sobrecarga o mantenimiento).", whenToUse: "Mantenimiento programado.", example: "Downtime por actualizacion" },
    504: { description: "El servidor actuando como proxy no recibio respuesta a tiempo.", whenToUse: "Microservicio tarda demasiado en responder.", example: "Query pesada que expira el proxy" },
    505: { description: "El servidor no soporta la version HTTP usada.", whenToUse: "Cliente usando HTTP/0.9 en servidor moderno.", example: "HTTP/0.9 -> 505" },
    506: { description: "Error de configuracion: la variante elegida tambien negocia contenido.", whenToUse: "Error de configuracion de content negotiation.", example: "Negociacion circular -> 506" },
    507: { description: "El servidor no tiene espacio suficiente para completar la solicitud.", whenToUse: "Disco lleno en servidor WebDAV.", example: "Upload a disco lleno -> 507" },
    508: { description: "El servidor detecto un bucle infinito al procesar la solicitud.", whenToUse: "Referencia circular en WebDAV.", example: "Symlink circular -> 508" },
    510: { description: "Se necesitan extensiones adicionales para cumplir la solicitud.", whenToUse: "Extensiones HTTP adicionales requeridas.", example: "Extension HTTP no proporcionada -> 510" },
    511: { description: "Se requiere autenticacion de red para acceder.", whenToUse: "Portal cautivo de WiFi.", example: "WiFi de hotel -> 511" },
  },
  fr: {
    // 1xx Informational
    100: { description: "Le serveur a recu les en-tetes et le client peut continuer a envoyer le corps.", whenToUse: "Requetes volumineuses avec Expect: 100-continue.", example: "POST avec fichier volumineux" },
    101: { description: "Le serveur accepte de changer de protocole comme demande.", whenToUse: "Lors de la mise a niveau de HTTP vers WebSocket.", example: "Upgrade: websocket" },
    102: { description: "Le serveur a recu la requete et la traite, mais aucune reponse n'est encore disponible.", whenToUse: "Operations WebDAV longues.", example: "WebDAV COPY/MOVE" },
    103: { description: "Permet au client de precharger des ressources pendant que le serveur prepare la reponse.", whenToUse: "Envoi anticipe d'en-tetes Link pour le prechargement.", example: "Link: </style.css>; rel=preload" },

    // 2xx Success
    200: { description: "La requete a reussi.", whenToUse: "Reponse standard pour GET, POST, PUT reussis.", example: "GET /api/users -> 200" },
    201: { description: "La requete a reussi et une nouvelle ressource a ete creee.", whenToUse: "Apres la creation d'une ressource avec POST.", example: "POST /api/users -> 201" },
    202: { description: "La requete a ete acceptee pour traitement mais n'est pas encore terminee.", whenToUse: "Operations asynchrones (files d'attente, jobs, emails).", example: "POST /api/reports/generate -> 202" },
    203: { description: "La reponse a ete modifiee par un proxy intermediaire.", whenToUse: "Proxy qui transforme la reponse d'origine.", example: "CDN avec en-tetes modifies" },
    204: { description: "Requete reussie mais aucun contenu a retourner.", whenToUse: "DELETE reussi ou PUT qui ne retourne pas l'objet.", example: "DELETE /api/users/1 -> 204" },
    205: { description: "Le serveur a traite la requete et demande au client de reinitialiser la vue.", whenToUse: "Apres soumission d'un formulaire, reinitialiser les champs.", example: "POST /form -> 205 (reinitialiser formulaire)" },
    206: { description: "Le serveur envoie seulement une partie de la ressource (plage demandee).", whenToUse: "Telechargement partiel, streaming video/audio.", example: "Range: bytes=0-1023 -> 206" },
    207: { description: "Reponse XML avec plusieurs codes de statut pour des operations par lots.", whenToUse: "Operations WebDAV sur plusieurs ressources.", example: "PROPFIND multi-ressource -> 207" },
    208: { description: "Les membres d'un binding DAV ont deja ete enumeres.", whenToUse: "Eviter les doublons dans les reponses WebDAV.", example: "WebDAV avec bindings -> 208" },
    226: { description: "Le serveur a satisfait la requete GET et la reponse est une representation delta.", whenToUse: "Encodage delta avec Instance Manipulations.", example: "GET avec A-IM: feed -> 226" },

    // 3xx Redirection
    300: { description: "Il existe plusieurs options pour la ressource demandee.", whenToUse: "Ressource disponible en plusieurs formats (JSON, XML, PDF).", example: "GET /report -> 300 (JSON ou PDF)" },
    301: { description: "La ressource a ete deplacee de facon permanente vers une nouvelle URI.", whenToUse: "Migration definitive d'URLs.", example: "http -> https redirect" },
    302: { description: "La ressource se trouve temporairement a une autre URI.", whenToUse: "Redirection temporaire.", example: "Connexion reussie -> /dashboard" },
    303: { description: "La reponse a la requete se trouve a une autre URI (toujours GET).", whenToUse: "Apres un POST, rediriger vers la page de confirmation avec GET.", example: "POST /order -> 303 -> GET /order/123" },
    304: { description: "La ressource n'a pas change depuis la derniere requete.", whenToUse: "Mise en cache des ressources (ETag/If-Modified-Since).", example: "Fichiers statiques (CSS/JS)" },
    307: { description: "Redirection temporaire en preservant la methode HTTP d'origine.", whenToUse: "Rediriger un POST vers une autre URL sans changer en GET.", example: "Proxy de microservices" },
    308: { description: "Redirection permanente en preservant la methode HTTP d'origine.", whenToUse: "Changement definitif d'URL pour un endpoint d'ecriture.", example: "API Versioning migration" },

    // 4xx Client Error
    400: { description: "Le serveur ne peut pas traiter la requete en raison d'une erreur du client.", whenToUse: "Entree invalide, JSON mal forme, parametres manquants.", example: "POST avec body invalide -> 400" },
    401: { description: "L'authentification est requise pour acceder a la ressource.", whenToUse: "Token expire, identifiants manquants.", example: "GET /api/me sans token -> 401" },
    402: { description: "Reserve pour un usage futur. Indique qu'un paiement est requis.", whenToUse: "APIs payantes, abonnements expires, credits epuises.", example: "API avec forfait gratuit epuise -> 402" },
    403: { description: "Le client n'a pas la permission d'acceder a la ressource demandee.", whenToUse: "Utilisateur authentifie sans role Admin.", example: "Utilisateur normal tentant de supprimer la DB" },
    404: { description: "La ressource demandee n'existe pas sur le serveur.", whenToUse: "URL incorrecte, ressource supprimee.", example: "GET /api/users/999 -> 404" },
    405: { description: "La methode HTTP n'est pas autorisee pour cette ressource.", whenToUse: "POST sur une URL qui n'accepte que GET.", example: "POST /robots.txt" },
    406: { description: "Le serveur ne peut pas produire de reponse compatible avec les en-tetes Accept du client.", whenToUse: "Le client demande du XML mais le serveur ne produit que du JSON.", example: "Accept: application/xml -> 406" },
    407: { description: "L'authentification aupres du proxy est requise.", whenToUse: "Proxy d'entreprise necessitant des identifiants.", example: "Proxy d'entreprise sans auth -> 407" },
    408: { description: "Le serveur a expire en attendant la requete du client.", whenToUse: "Le client envoie des donnees trop lentement, connexion inactive.", example: "Upload lent qui expire -> 408" },
    409: { description: "La requete n'a pas pu etre completee en raison d'un conflit sur le serveur.", whenToUse: "Creation d'un utilisateur qui existe deja par email.", example: "Cle unique en double dans la DB" },
    410: { description: "La ressource existait mais n'est plus disponible de facon permanente.", whenToUse: "Ressources supprimees volontairement (offres expirees).", example: "Offre d'emploi deja cloturee" },
    411: { description: "Le serveur refuse la requete car l'en-tete Content-Length est manquant.", whenToUse: "APIs necessitant de connaitre la taille du corps avant traitement.", example: "PUT sans Content-Length -> 411" },
    412: { description: "Les preconditions de l'en-tete n'ont pas ete remplies.", whenToUse: "If-Match avec ETag obsolete (verrouillage optimiste).", example: "PUT avec If-Match incorrect -> 412" },
    413: { description: "Le corps de la requete depasse la limite du serveur.", whenToUse: "Upload de fichier depassant la taille maximale autorisee.", example: "Upload 100Mo sur serveur avec limite 10Mo -> 413" },
    414: { description: "L'URI de la requete est trop longue pour le serveur.", whenToUse: "Chaines de requete extremement longues.", example: "GET /search?q=... (10K chars) -> 414" },
    415: { description: "Le type de media de la requete n'est pas supporte.", whenToUse: "Envoi de XML quand l'API n'accepte que le JSON.", example: "Content-Type: text/xml -> 415" },
    416: { description: "La plage demandee ne peut pas etre satisfaite.", whenToUse: "Demande d'octets au-dela de la taille du fichier.", example: "Range: bytes=9999-10000 sur fichier de 100 octets -> 416" },
    417: { description: "Le serveur ne peut pas satisfaire les exigences de l'en-tete Expect.", whenToUse: "Le serveur ne supporte pas Expect: 100-continue.", example: "Expect: 100-continue rejete -> 417" },
    418: { description: "Le serveur est une theiere et ne peut pas preparer de cafe (RFC 2324).", whenToUse: "Easter egg, health checks humoristiques.", example: "GET /coffee -> 418" },
    421: { description: "La requete a ete dirigee vers un serveur qui ne peut pas produire de reponse.", whenToUse: "HTTP/2 : requete envoyee a un serveur avec un certificat incorrect.", example: "SNI mismatch en HTTP/2 -> 421" },
    422: { description: "La requete est bien formee mais contient des erreurs semantiques.", whenToUse: "Validation : JSON valide mais donnees invalides (email mal forme).", example: "POST {\"email\": \"pas-un-email\"} -> 422" },
    423: { description: "La ressource est verrouillee.", whenToUse: "WebDAV : ressource verrouillee pour edition.", example: "PUT sur fichier verrouille -> 423" },
    424: { description: "La requete a echoue car elle dependait d'une autre operation qui a echoue.", whenToUse: "WebDAV : echec en cascade d'operations.", example: "COPY dependant d'un LOCK echoue -> 424" },
    425: { description: "Le serveur ne traitera pas la requete car elle pourrait etre rejouee.", whenToUse: "TLS Early Data (0-RTT) avec risque de rejeu.", example: "POST avec TLS 0-RTT -> 425" },
    426: { description: "Le client doit passer a un protocole different.", whenToUse: "Le serveur exige TLS ou HTTP/2.", example: "HTTP/1.0 -> Upgrade vers HTTP/1.1 -> 426" },
    428: { description: "Le serveur exige que la requete inclue des preconditions.", whenToUse: "API qui exige If-Match pour prevenir les conflits d'edition.", example: "PUT sans If-Match -> 428" },
    429: { description: "Le client a envoye trop de requetes dans un laps de temps donne.", whenToUse: "Limitation de debit, throttling d'API.", example: "100 req/min depasse -> 429" },
    431: { description: "Les champs d'en-tete de la requete sont trop volumineux.", whenToUse: "Cookies excessifs, en-tetes personnalises enormes.", example: "Cookie de 8Ko -> 431" },
    451: { description: "La ressource est indisponible pour des raisons legales.", whenToUse: "DMCA, RGPD, censure gouvernementale.", example: "Contenu bloque par la loi -> 451" },

    // 5xx Server Error
    500: { description: "Erreur generique du serveur.", whenToUse: "Erreur non geree, exception inattendue.", example: "NullPointerException -> 500" },
    501: { description: "Le serveur ne reconnait pas la methode de requete ou ne peut pas la traiter.", whenToUse: "Methode HTTP non implementee (PATCH sur serveur ancien).", example: "PATCH sur API sans support -> 501" },
    502: { description: "Le serveur agissant comme proxy a recu une reponse invalide.", whenToUse: "Nginx ne peut pas communiquer avec le microservice.", example: "Upstream server is down" },
    503: { description: "Le serveur ne peut pas traiter la requete (surcharge ou maintenance).", whenToUse: "Maintenance programmee.", example: "Downtime pour mise a jour" },
    504: { description: "Le serveur agissant comme proxy n'a pas recu de reponse a temps.", whenToUse: "Le microservice met trop de temps a repondre.", example: "Requete lourde qui fait expirer le proxy" },
    505: { description: "Le serveur ne supporte pas la version HTTP utilisee.", whenToUse: "Client utilisant HTTP/0.9 sur un serveur moderne.", example: "HTTP/0.9 -> 505" },
    506: { description: "Erreur de configuration : la variante choisie negocie aussi le contenu.", whenToUse: "Erreur de configuration de negociation de contenu.", example: "Negociation circulaire -> 506" },
    507: { description: "Le serveur n'a pas assez d'espace pour completer la requete.", whenToUse: "Disque plein sur serveur WebDAV.", example: "Upload sur disque plein -> 507" },
    508: { description: "Le serveur a detecte une boucle infinie lors du traitement de la requete.", whenToUse: "Reference circulaire dans WebDAV.", example: "Lien symbolique circulaire -> 508" },
    510: { description: "Des extensions supplementaires sont necessaires pour satisfaire la requete.", whenToUse: "Extensions HTTP supplementaires requises.", example: "Extension HTTP non fournie -> 510" },
    511: { description: "L'authentification reseau est requise pour acceder.", whenToUse: "Portail captif WiFi.", example: "WiFi d'hotel -> 511" },
  },
  pt: {
    // 1xx Informational
    100: { description: "O servidor recebeu os cabecalhos e o cliente pode continuar enviando o corpo.", whenToUse: "Requisicoes grandes com Expect: 100-continue.", example: "POST com arquivo grande" },
    101: { description: "O servidor aceita trocar de protocolo conforme solicitado.", whenToUse: "Ao fazer upgrade de HTTP para WebSocket.", example: "Upgrade: websocket" },
    102: { description: "O servidor recebeu a requisicao e esta processando, mas nenhuma resposta esta disponivel ainda.", whenToUse: "Operacoes WebDAV demoradas.", example: "WebDAV COPY/MOVE" },
    103: { description: "Permite ao cliente pre-carregar recursos enquanto o servidor prepara a resposta.", whenToUse: "Envio antecipado de cabecalhos Link para pre-carregamento.", example: "Link: </style.css>; rel=preload" },

    // 2xx Success
    200: { description: "A requisicao foi bem-sucedida.", whenToUse: "Resposta padrao para GET, POST, PUT bem-sucedidos.", example: "GET /api/users -> 200" },
    201: { description: "A requisicao foi bem-sucedida e um novo recurso foi criado.", whenToUse: "Apos criar um recurso com POST.", example: "POST /api/users -> 201" },
    202: { description: "A requisicao foi aceita para processamento mas ainda nao foi concluida.", whenToUse: "Operacoes assincronas (filas, jobs, emails).", example: "POST /api/reports/generate -> 202" },
    203: { description: "A resposta foi modificada por um proxy intermediario.", whenToUse: "Proxy que transforma a resposta de origem.", example: "CDN com cabecalhos modificados" },
    204: { description: "Requisicao bem-sucedida mas sem conteudo a retornar.", whenToUse: "DELETE bem-sucedido ou PUT que nao retorna o objeto.", example: "DELETE /api/users/1 -> 204" },
    205: { description: "O servidor processou a requisicao e pede ao cliente para redefinir a visualizacao.", whenToUse: "Apos enviar um formulario, redefinir os campos.", example: "POST /form -> 205 (limpar formulario)" },
    206: { description: "O servidor envia apenas uma parte do recurso (faixa solicitada).", whenToUse: "Download parcial, streaming de video/audio.", example: "Range: bytes=0-1023 -> 206" },
    207: { description: "Resposta XML com multiplos codigos de status para operacoes em lote.", whenToUse: "Operacoes WebDAV em multiplos recursos.", example: "PROPFIND multi-recurso -> 207" },
    208: { description: "Os membros de um binding DAV ja foram enumerados anteriormente.", whenToUse: "Evitar duplicatas nas respostas WebDAV.", example: "WebDAV com bindings -> 208" },
    226: { description: "O servidor atendeu a requisicao GET e a resposta e uma representacao delta.", whenToUse: "Codificacao delta com Instance Manipulations.", example: "GET com A-IM: feed -> 226" },

    // 3xx Redirection
    300: { description: "Existem multiplas opcoes para o recurso solicitado.", whenToUse: "Recurso disponivel em varios formatos (JSON, XML, PDF).", example: "GET /report -> 300 (JSON ou PDF)" },
    301: { description: "O recurso foi movido permanentemente para uma nova URI.", whenToUse: "Migracao definitiva de URLs.", example: "http -> https redirect" },
    302: { description: "O recurso se encontra temporariamente em outra URI.", whenToUse: "Redirecionamento temporario.", example: "Login bem-sucedido -> /dashboard" },
    303: { description: "A resposta a requisicao pode ser encontrada em outra URI (sempre GET).", whenToUse: "Apos POST, redirecionar para pagina de confirmacao com GET.", example: "POST /order -> 303 -> GET /order/123" },
    304: { description: "O recurso nao foi modificado desde a ultima requisicao.", whenToUse: "Cache de recursos (ETag/If-Modified-Since).", example: "Arquivos estaticos (CSS/JS)" },
    307: { description: "Redirecionamento temporario preservando o metodo HTTP original.", whenToUse: "Redirecionar um POST para outra URL sem mudar para GET.", example: "Proxy de microsservicos" },
    308: { description: "Redirecionamento permanente preservando o metodo HTTP original.", whenToUse: "Mudanca definitiva de URL para um endpoint de escrita.", example: "API Versioning migration" },

    // 4xx Client Error
    400: { description: "O servidor nao pode processar a requisicao devido a um erro do cliente.", whenToUse: "Entrada invalida, JSON mal formado, parametros ausentes.", example: "POST com body invalido -> 400" },
    401: { description: "Autenticacao e necessaria para acessar o recurso.", whenToUse: "Token expirado, credenciais ausentes.", example: "GET /api/me sem token -> 401" },
    402: { description: "Reservado para uso futuro. Indica que pagamento e necessario.", whenToUse: "APIs pagas, assinaturas expiradas, creditos esgotados.", example: "API com plano gratuito esgotado -> 402" },
    403: { description: "O cliente nao tem permissao para o recurso solicitado.", whenToUse: "Usuario autenticado sem papel de Admin.", example: "Usuario normal tentando deletar DB" },
    404: { description: "O recurso solicitado nao existe no servidor.", whenToUse: "URL incorreta, recurso excluido.", example: "GET /api/users/999 -> 404" },
    405: { description: "O metodo HTTP nao e permitido para este recurso.", whenToUse: "POST em uma URL que so aceita GET.", example: "POST /robots.txt" },
    406: { description: "O servidor nao pode produzir uma resposta compativel com os cabecalhos Accept do cliente.", whenToUse: "Cliente pede XML mas servidor so produz JSON.", example: "Accept: application/xml -> 406" },
    407: { description: "Autenticacao junto ao proxy e necessaria.", whenToUse: "Proxy corporativo que requer credenciais.", example: "Proxy empresarial sem auth -> 407" },
    408: { description: "O servidor expirou aguardando a requisicao do cliente.", whenToUse: "Cliente envia dados muito lentamente, conexao inativa.", example: "Upload lento que expira -> 408" },
    409: { description: "A requisicao nao pude ser concluida devido a um conflito no servidor.", whenToUse: "Criar um usuario que ja existe por email.", example: "Chave unica duplicada no DB" },
    410: { description: "O recurso existia mas nao esta mais disponivel permanentemente.", whenToUse: "Recursos excluidos propositalmente (ofertas expiradas).", example: "Vaga de emprego ja encerrada" },
    411: { description: "O servidor rejeita a requisicao porque o cabecalho Content-Length esta ausente.", whenToUse: "APIs que precisam saber o tamanho do corpo antes de processar.", example: "PUT sem Content-Length -> 411" },
    412: { description: "As precondicoes do cabecalho nao foram atendidas.", whenToUse: "If-Match com ETag desatualizado (bloqueio otimista).", example: "PUT com If-Match incorreto -> 412" },
    413: { description: "O corpo da requisicao excede o limite do servidor.", whenToUse: "Upload de arquivo maior que o maximo permitido.", example: "Upload 100MB em servidor com limite 10MB -> 413" },
    414: { description: "A URI da requisicao e muito longa para o servidor.", whenToUse: "Strings de consulta extremamente longas.", example: "GET /search?q=... (10K chars) -> 414" },
    415: { description: "O tipo de midia da requisicao nao e suportado.", whenToUse: "Enviar XML quando a API so aceita JSON.", example: "Content-Type: text/xml -> 415" },
    416: { description: "A faixa solicitada nao pode ser satisfeita.", whenToUse: "Solicitar bytes alem do tamanho do arquivo.", example: "Range: bytes=9999-10000 em arquivo de 100 bytes -> 416" },
    417: { description: "O servidor nao pode atender aos requisitos do cabecalho Expect.", whenToUse: "Servidor nao suporta Expect: 100-continue.", example: "Expect: 100-continue rejeitado -> 417" },
    418: { description: "O servidor e um bule de cha e nao pode preparar cafe (RFC 2324).", whenToUse: "Easter egg, health checks com humor.", example: "GET /coffee -> 418" },
    421: { description: "A requisicao foi direcionada a um servidor que nao pode produzir uma resposta.", whenToUse: "HTTP/2: requisicao enviada a servidor com certificado incorreto.", example: "SNI mismatch em HTTP/2 -> 421" },
    422: { description: "A requisicao esta bem formada mas tem erros semanticos.", whenToUse: "Validacao: JSON valido mas dados invalidos (email mal formado).", example: "POST {\"email\": \"nao-e-email\"} -> 422" },
    423: { description: "O recurso esta bloqueado.", whenToUse: "WebDAV: recurso bloqueado para edicao.", example: "PUT em arquivo bloqueado -> 423" },
    424: { description: "A requisicao falhou porque dependia de outra operacao que falhou.", whenToUse: "WebDAV: falha em cascata de operacoes.", example: "COPY dependendo de LOCK que falhou -> 424" },
    425: { description: "O servidor nao processara a requisicao porque ela pode ser repetida.", whenToUse: "TLS Early Data (0-RTT) com risco de replay.", example: "POST com TLS 0-RTT -> 425" },
    426: { description: "O cliente deve mudar para um protocolo diferente.", whenToUse: "Servidor exige TLS ou HTTP/2.", example: "HTTP/1.0 -> Upgrade para HTTP/1.1 -> 426" },
    428: { description: "O servidor exige que a requisicao inclua precondicoes.", whenToUse: "API que exige If-Match para prevenir conflitos de edicao.", example: "PUT sem If-Match -> 428" },
    429: { description: "O cliente enviou muitas requisicoes em um determinado periodo.", whenToUse: "Limitacao de taxa, throttling de API.", example: "100 req/min excedido -> 429" },
    431: { description: "Os campos de cabecalho da requisicao sao muito grandes.", whenToUse: "Cookies excessivos, cabecalhos personalizados enormes.", example: "Cookie de 8KB -> 431" },
    451: { description: "O recurso esta indisponivel por motivos legais.", whenToUse: "DMCA, LGPD, censura governamental.", example: "Conteudo bloqueado por lei -> 451" },

    // 5xx Server Error
    500: { description: "Erro generico do servidor.", whenToUse: "Erro nao tratado, excecao inesperada.", example: "NullPointerException -> 500" },
    501: { description: "O servidor nao reconhece o metodo de requisicao ou nao pode atende-lo.", whenToUse: "Metodo HTTP nao implementado (PATCH em servidor legado).", example: "PATCH em API sem suporte -> 501" },
    502: { description: "O servidor atuando como proxy recebeu uma resposta invalida.", whenToUse: "Nginx nao consegue comunicar com o microsservico.", example: "Upstream server is down" },
    503: { description: "O servidor nao pode atender a requisicao (sobrecarga ou manutencao).", whenToUse: "Manutencao programada.", example: "Downtime para atualizacao" },
    504: { description: "O servidor atuando como proxy nao recebeu resposta a tempo.", whenToUse: "Microsservico demora demais para responder.", example: "Consulta pesada que expira o proxy" },
    505: { description: "O servidor nao suporta a versao HTTP utilizada.", whenToUse: "Cliente usando HTTP/0.9 em servidor moderno.", example: "HTTP/0.9 -> 505" },
    506: { description: "Erro de configuracao: a variante escolhida tambem negocia conteudo.", whenToUse: "Erro de configuracao de negociacao de conteudo.", example: "Negociacao circular -> 506" },
    507: { description: "O servidor nao tem espaco suficiente para completar a requisicao.", whenToUse: "Disco cheio em servidor WebDAV.", example: "Upload para disco cheio -> 507" },
    508: { description: "O servidor detectou um loop infinito ao processar a requisicao.", whenToUse: "Referencia circular no WebDAV.", example: "Symlink circular -> 508" },
    510: { description: "Extensoes adicionais sao necessarias para atender a requisicao.", whenToUse: "Extensoes HTTP adicionais necessarias.", example: "Extensao HTTP nao fornecida -> 510" },
    511: { description: "Autenticacao de rede e necessaria para obter acesso.", whenToUse: "Portal cativo de WiFi.", example: "WiFi de hotel -> 511" },
  },
  de: {
    // 1xx Informational
    100: { description: "Der Server hat die Header empfangen und der Client kann mit dem Senden des Bodys fortfahren.", whenToUse: "Grosse Anfragen mit Expect: 100-continue.", example: "POST mit grosser Datei" },
    101: { description: "Der Server akzeptiert den Protokollwechsel wie angefordert.", whenToUse: "Beim Upgrade von HTTP auf WebSocket.", example: "Upgrade: websocket" },
    102: { description: "Der Server hat die Anfrage empfangen und verarbeitet sie, aber es ist noch keine Antwort verfuegbar.", whenToUse: "Lange WebDAV-Operationen.", example: "WebDAV COPY/MOVE" },
    103: { description: "Ermoeglicht dem Client, Ressourcen vorab zu laden, waehrend der Server die Antwort vorbereitet.", whenToUse: "Fruehzeitiges Senden von Link-Headern fuer Preload.", example: "Link: </style.css>; rel=preload" },

    // 2xx Success
    200: { description: "Die Anfrage war erfolgreich.", whenToUse: "Standardantwort fuer erfolgreiche GET-, POST-, PUT-Anfragen.", example: "GET /api/users -> 200" },
    201: { description: "Die Anfrage war erfolgreich und eine neue Ressource wurde erstellt.", whenToUse: "Nach dem Erstellen einer Ressource mit POST.", example: "POST /api/users -> 201" },
    202: { description: "Die Anfrage wurde zur Verarbeitung angenommen, aber noch nicht abgeschlossen.", whenToUse: "Asynchrone Operationen (Warteschlangen, Jobs, E-Mails).", example: "POST /api/reports/generate -> 202" },
    203: { description: "Die Antwort wurde von einem Zwischen-Proxy modifiziert.", whenToUse: "Proxy, der die Ursprungsantwort transformiert.", example: "CDN mit geaenderten Headern" },
    204: { description: "Erfolgreiche Anfrage, aber kein Inhalt zurueckzugeben.", whenToUse: "Erfolgreiches DELETE oder PUT, das das Objekt nicht zurueckgibt.", example: "DELETE /api/users/1 -> 204" },
    205: { description: "Der Server hat die Anfrage verarbeitet und fordert den Client auf, die Ansicht zurueckzusetzen.", whenToUse: "Nach dem Absenden eines Formulars die Felder zuruecksetzen.", example: "POST /form -> 205 (Formular zuruecksetzen)" },
    206: { description: "Der Server sendet nur einen Teil der Ressource (angeforderter Bereich).", whenToUse: "Teilweiser Download, Video-/Audio-Streaming.", example: "Range: bytes=0-1023 -> 206" },
    207: { description: "XML-Antwort mit mehreren Statuscodes fuer Batch-Operationen.", whenToUse: "WebDAV-Operationen auf mehreren Ressourcen.", example: "PROPFIND Multi-Ressource -> 207" },
    208: { description: "Die Mitglieder einer DAV-Bindung wurden bereits aufgezaehlt.", whenToUse: "Duplikate in WebDAV-Antworten vermeiden.", example: "WebDAV mit Bindungen -> 208" },
    226: { description: "Der Server hat die GET-Anfrage erfuellt und die Antwort ist eine Delta-Darstellung.", whenToUse: "Delta-Kodierung mit Instance Manipulations.", example: "GET mit A-IM: feed -> 226" },

    // 3xx Redirection
    300: { description: "Es gibt mehrere Optionen fuer die angeforderte Ressource.", whenToUse: "Ressource in mehreren Formaten verfuegbar (JSON, XML, PDF).", example: "GET /report -> 300 (JSON oder PDF)" },
    301: { description: "Die Ressource wurde dauerhaft an eine neue URI verschoben.", whenToUse: "Dauerhafte URL-Migration.", example: "http -> https Weiterleitung" },
    302: { description: "Die Ressource befindet sich voruebergehend an einer anderen URI.", whenToUse: "Voruebergehende Weiterleitung.", example: "Erfolgreicher Login -> /dashboard" },
    303: { description: "Die Antwort auf die Anfrage befindet sich an einer anderen URI (immer GET).", whenToUse: "Nach POST auf Bestaetigungsseite mit GET weiterleiten.", example: "POST /order -> 303 -> GET /order/123" },
    304: { description: "Die Ressource hat sich seit der letzten Anfrage nicht geaendert.", whenToUse: "Ressourcen-Caching (ETag/If-Modified-Since).", example: "Statische Dateien (CSS/JS)" },
    307: { description: "Voruebergehende Weiterleitung unter Beibehaltung der urspruenglichen HTTP-Methode.", whenToUse: "POST an eine andere URL weiterleiten ohne auf GET zu wechseln.", example: "Microservices-Proxy" },
    308: { description: "Dauerhafte Weiterleitung unter Beibehaltung der urspruenglichen HTTP-Methode.", whenToUse: "Dauerhafte URL-Aenderung fuer einen Schreib-Endpoint.", example: "API Versioning Migration" },

    // 4xx Client Error
    400: { description: "Der Server kann die Anfrage aufgrund eines Client-Fehlers nicht verarbeiten.", whenToUse: "Ungueltige Eingabe, fehlerhaftes JSON, fehlende Parameter.", example: "POST mit ungueltigem Body -> 400" },
    401: { description: "Authentifizierung ist erforderlich, um auf die Ressource zuzugreifen.", whenToUse: "Abgelaufenes Token, fehlende Anmeldedaten.", example: "GET /api/me ohne Token -> 401" },
    402: { description: "Fuer zukuenftige Nutzung reserviert. Gibt an, dass eine Zahlung erforderlich ist.", whenToUse: "Bezahl-APIs, abgelaufene Abonnements, aufgebrauchte Guthaben.", example: "API mit aufgebrauchtem Gratisplan -> 402" },
    403: { description: "Der Client hat keine Berechtigung fuer die angeforderte Ressource.", whenToUse: "Authentifizierter Benutzer ohne Admin-Rolle.", example: "Normaler Benutzer versucht DB zu loeschen" },
    404: { description: "Die angeforderte Ressource existiert nicht auf dem Server.", whenToUse: "Falsche URL, geloeschte Ressource.", example: "GET /api/users/999 -> 404" },
    405: { description: "Die HTTP-Methode ist fuer diese Ressource nicht erlaubt.", whenToUse: "POST auf eine URL, die nur GET akzeptiert.", example: "POST /robots.txt" },
    406: { description: "Der Server kann keine Antwort erzeugen, die mit den Accept-Headern des Clients kompatibel ist.", whenToUse: "Client fordert XML, aber der Server liefert nur JSON.", example: "Accept: application/xml -> 406" },
    407: { description: "Authentifizierung beim Proxy ist erforderlich.", whenToUse: "Firmen-Proxy, der Anmeldedaten erfordert.", example: "Firmen-Proxy ohne Auth -> 407" },
    408: { description: "Der Server hat beim Warten auf die Anfrage des Clients das Zeitlimit ueberschritten.", whenToUse: "Client sendet Daten zu langsam, inaktive Verbindung.", example: "Langsamer Upload, der ablaeuft -> 408" },
    409: { description: "Die Anfrage konnte wegen eines Konflikts auf dem Server nicht abgeschlossen werden.", whenToUse: "Erstellen eines Benutzers, der bereits per E-Mail existiert.", example: "Doppelter eindeutiger Schluessel in der DB" },
    410: { description: "Die Ressource existierte, ist aber dauerhaft nicht mehr verfuegbar.", whenToUse: "Absichtlich geloeschte Ressourcen (abgelaufene Angebote).", example: "Stellenangebot bereits geschlossen" },
    411: { description: "Der Server lehnt die Anfrage ab, weil der Content-Length-Header fehlt.", whenToUse: "APIs, die die Body-Groesse vor der Verarbeitung kennen muessen.", example: "PUT ohne Content-Length -> 411" },
    412: { description: "Die Header-Vorbedingungen wurden nicht erfuellt.", whenToUse: "If-Match mit veraltetem ETag (optimistisches Sperren).", example: "PUT mit falschem If-Match -> 412" },
    413: { description: "Der Anfrage-Body ueberschreitet das Limit des Servers.", whenToUse: "Datei-Upload groesser als das zulaessige Maximum.", example: "Upload 100MB auf Server mit 10MB-Limit -> 413" },
    414: { description: "Die Anfrage-URI ist fuer den Server zu lang.", whenToUse: "Extrem lange Query-Strings.", example: "GET /search?q=... (10K Zeichen) -> 414" },
    415: { description: "Der Medientyp der Anfrage wird nicht unterstuetzt.", whenToUse: "XML senden, wenn die API nur JSON akzeptiert.", example: "Content-Type: text/xml -> 415" },
    416: { description: "Der angeforderte Bereich kann nicht erfuellt werden.", whenToUse: "Bytes jenseits der Dateigroesse anfordern.", example: "Range: bytes=9999-10000 bei 100-Byte-Datei -> 416" },
    417: { description: "Der Server kann die Anforderungen des Expect-Headers nicht erfuellen.", whenToUse: "Server unterstuetzt Expect: 100-continue nicht.", example: "Expect: 100-continue abgelehnt -> 417" },
    418: { description: "Der Server ist eine Teekanne und kann keinen Kaffee kochen (RFC 2324).", whenToUse: "Easter Egg, humorvolle Health-Checks.", example: "GET /coffee -> 418" },
    421: { description: "Die Anfrage wurde an einen Server gerichtet, der keine Antwort erzeugen kann.", whenToUse: "HTTP/2: Anfrage an Server mit falschem Zertifikat gesendet.", example: "SNI-Mismatch in HTTP/2 -> 421" },
    422: { description: "Die Anfrage ist wohlgeformt, hat aber semantische Fehler.", whenToUse: "Validierung: gueltiges JSON, aber ungueltige Daten (fehlerhafte E-Mail).", example: "POST {\"email\": \"keine-email\"} -> 422" },
    423: { description: "Die Ressource ist gesperrt.", whenToUse: "WebDAV: Ressource zur Bearbeitung gesperrt.", example: "PUT auf gesperrte Datei -> 423" },
    424: { description: "Die Anfrage ist fehlgeschlagen, weil sie von einer anderen fehlgeschlagenen Operation abhing.", whenToUse: "WebDAV: kaskadierende Operationsfehler.", example: "COPY abhaengig von fehlgeschlagenem LOCK -> 424" },
    425: { description: "Der Server wird die Anfrage nicht verarbeiten, da sie wiederholt werden koennte.", whenToUse: "TLS Early Data (0-RTT) mit Replay-Risiko.", example: "POST mit TLS 0-RTT -> 425" },
    426: { description: "Der Client muss zu einem anderen Protokoll wechseln.", whenToUse: "Server erfordert TLS oder HTTP/2.", example: "HTTP/1.0 -> Upgrade auf HTTP/1.1 -> 426" },
    428: { description: "Der Server verlangt, dass die Anfrage Vorbedingungen enthaelt.", whenToUse: "API, die If-Match zur Vermeidung von Bearbeitungskonflikten erfordert.", example: "PUT ohne If-Match -> 428" },
    429: { description: "Der Client hat zu viele Anfragen in einem bestimmten Zeitraum gesendet.", whenToUse: "Ratenbegrenzung, API-Throttling.", example: "100 Req/Min ueberschritten -> 429" },
    431: { description: "Die Header-Felder der Anfrage sind zu gross.", whenToUse: "Uebermassige Cookies, riesige benutzerdefinierte Header.", example: "8KB-Cookie -> 431" },
    451: { description: "Die Ressource ist aus rechtlichen Gruenden nicht verfuegbar.", whenToUse: "DMCA, DSGVO, staatliche Zensur.", example: "Inhalt gesetzlich blockiert -> 451" },

    // 5xx Server Error
    500: { description: "Generischer Serverfehler.", whenToUse: "Nicht behandelter Fehler, unerwartete Ausnahme.", example: "NullPointerException -> 500" },
    501: { description: "Der Server erkennt die Anfragemethode nicht oder kann sie nicht erfuellen.", whenToUse: "HTTP-Methode nicht implementiert (PATCH auf altem Server).", example: "PATCH auf API ohne Support -> 501" },
    502: { description: "Der als Proxy agierende Server hat eine ungueltige Antwort erhalten.", whenToUse: "Nginx kann nicht mit dem Microservice kommunizieren.", example: "Upstream-Server ist ausgefallen" },
    503: { description: "Der Server kann die Anfrage nicht bearbeiten (Ueberlastung oder Wartung).", whenToUse: "Geplante Wartung.", example: "Downtime fuer Update" },
    504: { description: "Der als Proxy agierende Server hat keine rechtzeitige Antwort erhalten.", whenToUse: "Microservice braucht zu lange zum Antworten.", example: "Schwere Abfrage, die den Proxy ablaufen laesst" },
    505: { description: "Der Server unterstuetzt die verwendete HTTP-Version nicht.", whenToUse: "Client verwendet HTTP/0.9 auf modernem Server.", example: "HTTP/0.9 -> 505" },
    506: { description: "Konfigurationsfehler: Die gewaehlte Variante verhandelt ebenfalls Inhalte.", whenToUse: "Fehler in der Content-Negotiation-Konfiguration.", example: "Zirkulaere Aushandlung -> 506" },
    507: { description: "Der Server hat nicht genug Speicherplatz, um die Anfrage abzuschliessen.", whenToUse: "Volle Festplatte auf WebDAV-Server.", example: "Upload auf volle Festplatte -> 507" },
    508: { description: "Der Server hat bei der Verarbeitung der Anfrage eine Endlosschleife erkannt.", whenToUse: "Zirkulaere Referenz in WebDAV.", example: "Zirkulaerer Symlink -> 508" },
    510: { description: "Zusaetzliche Erweiterungen werden benoetigt, um die Anfrage zu erfuellen.", whenToUse: "Zusaetzliche HTTP-Erweiterungen erforderlich.", example: "HTTP-Erweiterung nicht bereitgestellt -> 510" },
    511: { description: "Netzwerk-Authentifizierung ist fuer den Zugang erforderlich.", whenToUse: "Captive-Portal im WLAN.", example: "Hotel-WLAN -> 511" },
  },
  it: {
    // 1xx Informational
    100: { description: "Il server ha ricevuto gli header e il client puo continuare a inviare il body.", whenToUse: "Richieste grandi con Expect: 100-continue.", example: "POST con file di grandi dimensioni" },
    101: { description: "Il server accetta di cambiare protocollo come richiesto.", whenToUse: "Quando si fa l'upgrade da HTTP a WebSocket.", example: "Upgrade: websocket" },
    102: { description: "Il server ha ricevuto la richiesta e la sta elaborando, ma nessuna risposta e ancora disponibile.", whenToUse: "Operazioni WebDAV prolungate.", example: "WebDAV COPY/MOVE" },
    103: { description: "Permette al client di precaricare risorse mentre il server prepara la risposta.", whenToUse: "Invio anticipato di header Link per il precaricamento.", example: "Link: </style.css>; rel=preload" },

    // 2xx Success
    200: { description: "La richiesta e riuscita.", whenToUse: "Risposta standard per GET, POST, PUT riusciti.", example: "GET /api/users -> 200" },
    201: { description: "La richiesta e riuscita e una nuova risorsa e stata creata.", whenToUse: "Dopo la creazione di una risorsa con POST.", example: "POST /api/users -> 201" },
    202: { description: "La richiesta e stata accettata per l'elaborazione ma non e ancora completata.", whenToUse: "Operazioni asincrone (code, job, email).", example: "POST /api/reports/generate -> 202" },
    203: { description: "La risposta e stata modificata da un proxy intermedio.", whenToUse: "Proxy che trasforma la risposta di origine.", example: "CDN con header modificati" },
    204: { description: "Richiesta riuscita ma nessun contenuto da restituire.", whenToUse: "DELETE riuscito o PUT che non restituisce l'oggetto.", example: "DELETE /api/users/1 -> 204" },
    205: { description: "Il server ha elaborato la richiesta e chiede al client di reimpostare la vista.", whenToUse: "Dopo l'invio di un modulo, reimpostare i campi.", example: "POST /form -> 205 (reimpostare modulo)" },
    206: { description: "Il server invia solo una parte della risorsa (intervallo richiesto).", whenToUse: "Download parziale, streaming video/audio.", example: "Range: bytes=0-1023 -> 206" },
    207: { description: "Risposta XML con piu codici di stato per operazioni batch.", whenToUse: "Operazioni WebDAV su piu risorse.", example: "PROPFIND multi-risorsa -> 207" },
    208: { description: "I membri di un binding DAV sono gia stati enumerati.", whenToUse: "Evitare duplicati nelle risposte WebDAV.", example: "WebDAV con binding -> 208" },
    226: { description: "Il server ha soddisfatto la richiesta GET e la risposta e una rappresentazione delta.", whenToUse: "Codifica delta con Instance Manipulations.", example: "GET con A-IM: feed -> 226" },

    // 3xx Redirection
    300: { description: "Esistono piu opzioni per la risorsa richiesta.", whenToUse: "Risorsa disponibile in piu formati (JSON, XML, PDF).", example: "GET /report -> 300 (JSON o PDF)" },
    301: { description: "La risorsa e stata spostata permanentemente a un nuovo URI.", whenToUse: "Migrazione definitiva degli URL.", example: "http -> https redirect" },
    302: { description: "La risorsa si trova temporaneamente a un altro URI.", whenToUse: "Reindirizzamento temporaneo.", example: "Login riuscito -> /dashboard" },
    303: { description: "La risposta alla richiesta si trova a un altro URI (sempre GET).", whenToUse: "Dopo POST, reindirizzare alla pagina di conferma con GET.", example: "POST /order -> 303 -> GET /order/123" },
    304: { description: "La risorsa non e cambiata dall'ultima richiesta.", whenToUse: "Cache delle risorse (ETag/If-Modified-Since).", example: "File statici (CSS/JS)" },
    307: { description: "Reindirizzamento temporaneo preservando il metodo HTTP originale.", whenToUse: "Reindirizzare un POST a un altro URL senza cambiare in GET.", example: "Proxy di microservizi" },
    308: { description: "Reindirizzamento permanente preservando il metodo HTTP originale.", whenToUse: "Cambio definitivo di URL per un endpoint di scrittura.", example: "API Versioning migration" },

    // 4xx Client Error
    400: { description: "Il server non puo elaborare la richiesta a causa di un errore del client.", whenToUse: "Input non valido, JSON malformato, parametri mancanti.", example: "POST con body non valido -> 400" },
    401: { description: "L'autenticazione e necessaria per accedere alla risorsa.", whenToUse: "Token scaduto, credenziali mancanti.", example: "GET /api/me senza token -> 401" },
    402: { description: "Riservato per uso futuro. Indica che il pagamento e necessario.", whenToUse: "API a pagamento, abbonamenti scaduti, crediti esauriti.", example: "API con piano gratuito esaurito -> 402" },
    403: { description: "Il client non ha il permesso per la risorsa richiesta.", whenToUse: "Utente autenticato senza ruolo Admin.", example: "Utente normale che tenta di eliminare il DB" },
    404: { description: "La risorsa richiesta non esiste sul server.", whenToUse: "URL errato, risorsa eliminata.", example: "GET /api/users/999 -> 404" },
    405: { description: "Il metodo HTTP non e consentito per questa risorsa.", whenToUse: "POST su un URL che accetta solo GET.", example: "POST /robots.txt" },
    406: { description: "Il server non puo produrre una risposta compatibile con gli header Accept del client.", whenToUse: "Il client chiede XML ma il server produce solo JSON.", example: "Accept: application/xml -> 406" },
    407: { description: "L'autenticazione presso il proxy e necessaria.", whenToUse: "Proxy aziendale che richiede credenziali.", example: "Proxy aziendale senza auth -> 407" },
    408: { description: "Il server ha esaurito il tempo di attesa per la richiesta del client.", whenToUse: "Il client invia dati troppo lentamente, connessione inattiva.", example: "Upload lento che scade -> 408" },
    409: { description: "La richiesta non puo essere completata a causa di un conflitto sul server.", whenToUse: "Creazione di un utente che esiste gia per email.", example: "Chiave unica duplicata nel DB" },
    410: { description: "La risorsa esisteva ma non e piu disponibile in modo permanente.", whenToUse: "Risorse eliminate volontariamente (offerte scadute).", example: "Offerta di lavoro gia chiusa" },
    411: { description: "Il server rifiuta la richiesta perche manca l'header Content-Length.", whenToUse: "API che devono conoscere la dimensione del body prima dell'elaborazione.", example: "PUT senza Content-Length -> 411" },
    412: { description: "Le precondizioni dell'header non sono state soddisfatte.", whenToUse: "If-Match con ETag obsoleto (blocco ottimistico).", example: "PUT con If-Match errato -> 412" },
    413: { description: "Il corpo della richiesta supera il limite del server.", whenToUse: "Upload di file piu grande del massimo consentito.", example: "Upload 100MB su server con limite 10MB -> 413" },
    414: { description: "L'URI della richiesta e troppo lungo per il server.", whenToUse: "Query string estremamente lunghe.", example: "GET /search?q=... (10K caratteri) -> 414" },
    415: { description: "Il tipo di media della richiesta non e supportato.", whenToUse: "Invio di XML quando l'API accetta solo JSON.", example: "Content-Type: text/xml -> 415" },
    416: { description: "L'intervallo richiesto non puo essere soddisfatto.", whenToUse: "Richiesta di byte oltre la dimensione del file.", example: "Range: bytes=9999-10000 su file di 100 byte -> 416" },
    417: { description: "Il server non puo soddisfare i requisiti dell'header Expect.", whenToUse: "Il server non supporta Expect: 100-continue.", example: "Expect: 100-continue rifiutato -> 417" },
    418: { description: "Il server e una teiera e non puo preparare il caffe (RFC 2324).", whenToUse: "Easter egg, health check umoristici.", example: "GET /coffee -> 418" },
    421: { description: "La richiesta e stata diretta a un server che non puo produrre una risposta.", whenToUse: "HTTP/2: richiesta inviata a server con certificato errato.", example: "SNI mismatch in HTTP/2 -> 421" },
    422: { description: "La richiesta e ben formata ma ha errori semantici.", whenToUse: "Validazione: JSON valido ma dati non validi (email malformata).", example: "POST {\"email\": \"non-una-email\"} -> 422" },
    423: { description: "La risorsa e bloccata.", whenToUse: "WebDAV: risorsa bloccata per la modifica.", example: "PUT su file bloccato -> 423" },
    424: { description: "La richiesta e fallita perche dipendeva da un'altra operazione fallita.", whenToUse: "WebDAV: fallimento a cascata delle operazioni.", example: "COPY dipendente da LOCK fallito -> 424" },
    425: { description: "Il server non elaborera la richiesta perche potrebbe essere riprodotta.", whenToUse: "TLS Early Data (0-RTT) con rischio di replay.", example: "POST con TLS 0-RTT -> 425" },
    426: { description: "Il client deve passare a un protocollo diverso.", whenToUse: "Il server richiede TLS o HTTP/2.", example: "HTTP/1.0 -> Upgrade a HTTP/1.1 -> 426" },
    428: { description: "Il server richiede che la richiesta includa precondizioni.", whenToUse: "API che richiede If-Match per prevenire conflitti di modifica.", example: "PUT senza If-Match -> 428" },
    429: { description: "Il client ha inviato troppe richieste in un determinato periodo.", whenToUse: "Limitazione della frequenza, throttling dell'API.", example: "100 req/min superato -> 429" },
    431: { description: "I campi header della richiesta sono troppo grandi.", whenToUse: "Cookie eccessivi, header personalizzati enormi.", example: "Cookie da 8KB -> 431" },
    451: { description: "La risorsa non e disponibile per motivi legali.", whenToUse: "DMCA, GDPR, censura governativa.", example: "Contenuto bloccato dalla legge -> 451" },

    // 5xx Server Error
    500: { description: "Errore generico del server.", whenToUse: "Errore non gestito, eccezione imprevista.", example: "NullPointerException -> 500" },
    501: { description: "Il server non riconosce il metodo di richiesta o non puo soddisfarlo.", whenToUse: "Metodo HTTP non implementato (PATCH su server legacy).", example: "PATCH su API senza supporto -> 501" },
    502: { description: "Il server che agisce come proxy ha ricevuto una risposta non valida.", whenToUse: "Nginx non riesce a comunicare con il microservizio.", example: "Upstream server is down" },
    503: { description: "Il server non puo gestire la richiesta (sovraccarico o manutenzione).", whenToUse: "Manutenzione programmata.", example: "Downtime per aggiornamento" },
    504: { description: "Il server che agisce come proxy non ha ricevuto risposta in tempo.", whenToUse: "Il microservizio impiega troppo tempo a rispondere.", example: "Query pesante che fa scadere il proxy" },
    505: { description: "Il server non supporta la versione HTTP utilizzata.", whenToUse: "Client che usa HTTP/0.9 su server moderno.", example: "HTTP/0.9 -> 505" },
    506: { description: "Errore di configurazione: la variante scelta negozia anch'essa il contenuto.", whenToUse: "Errore di configurazione della negoziazione dei contenuti.", example: "Negoziazione circolare -> 506" },
    507: { description: "Il server non ha spazio sufficiente per completare la richiesta.", whenToUse: "Disco pieno su server WebDAV.", example: "Upload su disco pieno -> 507" },
    508: { description: "Il server ha rilevato un ciclo infinito durante l'elaborazione della richiesta.", whenToUse: "Riferimento circolare in WebDAV.", example: "Symlink circolare -> 508" },
    510: { description: "Sono necessarie estensioni aggiuntive per soddisfare la richiesta.", whenToUse: "Estensioni HTTP aggiuntive richieste.", example: "Estensione HTTP non fornita -> 510" },
    511: { description: "L'autenticazione di rete e necessaria per ottenere l'accesso.", whenToUse: "Portale captive WiFi.", example: "WiFi dell'hotel -> 511" },
  },
  zh: {
    // 1xx Informational
    100: { description: "服务器已收到请求头，客户端可以继续发送请求体。", whenToUse: "使用 Expect: 100-continue 的大型请求。", example: "POST 大文件" },
    101: { description: "服务器接受按要求切换协议。", whenToUse: "从 HTTP 升级到 WebSocket 时。", example: "Upgrade: websocket" },
    102: { description: "服务器已收到请求并正在处理，但尚无可用响应。", whenToUse: "长时间运行的 WebDAV 操作。", example: "WebDAV COPY/MOVE" },
    103: { description: "允许客户端在服务器准备响应时预加载资源。", whenToUse: "提前发送 Link 头用于预加载。", example: "Link: </style.css>; rel=preload" },

    // 2xx Success
    200: { description: "请求成功。", whenToUse: "成功的 GET、POST、PUT 的标准响应。", example: "GET /api/users -> 200" },
    201: { description: "请求成功并创建了新资源。", whenToUse: "使用 POST 创建资源后。", example: "POST /api/users -> 201" },
    202: { description: "请求已被接受处理，但尚未完成。", whenToUse: "异步操作（队列、作业、邮件）。", example: "POST /api/reports/generate -> 202" },
    203: { description: "响应已被中间代理修改。", whenToUse: "转换源响应的代理。", example: "CDN 修改了响应头" },
    204: { description: "请求成功但没有内容返回。", whenToUse: "成功的 DELETE 或不返回对象的 PUT。", example: "DELETE /api/users/1 -> 204" },
    205: { description: "服务器处理了请求并要求客户端重置视图。", whenToUse: "提交表单后重置字段。", example: "POST /form -> 205（清除表单）" },
    206: { description: "服务器仅发送资源的一部分（请求的范围）。", whenToUse: "部分下载、视频/音频流。", example: "Range: bytes=0-1023 -> 206" },
    207: { description: "包含多个状态码的 XML 响应，用于批量操作。", whenToUse: "对多个资源的 WebDAV 操作。", example: "PROPFIND 多资源 -> 207" },
    208: { description: "DAV 绑定的成员已被先前枚举。", whenToUse: "避免 WebDAV 响应中的重复。", example: "WebDAV 绑定 -> 208" },
    226: { description: "服务器已满足 GET 请求，响应是增量表示。", whenToUse: "使用 Instance Manipulations 的增量编码。", example: "GET A-IM: feed -> 226" },

    // 3xx Redirection
    300: { description: "请求的资源有多个选项。", whenToUse: "资源以多种格式提供（JSON、XML、PDF）。", example: "GET /report -> 300（JSON 或 PDF）" },
    301: { description: "资源已被永久移动到新的 URI。", whenToUse: "永久 URL 迁移。", example: "http -> https 重定向" },
    302: { description: "资源临时位于另一个 URI。", whenToUse: "临时重定向。", example: "登录成功 -> /dashboard" },
    303: { description: "请求的响应可在另一个 URI 找到（始终使用 GET）。", whenToUse: "POST 后使用 GET 重定向到确认页面。", example: "POST /order -> 303 -> GET /order/123" },
    304: { description: "资源自上次请求以来未更改。", whenToUse: "资源缓存（ETag/If-Modified-Since）。", example: "静态文件（CSS/JS）" },
    307: { description: "保留原始 HTTP 方法的临时重定向。", whenToUse: "将 POST 重定向到另一个 URL 而不更改为 GET。", example: "微服务代理" },
    308: { description: "保留原始 HTTP 方法的永久重定向。", whenToUse: "写入端点的永久 URL 更改。", example: "API 版本迁移" },

    // 4xx Client Error
    400: { description: "由于客户端错误，服务器无法处理请求。", whenToUse: "无效输入、格式错误的 JSON、缺少参数。", example: "POST 无效 body -> 400" },
    401: { description: "访问资源需要身份验证。", whenToUse: "令牌过期、缺少凭据。", example: "GET /api/me 无 token -> 401" },
    402: { description: "保留供将来使用。表示需要付款。", whenToUse: "付费 API、过期订阅、耗尽的额度。", example: "API 免费额度已用完 -> 402" },
    403: { description: "客户端没有请求资源的权限。", whenToUse: "已认证用户但没有管理员角色。", example: "普通用户尝试删除数据库" },
    404: { description: "请求的资源在服务器上不存在。", whenToUse: "错误的 URL、已删除的资源。", example: "GET /api/users/999 -> 404" },
    405: { description: "该资源不允许使用此 HTTP 方法。", whenToUse: "在只接受 GET 的 URL 上使用 POST。", example: "POST /robots.txt" },
    406: { description: "服务器无法生成与客户端 Accept 头匹配的响应。", whenToUse: "客户端请求 XML 但服务器只生成 JSON。", example: "Accept: application/xml -> 406" },
    407: { description: "需要通过代理进行身份验证。", whenToUse: "需要凭据的企业代理。", example: "企业代理无认证 -> 407" },
    408: { description: "服务器等待客户端请求超时。", whenToUse: "客户端发送数据太慢、空闲连接。", example: "慢速上传超时 -> 408" },
    409: { description: "由于服务器上的冲突，请求无法完成。", whenToUse: "创建已通过邮箱存在的用户。", example: "数据库中重复的唯一键" },
    410: { description: "资源曾经存在但已永久不可用。", whenToUse: "故意删除的资源（已过期的优惠）。", example: "已关闭的招聘信息" },
    411: { description: "服务器拒绝请求，因为缺少 Content-Length 头。", whenToUse: "需要在处理前知道请求体大小的 API。", example: "PUT 无 Content-Length -> 411" },
    412: { description: "请求头中的前提条件未满足。", whenToUse: "If-Match 使用过时的 ETag（乐观锁定）。", example: "PUT If-Match 不正确 -> 412" },
    413: { description: "请求体超出了服务器的限制。", whenToUse: "文件上传超过允许的最大值。", example: "在 10MB 限制的服务器上传 100MB -> 413" },
    414: { description: "请求 URI 对服务器来说太长。", whenToUse: "极长的查询字符串。", example: "GET /search?q=...（10K 字符）-> 414" },
    415: { description: "不支持请求的媒体类型。", whenToUse: "在仅接受 JSON 的 API 上发送 XML。", example: "Content-Type: text/xml -> 415" },
    416: { description: "无法满足请求的范围。", whenToUse: "请求超出文件大小的字节范围。", example: "Range: bytes=9999-10000 100 字节文件 -> 416" },
    417: { description: "服务器无法满足 Expect 头的要求。", whenToUse: "服务器不支持 Expect: 100-continue。", example: "Expect: 100-continue 被拒绝 -> 417" },
    418: { description: "服务器是一个茶壶，无法冲泡咖啡（RFC 2324）。", whenToUse: "彩蛋、幽默的健康检查。", example: "GET /coffee -> 418" },
    421: { description: "请求被发送到无法生成响应的服务器。", whenToUse: "HTTP/2：请求发送到证书不正确的服务器。", example: "HTTP/2 SNI 不匹配 -> 421" },
    422: { description: "请求格式正确但存在语义错误。", whenToUse: "验证：有效的 JSON 但数据无效（格式错误的邮箱）。", example: "POST {\"email\": \"不是邮箱\"} -> 422" },
    423: { description: "资源已被锁定。", whenToUse: "WebDAV：资源被锁定以进行编辑。", example: "PUT 锁定的文件 -> 423" },
    424: { description: "请求因依赖的另一个操作失败而失败。", whenToUse: "WebDAV：级联操作失败。", example: "COPY 依赖于失败的 LOCK -> 424" },
    425: { description: "服务器不会处理该请求因为它可能被重放。", whenToUse: "TLS Early Data（0-RTT）存在重放风险。", example: "POST TLS 0-RTT -> 425" },
    426: { description: "客户端必须切换到不同的协议。", whenToUse: "服务器要求 TLS 或 HTTP/2。", example: "HTTP/1.0 -> 升级到 HTTP/1.1 -> 426" },
    428: { description: "服务器要求请求包含前提条件。", whenToUse: "要求 If-Match 以防止编辑冲突的 API。", example: "PUT 无 If-Match -> 428" },
    429: { description: "客户端在指定时间内发送了太多请求。", whenToUse: "速率限制、API 限流。", example: "100 请求/分钟已超出 -> 429" },
    431: { description: "请求的头字段太大。", whenToUse: "过多的 Cookie、巨大的自定义头。", example: "8KB Cookie -> 431" },
    451: { description: "出于法律原因，资源不可用。", whenToUse: "DMCA、GDPR、政府审查。", example: "内容因法律被封锁 -> 451" },

    // 5xx Server Error
    500: { description: "通用服务器错误。", whenToUse: "未处理的错误、意外异常。", example: "NullPointerException -> 500" },
    501: { description: "服务器无法识别请求方法或无法完成请求。", whenToUse: "未实现的 HTTP 方法（旧服务器上的 PATCH）。", example: "PATCH 无支持的 API -> 501" },
    502: { description: "作为代理的服务器收到了无效响应。", whenToUse: "Nginx 无法与微服务通信。", example: "上游服务器宕机" },
    503: { description: "服务器无法处理请求（过载或维护）。", whenToUse: "计划维护。", example: "更新停机" },
    504: { description: "作为代理的服务器未及时收到响应。", whenToUse: "微服务响应时间过长。", example: "繁重查询导致代理超时" },
    505: { description: "服务器不支持所使用的 HTTP 版本。", whenToUse: "客户端在现代服务器上使用 HTTP/0.9。", example: "HTTP/0.9 -> 505" },
    506: { description: "配置错误：所选变体也在进行内容协商。", whenToUse: "内容协商配置错误。", example: "循环协商 -> 506" },
    507: { description: "服务器没有足够的存储空间来完成请求。", whenToUse: "WebDAV 服务器磁盘已满。", example: "上传到已满的磁盘 -> 507" },
    508: { description: "服务器在处理请求时检测到无限循环。", whenToUse: "WebDAV 中的循环引用。", example: "循环符号链接 -> 508" },
    510: { description: "需要额外的扩展来满足请求。", whenToUse: "需要额外的 HTTP 扩展。", example: "未提供 HTTP 扩展 -> 510" },
    511: { description: "需要网络身份验证才能访问。", whenToUse: "WiFi 强制门户。", example: "酒店 WiFi -> 511" },
  },
  ja: {
    // 1xx Informational
    100: { description: "サーバーはヘッダーを受信し、クライアントはボディの送信を続行できます。", whenToUse: "Expect: 100-continue を使用した大きなリクエスト。", example: "POST 大容量ファイル" },
    101: { description: "サーバーは要求に応じてプロトコルの切り替えを受け入れます。", whenToUse: "HTTP から WebSocket へのアップグレード時。", example: "Upgrade: websocket" },
    102: { description: "サーバーはリクエストを受信し処理中ですが、まだレスポンスはありません。", whenToUse: "長時間の WebDAV 操作。", example: "WebDAV COPY/MOVE" },
    103: { description: "サーバーがレスポンスを準備している間に、クライアントがリソースをプリロードできるようにします。", whenToUse: "プリロード用の早期 Link ヘッダー送信。", example: "Link: </style.css>; rel=preload" },

    // 2xx Success
    200: { description: "リクエストは成功しました。", whenToUse: "成功した GET、POST、PUT の標準レスポンス。", example: "GET /api/users -> 200" },
    201: { description: "リクエストは成功し、新しいリソースが作成されました。", whenToUse: "POST でリソースを作成した後。", example: "POST /api/users -> 201" },
    202: { description: "リクエストは処理のために受け付けられましたが、まだ完了していません。", whenToUse: "非同期操作（キュー、ジョブ、メール）。", example: "POST /api/reports/generate -> 202" },
    203: { description: "レスポンスは中間プロキシによって変更されました。", whenToUse: "元のレスポンスを変換するプロキシ。", example: "CDN によるヘッダー変更" },
    204: { description: "リクエストは成功しましたが、返すコンテンツがありません。", whenToUse: "成功した DELETE またはオブジェクトを返さない PUT。", example: "DELETE /api/users/1 -> 204" },
    205: { description: "サーバーはリクエストを処理し、クライアントにビューのリセットを要求します。", whenToUse: "フォーム送信後にフィールドをリセット。", example: "POST /form -> 205（フォームクリア）" },
    206: { description: "サーバーはリソースの一部のみを送信します（要求された範囲）。", whenToUse: "部分ダウンロード、動画/音声ストリーミング。", example: "Range: bytes=0-1023 -> 206" },
    207: { description: "バッチ操作用の複数のステータスコードを含む XML レスポンス。", whenToUse: "複数リソースに対する WebDAV 操作。", example: "PROPFIND マルチリソース -> 207" },
    208: { description: "DAV バインディングのメンバーは既に列挙済みです。", whenToUse: "WebDAV レスポンスでの重複回避。", example: "WebDAV バインディング -> 208" },
    226: { description: "サーバーは GET リクエストを満たし、レスポンスはデルタ表現です。", whenToUse: "Instance Manipulations によるデルタエンコーディング。", example: "GET A-IM: feed -> 226" },

    // 3xx Redirection
    300: { description: "要求されたリソースには複数の選択肢があります。", whenToUse: "リソースが複数のフォーマットで利用可能（JSON、XML、PDF）。", example: "GET /report -> 300（JSON または PDF）" },
    301: { description: "リソースは新しい URI に永久に移動しました。", whenToUse: "恒久的な URL 移行。", example: "http -> https リダイレクト" },
    302: { description: "リソースは一時的に別の URI にあります。", whenToUse: "一時的なリダイレクト。", example: "ログイン成功 -> /dashboard" },
    303: { description: "リクエストへの応答は別の URI にあります（常に GET）。", whenToUse: "POST の後、GET で確認ページにリダイレクト。", example: "POST /order -> 303 -> GET /order/123" },
    304: { description: "リソースは前回のリクエスト以降変更されていません。", whenToUse: "リソースキャッシュ（ETag/If-Modified-Since）。", example: "静的ファイル（CSS/JS）" },
    307: { description: "元の HTTP メソッドを保持する一時的なリダイレクト。", whenToUse: "POST を GET に変更せずに別の URL にリダイレクト。", example: "マイクロサービスプロキシ" },
    308: { description: "元の HTTP メソッドを保持する永久的なリダイレクト。", whenToUse: "書き込みエンドポイントの恒久的な URL 変更。", example: "API バージョン移行" },

    // 4xx Client Error
    400: { description: "クライアントエラーのため、サーバーはリクエストを処理できません。", whenToUse: "無効な入力、不正な JSON、パラメータ不足。", example: "POST 無効な body -> 400" },
    401: { description: "リソースにアクセスするには認証が必要です。", whenToUse: "トークン期限切れ、資格情報なし。", example: "GET /api/me トークンなし -> 401" },
    402: { description: "将来の使用のために予約済み。支払いが必要であることを示します。", whenToUse: "有料 API、期限切れのサブスクリプション、使い果たしたクレジット。", example: "API 無料プラン枯渇 -> 402" },
    403: { description: "クライアントには要求されたリソースへのアクセス権がありません。", whenToUse: "認証済みユーザーに Admin 権限がない場合。", example: "一般ユーザーが DB 削除を試行" },
    404: { description: "要求されたリソースはサーバーに存在しません。", whenToUse: "不正な URL、削除されたリソース。", example: "GET /api/users/999 -> 404" },
    405: { description: "この HTTP メソッドはこのリソースでは許可されていません。", whenToUse: "GET のみ受け付ける URL への POST。", example: "POST /robots.txt" },
    406: { description: "サーバーはクライアントの Accept ヘッダーと互換性のあるレスポンスを生成できません。", whenToUse: "クライアントが XML を要求しているがサーバーは JSON のみ生成。", example: "Accept: application/xml -> 406" },
    407: { description: "プロキシでの認証が必要です。", whenToUse: "資格情報を要求する企業プロキシ。", example: "企業プロキシ認証なし -> 407" },
    408: { description: "サーバーはクライアントのリクエストを待機してタイムアウトしました。", whenToUse: "クライアントのデータ送信が遅い、アイドル接続。", example: "低速アップロードがタイムアウト -> 408" },
    409: { description: "サーバー上の競合のため、リクエストを完了できませんでした。", whenToUse: "メールで既に存在するユーザーの作成。", example: "DB の一意キー重複" },
    410: { description: "リソースは存在していましたが、永久に利用できなくなりました。", whenToUse: "意図的に削除されたリソース（期限切れのオファー）。", example: "締め切られた求人情報" },
    411: { description: "Content-Length ヘッダーがないため、サーバーはリクエストを拒否します。", whenToUse: "処理前にボディサイズを知る必要がある API。", example: "PUT Content-Length なし -> 411" },
    412: { description: "ヘッダーの前提条件が満たされていません。", whenToUse: "古い ETag での If-Match（楽観的ロック）。", example: "PUT If-Match 不正 -> 412" },
    413: { description: "リクエストボディがサーバーの制限を超えています。", whenToUse: "許容最大値を超えるファイルアップロード。", example: "10MB 制限のサーバーに 100MB アップロード -> 413" },
    414: { description: "リクエスト URI がサーバーにとって長すぎます。", whenToUse: "極端に長いクエリストリング。", example: "GET /search?q=...（10K 文字）-> 414" },
    415: { description: "リクエストのメディアタイプがサポートされていません。", whenToUse: "JSON のみ受け付ける API に XML を送信。", example: "Content-Type: text/xml -> 415" },
    416: { description: "要求された範囲を満たすことができません。", whenToUse: "ファイルサイズを超えたバイト範囲の要求。", example: "Range: bytes=9999-10000（100 バイトファイル）-> 416" },
    417: { description: "サーバーは Expect ヘッダーの要件を満たせません。", whenToUse: "サーバーが Expect: 100-continue をサポートしていない。", example: "Expect: 100-continue 拒否 -> 417" },
    418: { description: "サーバーはティーポットであり、コーヒーを入れることができません（RFC 2324）。", whenToUse: "イースターエッグ、ユーモラスなヘルスチェック。", example: "GET /coffee -> 418" },
    421: { description: "レスポンスを生成できないサーバーにリクエストが送信されました。", whenToUse: "HTTP/2：不正な証明書を持つサーバーへのリクエスト。", example: "HTTP/2 SNI ミスマッチ -> 421" },
    422: { description: "リクエストは正しい形式ですが、意味的なエラーがあります。", whenToUse: "検証：有効な JSON だが無効なデータ（不正なメール形式）。", example: "POST {\"email\": \"メールではない\"} -> 422" },
    423: { description: "リソースがロックされています。", whenToUse: "WebDAV：編集のためリソースがロック。", example: "PUT ロックされたファイル -> 423" },
    424: { description: "依存する別の操作が失敗したため、リクエストが失敗しました。", whenToUse: "WebDAV：操作のカスケード失敗。", example: "COPY が失敗した LOCK に依存 -> 424" },
    425: { description: "リプレイされる可能性があるため、サーバーはリクエストを処理しません。", whenToUse: "TLS Early Data（0-RTT）でのリプレイリスク。", example: "POST TLS 0-RTT -> 425" },
    426: { description: "クライアントは別のプロトコルに切り替える必要があります。", whenToUse: "サーバーが TLS または HTTP/2 を要求。", example: "HTTP/1.0 -> HTTP/1.1 へアップグレード -> 426" },
    428: { description: "サーバーはリクエストに前提条件を含めることを要求します。", whenToUse: "編集競合防止のため If-Match を要求する API。", example: "PUT If-Match なし -> 428" },
    429: { description: "クライアントが一定期間内に多すぎるリクエストを送信しました。", whenToUse: "レート制限、API スロットリング。", example: "100 リクエスト/分超過 -> 429" },
    431: { description: "リクエストのヘッダーフィールドが大きすぎます。", whenToUse: "過大な Cookie、巨大なカスタムヘッダー。", example: "8KB Cookie -> 431" },
    451: { description: "法的理由によりリソースが利用できません。", whenToUse: "DMCA、GDPR、政府の検閲。", example: "法律によりブロックされたコンテンツ -> 451" },

    // 5xx Server Error
    500: { description: "汎用サーバーエラー。", whenToUse: "未処理のエラー、予期しない例外。", example: "NullPointerException -> 500" },
    501: { description: "サーバーはリクエストメソッドを認識できないか、処理できません。", whenToUse: "未実装の HTTP メソッド（レガシーサーバーでの PATCH）。", example: "PATCH サポートなし API -> 501" },
    502: { description: "プロキシとして動作するサーバーが無効なレスポンスを受信しました。", whenToUse: "Nginx がマイクロサービスと通信できない。", example: "上流サーバーダウン" },
    503: { description: "サーバーはリクエストを処理できません（過負荷またはメンテナンス）。", whenToUse: "計画メンテナンス。", example: "アップデートのためのダウンタイム" },
    504: { description: "プロキシとして動作するサーバーが適時にレスポンスを受信できませんでした。", whenToUse: "マイクロサービスの応答に時間がかかりすぎる。", example: "重いクエリによるプロキシタイムアウト" },
    505: { description: "サーバーは使用された HTTP バージョンをサポートしていません。", whenToUse: "モダンサーバーで HTTP/0.9 を使用するクライアント。", example: "HTTP/0.9 -> 505" },
    506: { description: "設定エラー：選択されたバリアントもコンテンツネゴシエーションを行います。", whenToUse: "コンテンツネゴシエーションの設定エラー。", example: "循環ネゴシエーション -> 506" },
    507: { description: "サーバーにはリクエストを完了するための十分なストレージがありません。", whenToUse: "WebDAV サーバーのディスク容量不足。", example: "ディスク満杯へのアップロード -> 507" },
    508: { description: "サーバーはリクエスト処理中に無限ループを検出しました。", whenToUse: "WebDAV の循環参照。", example: "循環シンボリックリンク -> 508" },
    510: { description: "リクエストを満たすには追加の拡張が必要です。", whenToUse: "追加の HTTP 拡張が必要。", example: "HTTP 拡張が提供されていない -> 510" },
    511: { description: "アクセスするにはネットワーク認証が必要です。", whenToUse: "キャプティブ WiFi ポータル。", example: "ホテル WiFi -> 511" },
  },
} as const;

// ---------------------------------------------------------------------------
// Per-category localizable strings
// ---------------------------------------------------------------------------
interface CategoryStrings {
  description: string;
}

const CATEGORY_STRINGS: Record<Locale, Record<HttpStatusCategory, CategoryStrings>> = {
  en: {
    "1xx": { description: "Informational responses" },
    "2xx": { description: "Successful responses" },
    "3xx": { description: "Redirections" },
    "4xx": { description: "Client errors" },
    "5xx": { description: "Server errors" },
  },
  es: {
    "1xx": { description: "Respuestas informativas" },
    "2xx": { description: "Respuestas exitosas" },
    "3xx": { description: "Redirecciones" },
    "4xx": { description: "Errores del cliente" },
    "5xx": { description: "Errores del servidor" },
  },
  fr: {
    "1xx": { description: "Reponses informatives" },
    "2xx": { description: "Reponses reussies" },
    "3xx": { description: "Redirections" },
    "4xx": { description: "Erreurs client" },
    "5xx": { description: "Erreurs serveur" },
  },
  pt: {
    "1xx": { description: "Respostas informativas" },
    "2xx": { description: "Respostas de sucesso" },
    "3xx": { description: "Redirecionamentos" },
    "4xx": { description: "Erros do cliente" },
    "5xx": { description: "Erros do servidor" },
  },
  de: {
    "1xx": { description: "Informationsantworten" },
    "2xx": { description: "Erfolgreiche Antworten" },
    "3xx": { description: "Weiterleitungen" },
    "4xx": { description: "Client-Fehler" },
    "5xx": { description: "Server-Fehler" },
  },
  it: {
    "1xx": { description: "Risposte informative" },
    "2xx": { description: "Risposte di successo" },
    "3xx": { description: "Reindirizzamenti" },
    "4xx": { description: "Errori del client" },
    "5xx": { description: "Errori del server" },
  },
  zh: {
    "1xx": { description: "信息响应" },
    "2xx": { description: "成功响应" },
    "3xx": { description: "重定向" },
    "4xx": { description: "客户端错误" },
    "5xx": { description: "服务器错误" },
  },
  ja: {
    "1xx": { description: "情報レスポンス" },
    "2xx": { description: "成功レスポンス" },
    "3xx": { description: "リダイレクト" },
    "4xx": { description: "クライアントエラー" },
    "5xx": { description: "サーバーエラー" },
  },
} as const;

// ---------------------------------------------------------------------------
// Base status code data (locale-independent fields)
// ---------------------------------------------------------------------------
interface StatusCodeBase {
  code: number;
  name: string;
  category: HttpStatusCategory;
  isCommon: boolean;
  relatedHeaders?: string[];
  rfcLink?: string;
  snippets?: Record<string, string>;
}

const STATUS_CODES_BASE: StatusCodeBase[] = [
  // 1xx Informational
  { code: 100, name: "Continue", category: "1xx", isCommon: false },
  { code: 101, name: "Switching Protocols", category: "1xx", isCommon: false },
  { code: 102, name: "Processing", category: "1xx", isCommon: false },
  { code: 103, name: "Early Hints", category: "1xx", isCommon: false },

  // 2xx Success
  {
    code: 200, name: "OK", category: "2xx", isCommon: true,
    relatedHeaders: ["Content-Type", "ETag"],
    rfcLink: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/200",
    snippets: {
      express: "res.status(200).json(data);",
      fastapi: "return data",
      spring: "return ResponseEntity.ok(data);",
      go: "w.WriteHeader(http.StatusOK)\njson.NewEncoder(w).Encode(data)",
    },
  },
  {
    code: 201, name: "Created", category: "2xx", isCommon: true,
    relatedHeaders: ["Location"],
    rfcLink: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/201",
    snippets: {
      express: "res.status(201).location(`/users/${id}`).json(user);",
      fastapi: "return JSONResponse(status_code=201, content=user)",
      spring: "return ResponseEntity.status(HttpStatus.CREATED).body(user);",
      go: "w.Header().Set(\"Location\", \"/users/1\")\nw.WriteHeader(http.StatusCreated)",
    },
  },
  { code: 202, name: "Accepted", category: "2xx", isCommon: true },
  { code: 203, name: "Non-Authoritative Information", category: "2xx", isCommon: false },
  { code: 204, name: "No Content", category: "2xx", isCommon: true },
  { code: 205, name: "Reset Content", category: "2xx", isCommon: false },
  { code: 206, name: "Partial Content", category: "2xx", isCommon: true, relatedHeaders: ["Content-Range", "Range"] },
  { code: 207, name: "Multi-Status", category: "2xx", isCommon: false },
  { code: 208, name: "Already Reported", category: "2xx", isCommon: false },
  { code: 226, name: "IM Used", category: "2xx", isCommon: false },

  // 3xx Redirection
  { code: 300, name: "Multiple Choices", category: "3xx", isCommon: false },
  { code: 301, name: "Moved Permanently", category: "3xx", isCommon: true, relatedHeaders: ["Location"] },
  { code: 302, name: "Found", category: "3xx", isCommon: true, relatedHeaders: ["Location"] },
  { code: 303, name: "See Other", category: "3xx", isCommon: true, relatedHeaders: ["Location"] },
  { code: 304, name: "Not Modified", category: "3xx", isCommon: true },
  { code: 307, name: "Temporary Redirect", category: "3xx", isCommon: false },
  { code: 308, name: "Permanent Redirect", category: "3xx", isCommon: false },

  // 4xx Client Error
  {
    code: 400, name: "Bad Request", category: "4xx", isCommon: true,
    rfcLink: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/400",
    snippets: {
      express: "res.status(400).send('Bad Request');",
      fastapi: "raise HTTPException(status_code=400, detail='Invalid input')",
      spring: "throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 'Invalid data');",
    },
  },
  {
    code: 401, name: "Unauthorized", category: "4xx", isCommon: true,
    relatedHeaders: ["WWW-Authenticate"],
    rfcLink: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401",
  },
  { code: 402, name: "Payment Required", category: "4xx", isCommon: false },
  { code: 403, name: "Forbidden", category: "4xx", isCommon: true },
  {
    code: 404, name: "Not Found", category: "4xx", isCommon: true,
    rfcLink: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/404",
  },
  { code: 405, name: "Method Not Allowed", category: "4xx", isCommon: false, relatedHeaders: ["Allow"] },
  { code: 406, name: "Not Acceptable", category: "4xx", isCommon: false, relatedHeaders: ["Accept"] },
  { code: 407, name: "Proxy Authentication Required", category: "4xx", isCommon: false, relatedHeaders: ["Proxy-Authenticate"] },
  { code: 408, name: "Request Timeout", category: "4xx", isCommon: true },
  { code: 409, name: "Conflict", category: "4xx", isCommon: true },
  { code: 410, name: "Gone", category: "4xx", isCommon: false },
  { code: 411, name: "Length Required", category: "4xx", isCommon: false, relatedHeaders: ["Content-Length"] },
  { code: 412, name: "Precondition Failed", category: "4xx", isCommon: false, relatedHeaders: ["If-Match", "If-Unmodified-Since"] },
  { code: 413, name: "Content Too Large", category: "4xx", isCommon: true },
  { code: 414, name: "URI Too Long", category: "4xx", isCommon: false },
  { code: 415, name: "Unsupported Media Type", category: "4xx", isCommon: true, relatedHeaders: ["Content-Type"] },
  { code: 416, name: "Range Not Satisfiable", category: "4xx", isCommon: false, relatedHeaders: ["Content-Range"] },
  { code: 417, name: "Expectation Failed", category: "4xx", isCommon: false },
  { code: 418, name: "I'm a Teapot", category: "4xx", isCommon: false },
  { code: 421, name: "Misdirected Request", category: "4xx", isCommon: false },
  { code: 422, name: "Unprocessable Content", category: "4xx", isCommon: true },
  { code: 423, name: "Locked", category: "4xx", isCommon: false },
  { code: 424, name: "Failed Dependency", category: "4xx", isCommon: false },
  { code: 425, name: "Too Early", category: "4xx", isCommon: false },
  { code: 426, name: "Upgrade Required", category: "4xx", isCommon: false, relatedHeaders: ["Upgrade"] },
  { code: 428, name: "Precondition Required", category: "4xx", isCommon: false },
  {
    code: 429, name: "Too Many Requests", category: "4xx", isCommon: true,
    relatedHeaders: ["Retry-After"],
    rfcLink: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429",
  },
  { code: 431, name: "Request Header Fields Too Large", category: "4xx", isCommon: false },
  { code: 451, name: "Unavailable For Legal Reasons", category: "4xx", isCommon: false },

  // 5xx Server Error
  {
    code: 500, name: "Internal Server Error", category: "5xx", isCommon: true,
    rfcLink: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500",
    snippets: {
      express: "res.status(500).json({ error: 'Internal Server Error' });",
      spring: "return ResponseEntity.internalServerError().build();",
    },
  },
  { code: 501, name: "Not Implemented", category: "5xx", isCommon: false },
  { code: 502, name: "Bad Gateway", category: "5xx", isCommon: true },
  { code: 503, name: "Service Unavailable", category: "5xx", isCommon: true, relatedHeaders: ["Retry-After"] },
  { code: 504, name: "Gateway Timeout", category: "5xx", isCommon: true },
  { code: 505, name: "HTTP Version Not Supported", category: "5xx", isCommon: false },
  { code: 506, name: "Variant Also Negotiates", category: "5xx", isCommon: false },
  { code: 507, name: "Insufficient Storage", category: "5xx", isCommon: false },
  { code: 508, name: "Loop Detected", category: "5xx", isCommon: false },
  { code: 510, name: "Not Extended", category: "5xx", isCommon: false },
  { code: 511, name: "Network Authentication Required", category: "5xx", isCommon: false },
];

// ---------------------------------------------------------------------------
// Build locale-aware HttpStatusCode[] from base + strings
// ---------------------------------------------------------------------------
function buildStatusCodes(locale: Locale): HttpStatusCode[] {
  const strings = STATUS_STRINGS[locale as "en" | "es" | "fr" | "pt" | "de" | "it" | "zh" | "ja"] ?? STATUS_STRINGS["en"];
  return STATUS_CODES_BASE.map((base) => {
    const localized = strings?.[base.code];
    // Fallback to English if a code is somehow missing in the locale map
    const fallback = STATUS_STRINGS["en"]?.[base.code];
    const s = localized ?? fallback;
    return {
      ...base,
      description: s?.description ?? "",
      whenToUse: s?.whenToUse ?? "",
      example: s?.example ?? "",
    };
  });
}

// Cache built arrays so repeated calls don't rebuild
const statusCodesCache: Partial<Record<Locale, HttpStatusCode[]>> = {};

/** Get the full list of HTTP status codes in the given locale. Defaults to English. */
export function getStatusCodes(locale: Locale = "en"): HttpStatusCode[] {
  const cached = statusCodesCache[locale];
  if (cached) return cached;
  const codes = buildStatusCodes(locale);
  statusCodesCache[locale] = codes;
  return codes;
}

/**
 * Legacy static export for backward-compatibility.
 * New callers should prefer `getStatusCodes(locale)`.
 */
export const HTTP_STATUS_CODES: HttpStatusCode[] = getStatusCodes("en");

// ---------------------------------------------------------------------------
// Category info (locale-aware)
// ---------------------------------------------------------------------------
const CATEGORY_INFO_BASE: Record<HttpStatusCategory, Omit<CategoryInfo, "description">> = {
  "1xx": { category: "1xx", label: "Informational", color: "blue" },
  "2xx": { category: "2xx", label: "Success", color: "green" },
  "3xx": { category: "3xx", label: "Redirection", color: "yellow" },
  "4xx": { category: "4xx", label: "Client Error", color: "orange" },
  "5xx": { category: "5xx", label: "Server Error", color: "red" },
};

// ---------------------------------------------------------------------------
// Exported functions
// ---------------------------------------------------------------------------

/**
 * Search by exact code number
 */
export function searchByCode(code: number, locale: Locale = "en"): HttpStatusCode | null {
  return getStatusCodes(locale).find((s) => s.code === code) ?? null;
}

// Pre-computed lowercased search fields per index (built lazily, once)
interface SearchEntry {
  nameLower: string;
  enDescLower: string;
  enWhenLower: string;
  esDescLower: string;
  esWhenLower: string;
}

let searchIndex: SearchEntry[] | null = null;

function getSearchIndex(): SearchEntry[] {
  if (searchIndex) return searchIndex;
  const enCodes = getStatusCodes("en");
  const esCodes = getStatusCodes("es");
  searchIndex = enCodes.map((en, i) => {
    const es = esCodes[i];
    return {
      nameLower: en.name.toLowerCase(),
      enDescLower: en.description.toLowerCase(),
      enWhenLower: en.whenToUse.toLowerCase(),
      esDescLower: es?.description.toLowerCase() ?? "",
      esWhenLower: es?.whenToUse.toLowerCase() ?? "",
    };
  });
  return searchIndex;
}

/**
 * Search by keyword in name, description and whenToUse
 */
export function searchByKeyword(query: string, locale: Locale = "en"): HttpStatusCode[] {
  if (!query.trim()) return [];

  const lower = query.toLowerCase();
  const codes = getStatusCodes(locale);
  const index = getSearchIndex();

  const matchingIndices: number[] = [];

  for (let i = 0; i < codes.length; i++) {
    const entry = index[i];
    if (!entry) continue;
    if (
      entry.nameLower.includes(lower) ||
      entry.enDescLower.includes(lower) ||
      entry.enWhenLower.includes(lower) ||
      entry.esDescLower.includes(lower) ||
      entry.esWhenLower.includes(lower)
    ) {
      matchingIndices.push(i);
    }
  }

  return matchingIndices.map((i) => codes[i]!);
}

/**
 * Get all codes in a category
 */
export function getByCategory(category: HttpStatusCategory, locale: Locale = "en"): HttpStatusCode[] {
  return getStatusCodes(locale).filter((s) => s.category === category);
}

/**
 * Get common status codes
 */
export function getCommonCodes(locale: Locale = "en"): HttpStatusCode[] {
  return getStatusCodes(locale).filter((s) => s.isCommon);
}

// Pre-built Set for O(1) validity checks
const VALID_STATUS_CODES = new Set(STATUS_CODES_BASE.map((s) => s.code));

/**
 * Check if a code is a known HTTP status code
 */
export function isValidStatusCode(code: number): boolean {
  return VALID_STATUS_CODES.has(code);
}

/**
 * Get category info
 */
export function getCategoryInfo(category: HttpStatusCategory, locale: Locale = "en"): CategoryInfo {
  const base = CATEGORY_INFO_BASE[category];
  const catLocale = CATEGORY_STRINGS[locale as "en" | "es" | "fr" | "pt" | "de" | "it" | "zh" | "ja"] ?? CATEGORY_STRINGS["en"];
  const strings = catLocale?.[category];
  return {
    ...base,
    description: strings?.description ?? "",
  };
}

/**
 * Generate code snippets for handling any HTTP status code.
 * Returns curl, fetch, axios, and python request examples.
 */
export function generateCodeSnippets(code: number): Record<string, string> {
  const isSuccess = code >= 200 && code < 300;
  const isRedirect = code >= 300 && code < 400;
  const isClientError = code >= 400 && code < 500;

  return {
    curl: `curl -s -o /dev/null -w "%{http_code}" https://api.example.com/resource\n# Expected: ${code}${isRedirect ? "\n# Add -L to follow redirects" : ""}`,

    fetch: `const response = await fetch("https://api.example.com/resource");

if (response.status === ${code}) {
  ${isSuccess ? "const data = await response.json();\n  console.log(data);" : isClientError ? `console.error("${code} error:", response.statusText);` : isRedirect ? `const redirectUrl = response.headers.get("Location");` : `throw new Error(\`Server error: \${response.status}\`);`}
}`,

    axios: `try {
  const { data, status } = await axios.get("/api/resource"${isRedirect ? ", { maxRedirects: 0 }" : ""});
  ${isSuccess ? "console.log(data);" : `if (status === ${code}) { /* handle ${code} */ }`}
} catch (error) {
  if (axios.isAxiosError(error) && error.response?.status === ${code}) {
    ${isClientError ? `console.error("${code}:", error.response.data);` : `console.error("Server error ${code}");`}
  }
}`,

    python: `import requests

response = requests.get("https://api.example.com/resource"${isRedirect ? ", allow_redirects=False" : ""})

if response.status_code == ${code}:
    ${isSuccess ? "data = response.json()\n    print(data)" : isClientError ? `print(f"Error ${code}: {response.text}")` : isRedirect ? 'redirect_url = response.headers.get("Location")' : `raise Exception(f"Server error: {response.status_code}")`}`,
  };
}

/**
 * Process a search query (number or keyword)
 */
export function processSearch(query: string, category?: HttpStatusCategory, locale: Locale = "en"): SearchResult {
  let codes: HttpStatusCode[] = [];

  const trimmed = query.trim();

  if (!trimmed && !category) {
    codes = getCommonCodes(locale);
  } else if (!trimmed && category) {
    codes = getByCategory(category, locale);
  } else {
    // Try numeric search first
    const num = parseInt(trimmed, 10);
    if (!isNaN(num) && trimmed === num.toString()) {
      // Exact code search
      const exact = searchByCode(num, locale);
      if (exact) {
        codes = [exact];
      } else {
        // Partial numeric match (e.g., "40" matches 400, 401, etc.)
        codes = getStatusCodes(locale).filter((s) =>
          s.code.toString().startsWith(trimmed)
        );
      }
    } else {
      // Keyword search
      codes = searchByKeyword(trimmed, locale);
    }

    // Apply category filter
    if (category) {
      codes = codes.filter((c) => c.category === category);
    }
  }

  return {
    codes,
    query: trimmed,
    timestamp: new Date().toISOString(),
  };
}
