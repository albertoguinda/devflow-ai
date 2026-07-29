/**
 * guion.mjs — la NARRACIÓN del vídeo-demo de DevFlowAI, separada del grabador.
 *
 * Reglas (heredadas de los vídeos de Mirador y Cherry Appointments, donde
 * romperlas costó regrabar entero):
 *   - Un texto por BEAT y en el MISMO ORDEN que los beats de esa sección. El
 *     grabador aborta si las cuentas no cuadran, en vez de narrar una frase
 *     sobre otra escena.
 *   - Lo que se narra tiene que estar EN PANTALLA. Si la frase habla del árbol
 *     JSON, el árbol tiene que verse; si no, el beat sobra.
 *   - Lo que se afirma tiene que ser CIERTO. En concreto, aquí NO se dice:
 *       · "no enviamos nada a ningún servidor" a secas — las herramientas de IA
 *         sí llaman a un endpoint propio. Se dice "sin IA no sale nada del
 *         navegador", que es lo que verifica el código.
 *       · "sin analítica" — hay Umami cookieless. Se calla o se dice entero.
 *       · "funciona offline" sin matizar: el service worker cachea el shell y
 *         las herramientas locales, no las de IA.
 *   - Español PENINSULAR. Nada de voseo ni "computadora".
 *   - La interfaz se graba en el idioma del vídeo (Playwright fija el locale del
 *     navegador y la app lo detecta sola), así que la narración y los botones
 *     que se ven en pantalla coinciden.
 */

/** Voz de MiniMax por idioma. Las mismas que los otros vídeos: misma marca al oído. */
export const VOZ = {
  es: { voz: 'Spanish_Wiselady', boost: 'Spanish' },
  en: { voz: 'English_Wiselady', boost: 'English' },
};

export const GUION = {
  es: {
    intro: [
      'DevFlowAI es un kit de veinte herramientas de desarrollador que funcionan dentro del navegador. Sin registro, sin tarjeta y sin clave de API.',
      'Es software libre con licencia MIT: el código está entero en GitHub y se puede autoalojar.',
      'Cada herramienta funciona al cien por cien sin inteligencia artificial. La IA es una capa opcional que solo añade explicaciones.',
    ],
    catalogo: [
      'Este es el catálogo completo: las veinte herramientas con su categoría y su descripción.',
      'El filtro cubre las siete familias: análisis, revisión, cálculo, visualización, gestión, generación y formato.',
      'Y el buscador filtra sobre el nombre y la descripción traducidos, en el idioma en el que estés.',
    ],
    json: [
      'Empezamos por la más usada: el formateador de JSON. Se pega el JSON en crudo y se pulsa formatear.',
      'Sale indentado, validado y con resaltado de sintaxis. El análisis ocurre en tu navegador: ese JSON no viaja a ninguna parte.',
      'Y para documentos grandes hay una vista de árbol que se pliega y despliega por niveles.',
    ],
    dto: [
      'DTO-Matic hace el paso siguiente: coge una respuesta JSON de una API y genera el código tipado.',
      'De un ejemplo salen la interfaz de TypeScript, la entidad de dominio, el mapper entre las dos y el esquema de Zod. Eso es lo que ningún convertidor de JSON a TypeScript te da.',
    ],
    datos: [
      'El codificador de Base64 hace ida y vuelta, con la variante segura para URL y soporte de Unicode.',
      'Y el comparador de textos marca línea a línea lo que se añadió, lo que se quitó y lo que sigue igual.',
    ],
    seguridad: [
      'El generador de hashes usa la API Web Crypto del propio navegador: SHA-256, SHA-512, MD5 y también HMAC.',
      'El decodificador de JWT abre la cabecera, el contenido y la firma, y comprueba la expiración.',
      'Aquí el detalle importa: decodifica con la función nativa del navegador. No hay ni una llamada de red, así que un token de producción no sale de tu máquina.',
      'El generador de contraseñas usa crypto punto getRandomValues, y calcula la entropía real en bits.',
      'Y el generador de identificadores cubre las versiones uno, tres, cuatro, cinco y siete, en lote y con lectura de la marca de tiempo.',
    ],
    devops: [
      'El constructor de expresiones cron se maneja con plantillas y campos visuales, sin memorizar la sintaxis.',
      'Te explica la expresión en lenguaje llano y te enseña las próximas ejecuciones, que es donde se pillan los errores antes de desplegar.',
      'El generador de commits produce mensajes de Conventional Commits, con tipo, ámbito y cambios que rompen compatibilidad.',
      'Y el buscador de códigos HTTP resuelve las dudas de siempre: cuándo un cuatrocientos uno y cuándo un cuatrocientos tres.',
    ],
    frontend: [
      'El ordenador de clases de Tailwind las agrupa por categoría y quita las duplicadas, que es lo que ensucia los diffs.',
      'El conversor de color pasa entre hexadecimal, RGB, HSL y OKLCH.',
      'Y trae verificador de contraste WCAG, porque el proyecto entero está hecho contra el nivel AAA.',
      'El humanizador de expresiones regulares traduce el patrón a lenguaje llano y dibuja el diagrama.',
    ],
    ia: [
      'El visualizador de tokens usa el tokenizador de verdad en el navegador y va contando mientras escribes.',
      'La calculadora de coste compara proveedores con precios en vivo, para saber lo que cuesta una llamada antes de hacerla.',
      'Y el analizador de prompts puntúa claridad, especificidad, contexto y resistencia a inyecciones.',
    ],
    cierre: [
      'Todo se navega con teclado. Control más K abre la paleta de comandos y salta a cualquier herramienta.',
      'Cada herramienta se comparte por enlace: el estado va comprimido dentro de la URL, así que quien lo abra ve exactamente lo que tú tenías.',
      'Veinte herramientas, ocho idiomas de interfaz, accesibilidad AAA y licencia MIT. Está en devflowai punto dev, y el código en GitHub.',
    ],
  },

  en: {
    intro: [
      'DevFlowAI is a kit of twenty developer tools that run inside your browser. No signup, no credit card, no API key.',
      'It is open source under the MIT license: the whole codebase is on GitHub and you can self-host it.',
      'Every tool works one hundred percent without artificial intelligence. AI is an optional layer that only adds explanations.',
    ],
    catalogo: [
      'This is the full catalogue: twenty tools with their category and description.',
      'The filter covers all seven families: analysis, review, calculation, visualization, management, generation and formatting.',
      'And the search box filters the translated name and description, in whatever language you are using.',
    ],
    json: [
      'We start with the most used one: the JSON formatter. Paste raw JSON and hit format.',
      'It comes out indented, validated and syntax highlighted. The parsing happens in your browser, so that JSON goes nowhere.',
      'And for large documents there is a tree view that collapses and expands level by level.',
    ],
    dto: [
      'DTO-Matic takes the next step: feed it an API response and it writes the typed code for you.',
      'One sample gives you the TypeScript interface, the domain entity, the mapper between them and the Zod schema. That is what no plain JSON-to-TypeScript converter gives you.',
    ],
    datos: [
      'The Base64 encoder goes both ways, with the URL-safe variant and proper Unicode support.',
      'And the diff comparer marks line by line what was added, what was removed and what stayed the same.',
    ],
    seguridad: [
      'The hash generator uses the browser’s own Web Crypto API: SHA-256, SHA-512, MD5, and HMAC too.',
      'The JWT decoder opens the header, the payload and the signature, and checks expiry.',
      'The detail matters here: it decodes with the browser’s native function. There is not a single network call, so a production token never leaves your machine.',
      'The password generator uses crypto dot getRandomValues, and reports real entropy in bits.',
      'And the UUID generator covers versions one, three, four, five and seven, in bulk, and parses the embedded timestamp.',
    ],
    devops: [
      'The cron builder works from presets and visual fields, with no syntax to memorise.',
      'It explains the expression in plain English and previews the next runs, which is where you catch the mistake before deploying.',
      'The commit generator writes Conventional Commits, with type, scope and breaking changes.',
      'And the HTTP status finder settles the recurring argument: when it is a four oh one and when it is a four oh three.',
    ],
    frontend: [
      'The Tailwind sorter groups classes by category and drops duplicates, which is what makes diffs noisy.',
      'The colour converter moves between hex, RGB, HSL and OKLCH.',
      'And it ships a WCAG contrast checker, because the whole project is built against level triple-A.',
      'The regex humanizer turns the pattern into plain English and draws the diagram.',
    ],
    ia: [
      'The token visualizer runs the real tokenizer in the browser and counts as you type.',
      'The cost calculator compares providers with live prices, so you know what a call costs before you make it.',
      'And the prompt analyzer scores clarity, specificity, context and resistance to injection.',
    ],
    cierre: [
      'Everything is keyboard driven. Control K opens the command palette and jumps to any tool.',
      'Every tool is shareable by link: the state travels compressed inside the URL, so whoever opens it sees exactly what you had.',
      'Twenty tools, eight interface languages, triple-A accessibility and an MIT license. It lives at devflowai dot dev, and the code is on GitHub.',
    ],
  },
};
