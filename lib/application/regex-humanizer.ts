import type {
  RegexAnalysis,
  RegexToken,
  RegexGroup,
  TestResult,
  TestMatch,
  CommonPattern,
  RegexFlavor,
} from "@/types/regex-humanizer";

// --- Locale type (no React dependency) ---
type RegexLocale = string; // "en" | "es" | "fr" | "pt" | "de" | "it" | "zh" | "ja" have full translations; others fallback to "en"

// --- i18n Strings ---
const REGEX_STRINGS = {
  en: {
    // Token explanations
    tokens: {
      "\\d": "Any digit (0-9)",
      "\\D": "Any character that is NOT a digit",
      "\\w": "Any word character (a-z, A-Z, 0-9, _)",
      "\\W": "Any character that is NOT a word character",
      "\\s": "Any whitespace (space, tab, newline)",
      "\\S": "Any character that is NOT whitespace",
      "\\b": "Word boundary",
      "\\B": "NOT a word boundary",
      "\\n": "Newline",
      "\\t": "Tab",
      "\\r": "Carriage return",
      "\\0": "Null character",
      "\\.": "Literal dot",
      "\\\\": "Literal backslash",
      "\\(": "Literal opening parenthesis",
      "\\)": "Literal closing parenthesis",
      "\\[": "Literal opening bracket",
      "\\]": "Literal closing bracket",
      "\\{": "Literal opening brace",
      "\\}": "Literal closing brace",
      "\\+": "Literal plus sign",
      "\\*": "Literal asterisk",
      "\\?": "Literal question mark",
      "\\^": "Literal caret",
      "\\$": "Literal dollar sign",
      "\\|": "Literal pipe",
      "*": "Zero or more repetitions (greedy)",
      "+": "One or more repetitions (greedy)",
      "?": "Zero or one repetition (optional)",
      "^": "Start of string",
      "$": "End of string",
      "|": "Alternation (OR)",
      ".": "Any character except newline",
    } as Record<string, string>,

    // Fallback descriptions
    escapedChar: (ch: string) => `Escaped character: "${ch}" literal`,
    literalChar: (ch: string) => `Literal character: "${ch}"`,

    // Character class parts
    lowercaseLetters: "lowercase letters",
    uppercaseLetters: "uppercase letters",
    digits: "digits",
    wordChars: "word characters",
    spaces: "whitespace",
    characters: (chars: string) => `characters: ${chars}`,
    charSet: "character set",
    anyCharExcept: (desc: string) => `Any character EXCEPT: ${desc}`,
    oneOf: (desc: string) => `One of: ${desc}`,

    // Group explanations
    nonCapturingGroup: (inner: string) => `Non-capturing group: ${inner}`,
    positiveLookahead: (inner: string) => `Positive lookahead: followed by ${inner}`,
    negativeLookahead: (inner: string) => `Negative lookahead: NOT followed by ${inner}`,
    positiveLookbehind: (inner: string) => `Positive lookbehind: preceded by ${inner}`,
    negativeLookbehind: (inner: string) => `Negative lookbehind: NOT preceded by ${inner}`,
    captureGroup: (inner: string) => `Capture group: ${inner}`,

    // Quantifier explanations
    quantifierLabel: (q: string) => `Quantifier: ${q}`,
    exactlyN: (n: string) => `Exactly ${n} repetitions`,
    nOrMore: (n: string) => `${n} or more repetitions`,
    betweenNAndM: (n: string, m: string) => `Between ${n} and ${m} repetitions`,

    // buildExplanation labels
    patternDetected: (name: string) => `Pattern detected: ${name}`,
    patternBreakdown: "Pattern breakdown:",
    captureGroups: "Capture groups:",
    groupLabel: (idx: number, pat: string) => `Group ${idx}: ${pat}`,
    flags: "Flags:",
    flagG: "g → Global (all matches)",
    flagI: "i → Case insensitive",
    flagM: "m → Multiline (^ and $ per line)",
    flagS: "s → Dotall (. includes newlines)",
    flagU: "u → Unicode",
    flagY: "y → Sticky (search from lastIndex)",

    // testRegex error
    invalidRegex: "Invalid regex",

    // Common patterns
    commonPatterns: {
      email: {
        name: "Email",
        description: "Validates a basic email address",
        examples: ["user@example.com", "name.surname@domain.co"],
      },
      url: {
        name: "URL",
        description: "Validates an HTTP or HTTPS URL",
        examples: ["https://example.com", "http://www.example.com/path"],
      },
      "phone-es": {
        name: "Phone (Spain)",
        description: "Validates a Spanish phone number",
        examples: ["+34612345678", "612345678"],
      },
      "date-iso": {
        name: "ISO 8601 Date",
        description: "Validates a date in ISO 8601 format",
        examples: ["2024-01-15", "2024-01-15T10:30:00"],
      },
      ipv4: {
        name: "IPv4",
        description: "Validates an IPv4 address",
        examples: ["192.168.1.1", "10.0.0.1"],
      },
      password: {
        name: "Secure Password",
        description: "Minimum 8 characters with uppercase, lowercase, digit and special character",
        examples: ["P@ssw0rd!", "Segura#123"],
      },
      "dni-es": {
        name: "DNI/NIF (Spain)",
        description: "Validates a Spanish DNI/NIF",
        examples: ["12345678Z", "00000000T"],
      },
      "hex-color": {
        name: "Hex Color",
        description: "Validates a hexadecimal color code",
        examples: ["#FFF", "#FF5733"],
      },
    } as Record<string, { name: string; description: string; examples: string[] }>,

    // generateRegex keyword detection
    keywords: {
      email: ["email", "correo"],
      url: ["url", "link", "web", "enlace"],
      phone: ["phone", "telephone", "teléfono", "telefono", "mobile", "móvil", "movil"],
      phoneSpanish: ["spanish", "español", "espanol", "spain", "es", "movil", "móvil", "celular", "teléfono", "telefono"],
      date: ["date", "fecha"],
      dateIso: ["iso"],
      dateDDMM: ["dd/mm", "día/mes", "day/month"],
      ip: ["ip", "ipv4"],
      password: ["password", "contraseña"],
      dni: ["dni", "nif"],
      color: ["color", "hex"],
      digits: /(\d+)\s*digits?/,
      digitsEs: /(\d+)\s*dígitos?/,
      startingWith: /(?:starting with|starts? with)\s*([0-9,\s]+)/,
      startingWithEs: /(?:empezando por|empieza(?:n)? (?:por|con))\s*([0-9,\s]+)/,
      letters: ["letter", "letters", "letra", "letras"],
      uppercase: ["uppercase", "mayúscula", "mayuscula"],
      lowercase: ["lowercase", "minúscula", "minuscula"],
      alphanumeric: ["alphanumeric", "alfanumérico", "alfanumerico"],
    },
  },
  es: {
    // Token explanations
    tokens: {
      "\\d": "Cualquier dígito (0-9)",
      "\\D": "Cualquier carácter que NO sea dígito",
      "\\w": "Cualquier carácter de palabra (a-z, A-Z, 0-9, _)",
      "\\W": "Cualquier carácter que NO sea de palabra",
      "\\s": "Cualquier espacio en blanco (espacio, tab, nueva línea)",
      "\\S": "Cualquier carácter que NO sea espacio en blanco",
      "\\b": "Límite de palabra",
      "\\B": "NO límite de palabra",
      "\\n": "Nueva línea",
      "\\t": "Tabulación",
      "\\r": "Retorno de carro",
      "\\0": "Carácter nulo",
      "\\.": "Punto literal",
      "\\\\": "Barra invertida literal",
      "\\(": "Paréntesis de apertura literal",
      "\\)": "Paréntesis de cierre literal",
      "\\[": "Corchete de apertura literal",
      "\\]": "Corchete de cierre literal",
      "\\{": "Llave de apertura literal",
      "\\}": "Llave de cierre literal",
      "\\+": "Signo más literal",
      "\\*": "Asterisco literal",
      "\\?": "Signo de interrogación literal",
      "\\^": "Acento circunflejo literal",
      "\\$": "Signo de dólar literal",
      "\\|": "Barra vertical literal",
      "*": "Cero o más repeticiones (greedy)",
      "+": "Una o más repeticiones (greedy)",
      "?": "Cero o una repetición (opcional)",
      "^": "Inicio de cadena",
      "$": "Fin de cadena",
      "|": "Alternación (OR)",
      ".": "Cualquier carácter excepto nueva línea",
    } as Record<string, string>,

    // Fallback descriptions
    escapedChar: (ch: string) => `Carácter escapado: "${ch}" literal`,
    literalChar: (ch: string) => `Carácter literal: "${ch}"`,

    // Character class parts
    lowercaseLetters: "letras minúsculas",
    uppercaseLetters: "letras mayúsculas",
    digits: "dígitos",
    wordChars: "caracteres de palabra",
    spaces: "espacios",
    characters: (chars: string) => `caracteres: ${chars}`,
    charSet: "conjunto de caracteres",
    anyCharExcept: (desc: string) => `Cualquier carácter EXCEPTO: ${desc}`,
    oneOf: (desc: string) => `Uno de: ${desc}`,

    // Group explanations
    nonCapturingGroup: (inner: string) => `Grupo no capturador: ${inner}`,
    positiveLookahead: (inner: string) => `Lookahead positivo: seguido de ${inner}`,
    negativeLookahead: (inner: string) => `Lookahead negativo: NO seguido de ${inner}`,
    positiveLookbehind: (inner: string) => `Lookbehind positivo: precedido por ${inner}`,
    negativeLookbehind: (inner: string) => `Lookbehind negativo: NO precedido por ${inner}`,
    captureGroup: (inner: string) => `Grupo de captura: ${inner}`,

    // Quantifier explanations
    quantifierLabel: (q: string) => `Cuantificador: ${q}`,
    exactlyN: (n: string) => `Exactamente ${n} repeticiones`,
    nOrMore: (n: string) => `${n} o más repeticiones`,
    betweenNAndM: (n: string, m: string) => `Entre ${n} y ${m} repeticiones`,

    // buildExplanation labels
    patternDetected: (name: string) => `Patrón detectado: ${name}`,
    patternBreakdown: "Desglose del patrón:",
    captureGroups: "Grupos de captura:",
    groupLabel: (idx: number, pat: string) => `Grupo ${idx}: ${pat}`,
    flags: "Flags:",
    flagG: "g → Global (todas las coincidencias)",
    flagI: "i → Insensible a mayúsculas/minúsculas",
    flagM: "m → Multilínea (^ y $ por línea)",
    flagS: "s → Dotall (. incluye saltos de línea)",
    flagU: "u → Unicode",
    flagY: "y → Sticky (búsqueda desde lastIndex)",

    // testRegex error
    invalidRegex: "Regex inválida",

    // Common patterns
    commonPatterns: {
      email: {
        name: "Email",
        description: "Valida una dirección de correo electrónico básica",
        examples: ["user@example.com", "nombre.apellido@dominio.es"],
      },
      url: {
        name: "URL",
        description: "Valida una URL HTTP o HTTPS",
        examples: ["https://example.com", "http://www.ejemplo.es/ruta"],
      },
      "phone-es": {
        name: "Teléfono (España)",
        description: "Valida un número de teléfono español",
        examples: ["+34612345678", "612345678"],
      },
      "date-iso": {
        name: "Fecha ISO 8601",
        description: "Valida una fecha en formato ISO 8601",
        examples: ["2024-01-15", "2024-01-15T10:30:00"],
      },
      ipv4: {
        name: "IPv4",
        description: "Valida una dirección IPv4",
        examples: ["192.168.1.1", "10.0.0.1"],
      },
      password: {
        name: "Contraseña Segura",
        description: "Mínimo 8 caracteres con mayúscula, minúscula, dígito y carácter especial",
        examples: ["P@ssw0rd!", "Segura#123"],
      },
      "dni-es": {
        name: "DNI/NIF (España)",
        description: "Valida un DNI/NIF español",
        examples: ["12345678Z", "00000000T"],
      },
      "hex-color": {
        name: "Color Hexadecimal",
        description: "Valida un código de color hexadecimal",
        examples: ["#FFF", "#FF5733"],
      },
    } as Record<string, { name: string; description: string; examples: string[] }>,

    // generateRegex keyword detection (same as en — both languages accepted)
    keywords: {
      email: ["email", "correo"],
      url: ["url", "link", "web", "enlace"],
      phone: ["phone", "telephone", "teléfono", "telefono", "mobile", "móvil", "movil"],
      phoneSpanish: ["spanish", "español", "espanol", "spain", "es", "movil", "móvil", "celular", "teléfono", "telefono"],
      date: ["date", "fecha"],
      dateIso: ["iso"],
      dateDDMM: ["dd/mm", "día/mes", "day/month"],
      ip: ["ip", "ipv4"],
      password: ["password", "contraseña"],
      dni: ["dni", "nif"],
      color: ["color", "hex"],
      digits: /(\d+)\s*digits?/,
      digitsEs: /(\d+)\s*dígitos?/,
      startingWith: /(?:starting with|starts? with)\s*([0-9,\s]+)/,
      startingWithEs: /(?:empezando por|empieza(?:n)? (?:por|con))\s*([0-9,\s]+)/,
      letters: ["letter", "letters", "letra", "letras"],
      uppercase: ["uppercase", "mayúscula", "mayuscula"],
      lowercase: ["lowercase", "minúscula", "minuscula"],
      alphanumeric: ["alphanumeric", "alfanumérico", "alfanumerico"],
    },
  },
  fr: {
    // Token explanations
    tokens: {
      "\\d": "N'importe quel chiffre (0-9)",
      "\\D": "N'importe quel caractère qui N'est PAS un chiffre",
      "\\w": "N'importe quel caractère de mot (a-z, A-Z, 0-9, _)",
      "\\W": "N'importe quel caractère qui N'est PAS un caractère de mot",
      "\\s": "N'importe quel espace blanc (espace, tabulation, saut de ligne)",
      "\\S": "N'importe quel caractère qui N'est PAS un espace blanc",
      "\\b": "Limite de mot",
      "\\B": "PAS une limite de mot",
      "\\n": "Saut de ligne",
      "\\t": "Tabulation",
      "\\r": "Retour chariot",
      "\\0": "Caractère nul",
      "\\.": "Point littéral",
      "\\\\": "Barre oblique inversée littérale",
      "\\(": "Parenthèse ouvrante littérale",
      "\\)": "Parenthèse fermante littérale",
      "\\[": "Crochet ouvrant littéral",
      "\\]": "Crochet fermant littéral",
      "\\{": "Accolade ouvrante littérale",
      "\\}": "Accolade fermante littérale",
      "\\+": "Signe plus littéral",
      "\\*": "Astérisque littéral",
      "\\?": "Point d'interrogation littéral",
      "\\^": "Accent circonflexe littéral",
      "\\$": "Signe dollar littéral",
      "\\|": "Barre verticale littérale",
      "*": "Zéro ou plusieurs répétitions (greedy)",
      "+": "Une ou plusieurs répétitions (greedy)",
      "?": "Zéro ou une répétition (optionnel)",
      "^": "Début de chaîne",
      "$": "Fin de chaîne",
      "|": "Alternance (OU)",
      ".": "N'importe quel caractère sauf saut de ligne",
    } as Record<string, string>,

    // Fallback descriptions
    escapedChar: (ch: string) => `Caractère échappé : "${ch}" littéral`,
    literalChar: (ch: string) => `Caractère littéral : "${ch}"`,

    // Character class parts
    lowercaseLetters: "lettres minuscules",
    uppercaseLetters: "lettres majuscules",
    digits: "chiffres",
    wordChars: "caractères de mot",
    spaces: "espaces blancs",
    characters: (chars: string) => `caractères : ${chars}`,
    charSet: "ensemble de caractères",
    anyCharExcept: (desc: string) => `N'importe quel caractère SAUF : ${desc}`,
    oneOf: (desc: string) => `Un parmi : ${desc}`,

    // Group explanations
    nonCapturingGroup: (inner: string) => `Groupe non capturant : ${inner}`,
    positiveLookahead: (inner: string) => `Lookahead positif : suivi de ${inner}`,
    negativeLookahead: (inner: string) => `Lookahead négatif : NON suivi de ${inner}`,
    positiveLookbehind: (inner: string) => `Lookbehind positif : précédé de ${inner}`,
    negativeLookbehind: (inner: string) => `Lookbehind négatif : NON précédé de ${inner}`,
    captureGroup: (inner: string) => `Groupe de capture : ${inner}`,

    // Quantifier explanations
    quantifierLabel: (q: string) => `Quantificateur : ${q}`,
    exactlyN: (n: string) => `Exactement ${n} répétitions`,
    nOrMore: (n: string) => `${n} ou plus répétitions`,
    betweenNAndM: (n: string, m: string) => `Entre ${n} et ${m} répétitions`,

    // buildExplanation labels
    patternDetected: (name: string) => `Motif détecté : ${name}`,
    patternBreakdown: "Décomposition du motif :",
    captureGroups: "Groupes de capture :",
    groupLabel: (idx: number, pat: string) => `Groupe ${idx} : ${pat}`,
    flags: "Drapeaux :",
    flagG: "g → Global (toutes les correspondances)",
    flagI: "i → Insensible à la casse",
    flagM: "m → Multiligne (^ et $ par ligne)",
    flagS: "s → Dotall (. inclut les sauts de ligne)",
    flagU: "u → Unicode",
    flagY: "y → Sticky (recherche depuis lastIndex)",

    // testRegex error
    invalidRegex: "Regex invalide",

    // Common patterns
    commonPatterns: {
      email: {
        name: "Email",
        description: "Valide une adresse email basique",
        examples: ["user@example.com", "name.surname@domain.co"],
      },
      url: {
        name: "URL",
        description: "Valide une URL HTTP ou HTTPS",
        examples: ["https://example.com", "http://www.example.com/path"],
      },
      "phone-es": {
        name: "Téléphone (Espagne)",
        description: "Valide un numéro de téléphone espagnol",
        examples: ["+34612345678", "612345678"],
      },
      "date-iso": {
        name: "Date ISO 8601",
        description: "Valide une date au format ISO 8601",
        examples: ["2024-01-15", "2024-01-15T10:30:00"],
      },
      ipv4: {
        name: "IPv4",
        description: "Valide une adresse IPv4",
        examples: ["192.168.1.1", "10.0.0.1"],
      },
      password: {
        name: "Mot de passe sécurisé",
        description: "Minimum 8 caractères avec majuscule, minuscule, chiffre et caractère spécial",
        examples: ["P@ssw0rd!", "Segura#123"],
      },
      "dni-es": {
        name: "DNI/NIF (Espagne)",
        description: "Valide un DNI/NIF espagnol",
        examples: ["12345678Z", "00000000T"],
      },
      "hex-color": {
        name: "Couleur hexadécimale",
        description: "Valide un code couleur hexadécimal",
        examples: ["#FFF", "#FF5733"],
      },
    } as Record<string, { name: string; description: string; examples: string[] }>,

    // generateRegex keyword detection
    keywords: {
      email: ["email", "courriel", "courrier"],
      url: ["url", "lien", "web", "adresse"],
      phone: ["téléphone", "telephone", "portable", "mobile", "numéro"],
      phoneSpanish: ["espagnol", "espagne", "spanish", "spain", "es"],
      date: ["date"],
      dateIso: ["iso"],
      dateDDMM: ["jj/mm", "jour/mois", "dd/mm"],
      ip: ["ip", "ipv4"],
      password: ["mot de passe", "password", "mdp"],
      dni: ["dni", "nif"],
      color: ["couleur", "hex", "color"],
      digits: /(\d+)\s*chiffres?/,
      digitsEs: /(\d+)\s*dígitos?/,
      startingWith: /(?:commençant par|commence(?:nt)? par)\s*([0-9,\s]+)/,
      startingWithEs: /(?:empezando por|empieza(?:n)? (?:por|con))\s*([0-9,\s]+)/,
      letters: ["lettre", "lettres", "letter", "letters"],
      uppercase: ["majuscule", "majuscules", "uppercase"],
      lowercase: ["minuscule", "minuscules", "lowercase"],
      alphanumeric: ["alphanumérique", "alphanumeric", "alfanumérico"],
    },
  },
  pt: {
    // Token explanations
    tokens: {
      "\\d": "Qualquer dígito (0-9)",
      "\\D": "Qualquer caractere que NÃO seja dígito",
      "\\w": "Qualquer caractere de palavra (a-z, A-Z, 0-9, _)",
      "\\W": "Qualquer caractere que NÃO seja de palavra",
      "\\s": "Qualquer espaço em branco (espaço, tab, nova linha)",
      "\\S": "Qualquer caractere que NÃO seja espaço em branco",
      "\\b": "Limite de palavra",
      "\\B": "NÃO limite de palavra",
      "\\n": "Nova linha",
      "\\t": "Tabulação",
      "\\r": "Retorno de carro",
      "\\0": "Caractere nulo",
      "\\.": "Ponto literal",
      "\\\\": "Barra invertida literal",
      "\\(": "Parêntese de abertura literal",
      "\\)": "Parêntese de fechamento literal",
      "\\[": "Colchete de abertura literal",
      "\\]": "Colchete de fechamento literal",
      "\\{": "Chave de abertura literal",
      "\\}": "Chave de fechamento literal",
      "\\+": "Sinal de mais literal",
      "\\*": "Asterisco literal",
      "\\?": "Ponto de interrogação literal",
      "\\^": "Circunflexo literal",
      "\\$": "Sinal de dólar literal",
      "\\|": "Barra vertical literal",
      "*": "Zero ou mais repetições (greedy)",
      "+": "Uma ou mais repetições (greedy)",
      "?": "Zero ou uma repetição (opcional)",
      "^": "Início da string",
      "$": "Fim da string",
      "|": "Alternância (OU)",
      ".": "Qualquer caractere exceto nova linha",
    } as Record<string, string>,

    // Fallback descriptions
    escapedChar: (ch: string) => `Caractere escapado: "${ch}" literal`,
    literalChar: (ch: string) => `Caractere literal: "${ch}"`,

    // Character class parts
    lowercaseLetters: "letras minúsculas",
    uppercaseLetters: "letras maiúsculas",
    digits: "dígitos",
    wordChars: "caracteres de palavra",
    spaces: "espaços em branco",
    characters: (chars: string) => `caracteres: ${chars}`,
    charSet: "conjunto de caracteres",
    anyCharExcept: (desc: string) => `Qualquer caractere EXCETO: ${desc}`,
    oneOf: (desc: string) => `Um de: ${desc}`,

    // Group explanations
    nonCapturingGroup: (inner: string) => `Grupo não capturador: ${inner}`,
    positiveLookahead: (inner: string) => `Lookahead positivo: seguido de ${inner}`,
    negativeLookahead: (inner: string) => `Lookahead negativo: NÃO seguido de ${inner}`,
    positiveLookbehind: (inner: string) => `Lookbehind positivo: precedido por ${inner}`,
    negativeLookbehind: (inner: string) => `Lookbehind negativo: NÃO precedido por ${inner}`,
    captureGroup: (inner: string) => `Grupo de captura: ${inner}`,

    // Quantifier explanations
    quantifierLabel: (q: string) => `Quantificador: ${q}`,
    exactlyN: (n: string) => `Exatamente ${n} repetições`,
    nOrMore: (n: string) => `${n} ou mais repetições`,
    betweenNAndM: (n: string, m: string) => `Entre ${n} e ${m} repetições`,

    // buildExplanation labels
    patternDetected: (name: string) => `Padrão detectado: ${name}`,
    patternBreakdown: "Decomposição do padrão:",
    captureGroups: "Grupos de captura:",
    groupLabel: (idx: number, pat: string) => `Grupo ${idx}: ${pat}`,
    flags: "Flags:",
    flagG: "g → Global (todas as correspondências)",
    flagI: "i → Insensível a maiúsculas/minúsculas",
    flagM: "m → Multilinha (^ e $ por linha)",
    flagS: "s → Dotall (. inclui quebras de linha)",
    flagU: "u → Unicode",
    flagY: "y → Sticky (busca a partir de lastIndex)",

    // testRegex error
    invalidRegex: "Regex inválida",

    // Common patterns
    commonPatterns: {
      email: {
        name: "Email",
        description: "Valida um endereço de email básico",
        examples: ["user@example.com", "name.surname@domain.co"],
      },
      url: {
        name: "URL",
        description: "Valida uma URL HTTP ou HTTPS",
        examples: ["https://example.com", "http://www.example.com/path"],
      },
      "phone-es": {
        name: "Telefone (Espanha)",
        description: "Valida um número de telefone espanhol",
        examples: ["+34612345678", "612345678"],
      },
      "date-iso": {
        name: "Data ISO 8601",
        description: "Valida uma data no formato ISO 8601",
        examples: ["2024-01-15", "2024-01-15T10:30:00"],
      },
      ipv4: {
        name: "IPv4",
        description: "Valida um endereço IPv4",
        examples: ["192.168.1.1", "10.0.0.1"],
      },
      password: {
        name: "Senha Segura",
        description: "Mínimo 8 caracteres com maiúscula, minúscula, dígito e caractere especial",
        examples: ["P@ssw0rd!", "Segura#123"],
      },
      "dni-es": {
        name: "DNI/NIF (Espanha)",
        description: "Valida um DNI/NIF espanhol",
        examples: ["12345678Z", "00000000T"],
      },
      "hex-color": {
        name: "Cor Hexadecimal",
        description: "Valida um código de cor hexadecimal",
        examples: ["#FFF", "#FF5733"],
      },
    } as Record<string, { name: string; description: string; examples: string[] }>,

    // generateRegex keyword detection
    keywords: {
      email: ["email", "correio", "e-mail"],
      url: ["url", "link", "web", "endereço"],
      phone: ["telefone", "celular", "mobile", "número"],
      phoneSpanish: ["espanhol", "espanha", "spanish", "spain", "es"],
      date: ["data", "date"],
      dateIso: ["iso"],
      dateDDMM: ["dd/mm", "dia/mês", "day/month"],
      ip: ["ip", "ipv4"],
      password: ["senha", "password", "palavra-passe"],
      dni: ["dni", "nif"],
      color: ["cor", "hex", "color"],
      digits: /(\d+)\s*dígitos?/,
      digitsEs: /(\d+)\s*dígitos?/,
      startingWith: /(?:começando com|começa(?:m)? com)\s*([0-9,\s]+)/,
      startingWithEs: /(?:empezando por|empieza(?:n)? (?:por|con))\s*([0-9,\s]+)/,
      letters: ["letra", "letras", "letter", "letters"],
      uppercase: ["maiúscula", "maiúsculas", "uppercase"],
      lowercase: ["minúscula", "minúsculas", "lowercase"],
      alphanumeric: ["alfanumérico", "alphanumeric"],
    },
  },
  de: {
    // Token explanations
    tokens: {
      "\\d": "Beliebige Ziffer (0-9)",
      "\\D": "Beliebiges Zeichen, das KEINE Ziffer ist",
      "\\w": "Beliebiges Wortzeichen (a-z, A-Z, 0-9, _)",
      "\\W": "Beliebiges Zeichen, das KEIN Wortzeichen ist",
      "\\s": "Beliebiges Leerzeichen (Leerzeichen, Tab, Zeilenumbruch)",
      "\\S": "Beliebiges Zeichen, das KEIN Leerzeichen ist",
      "\\b": "Wortgrenze",
      "\\B": "KEINE Wortgrenze",
      "\\n": "Zeilenumbruch",
      "\\t": "Tabulator",
      "\\r": "Wagenrücklauf",
      "\\0": "Nullzeichen",
      "\\.": "Literaler Punkt",
      "\\\\": "Literaler Backslash",
      "\\(": "Literale öffnende Klammer",
      "\\)": "Literale schließende Klammer",
      "\\[": "Literale öffnende eckige Klammer",
      "\\]": "Literale schließende eckige Klammer",
      "\\{": "Literale öffnende geschweifte Klammer",
      "\\}": "Literale schließende geschweifte Klammer",
      "\\+": "Literales Pluszeichen",
      "\\*": "Literales Sternchen",
      "\\?": "Literales Fragezeichen",
      "\\^": "Literales Zirkumflex",
      "\\$": "Literales Dollarzeichen",
      "\\|": "Literaler senkrechter Strich",
      "*": "Null oder mehr Wiederholungen (greedy)",
      "+": "Eine oder mehr Wiederholungen (greedy)",
      "?": "Null oder eine Wiederholung (optional)",
      "^": "Anfang der Zeichenkette",
      "$": "Ende der Zeichenkette",
      "|": "Alternative (ODER)",
      ".": "Beliebiges Zeichen außer Zeilenumbruch",
    } as Record<string, string>,

    // Fallback descriptions
    escapedChar: (ch: string) => `Escape-Zeichen: "${ch}" literal`,
    literalChar: (ch: string) => `Literales Zeichen: "${ch}"`,

    // Character class parts
    lowercaseLetters: "Kleinbuchstaben",
    uppercaseLetters: "Großbuchstaben",
    digits: "Ziffern",
    wordChars: "Wortzeichen",
    spaces: "Leerzeichen",
    characters: (chars: string) => `Zeichen: ${chars}`,
    charSet: "Zeichensatz",
    anyCharExcept: (desc: string) => `Beliebiges Zeichen AUSSER: ${desc}`,
    oneOf: (desc: string) => `Eines von: ${desc}`,

    // Group explanations
    nonCapturingGroup: (inner: string) => `Nicht-einfangende Gruppe: ${inner}`,
    positiveLookahead: (inner: string) => `Positiver Lookahead: gefolgt von ${inner}`,
    negativeLookahead: (inner: string) => `Negativer Lookahead: NICHT gefolgt von ${inner}`,
    positiveLookbehind: (inner: string) => `Positiver Lookbehind: vorangestellt ${inner}`,
    negativeLookbehind: (inner: string) => `Negativer Lookbehind: NICHT vorangestellt ${inner}`,
    captureGroup: (inner: string) => `Einfangende Gruppe: ${inner}`,

    // Quantifier explanations
    quantifierLabel: (q: string) => `Quantifizierer: ${q}`,
    exactlyN: (n: string) => `Genau ${n} Wiederholungen`,
    nOrMore: (n: string) => `${n} oder mehr Wiederholungen`,
    betweenNAndM: (n: string, m: string) => `Zwischen ${n} und ${m} Wiederholungen`,

    // buildExplanation labels
    patternDetected: (name: string) => `Muster erkannt: ${name}`,
    patternBreakdown: "Musteraufschlüsselung:",
    captureGroups: "Einfangende Gruppen:",
    groupLabel: (idx: number, pat: string) => `Gruppe ${idx}: ${pat}`,
    flags: "Flags:",
    flagG: "g → Global (alle Übereinstimmungen)",
    flagI: "i → Groß-/Kleinschreibung ignorieren",
    flagM: "m → Mehrzeilig (^ und $ pro Zeile)",
    flagS: "s → Dotall (. enthält Zeilenumbrüche)",
    flagU: "u → Unicode",
    flagY: "y → Sticky (Suche ab lastIndex)",

    // testRegex error
    invalidRegex: "Ungültiger Regex",

    // Common patterns
    commonPatterns: {
      email: {
        name: "E-Mail",
        description: "Validiert eine einfache E-Mail-Adresse",
        examples: ["user@example.com", "name.surname@domain.co"],
      },
      url: {
        name: "URL",
        description: "Validiert eine HTTP- oder HTTPS-URL",
        examples: ["https://example.com", "http://www.example.com/path"],
      },
      "phone-es": {
        name: "Telefon (Spanien)",
        description: "Validiert eine spanische Telefonnummer",
        examples: ["+34612345678", "612345678"],
      },
      "date-iso": {
        name: "ISO 8601 Datum",
        description: "Validiert ein Datum im ISO 8601 Format",
        examples: ["2024-01-15", "2024-01-15T10:30:00"],
      },
      ipv4: {
        name: "IPv4",
        description: "Validiert eine IPv4-Adresse",
        examples: ["192.168.1.1", "10.0.0.1"],
      },
      password: {
        name: "Sicheres Passwort",
        description: "Mindestens 8 Zeichen mit Großbuchstabe, Kleinbuchstabe, Ziffer und Sonderzeichen",
        examples: ["P@ssw0rd!", "Segura#123"],
      },
      "dni-es": {
        name: "DNI/NIF (Spanien)",
        description: "Validiert eine spanische DNI/NIF",
        examples: ["12345678Z", "00000000T"],
      },
      "hex-color": {
        name: "Hex-Farbe",
        description: "Validiert einen hexadezimalen Farbcode",
        examples: ["#FFF", "#FF5733"],
      },
    } as Record<string, { name: string; description: string; examples: string[] }>,

    // generateRegex keyword detection
    keywords: {
      email: ["email", "e-mail", "mail"],
      url: ["url", "link", "web", "adresse"],
      phone: ["telefon", "handy", "mobilnummer", "rufnummer"],
      phoneSpanish: ["spanisch", "spanien", "spanish", "spain", "es"],
      date: ["datum", "date"],
      dateIso: ["iso"],
      dateDDMM: ["tt/mm", "tag/monat", "dd/mm"],
      ip: ["ip", "ipv4"],
      password: ["passwort", "kennwort", "password"],
      dni: ["dni", "nif"],
      color: ["farbe", "hex", "color"],
      digits: /(\d+)\s*Ziffern?/,
      digitsEs: /(\d+)\s*dígitos?/,
      startingWith: /(?:beginnend mit|beginnt mit)\s*([0-9,\s]+)/,
      startingWithEs: /(?:empezando por|empieza(?:n)? (?:por|con))\s*([0-9,\s]+)/,
      letters: ["Buchstabe", "Buchstaben", "letter", "letters"],
      uppercase: ["Großbuchstabe", "Großbuchstaben", "uppercase"],
      lowercase: ["Kleinbuchstabe", "Kleinbuchstaben", "lowercase"],
      alphanumeric: ["alphanumerisch", "alphanumeric"],
    },
  },
  it: {
    // Token explanations
    tokens: {
      "\\d": "Qualsiasi cifra (0-9)",
      "\\D": "Qualsiasi carattere che NON sia una cifra",
      "\\w": "Qualsiasi carattere di parola (a-z, A-Z, 0-9, _)",
      "\\W": "Qualsiasi carattere che NON sia un carattere di parola",
      "\\s": "Qualsiasi spazio bianco (spazio, tab, a capo)",
      "\\S": "Qualsiasi carattere che NON sia spazio bianco",
      "\\b": "Limite di parola",
      "\\B": "NON limite di parola",
      "\\n": "A capo",
      "\\t": "Tabulazione",
      "\\r": "Ritorno a capo",
      "\\0": "Carattere nullo",
      "\\.": "Punto letterale",
      "\\\\": "Barra rovesciata letterale",
      "\\(": "Parentesi aperta letterale",
      "\\)": "Parentesi chiusa letterale",
      "\\[": "Parentesi quadra aperta letterale",
      "\\]": "Parentesi quadra chiusa letterale",
      "\\{": "Parentesi graffa aperta letterale",
      "\\}": "Parentesi graffa chiusa letterale",
      "\\+": "Segno più letterale",
      "\\*": "Asterisco letterale",
      "\\?": "Punto interrogativo letterale",
      "\\^": "Accento circonflesso letterale",
      "\\$": "Segno del dollaro letterale",
      "\\|": "Barra verticale letterale",
      "*": "Zero o più ripetizioni (greedy)",
      "+": "Una o più ripetizioni (greedy)",
      "?": "Zero o una ripetizione (opzionale)",
      "^": "Inizio della stringa",
      "$": "Fine della stringa",
      "|": "Alternanza (OR)",
      ".": "Qualsiasi carattere eccetto a capo",
    } as Record<string, string>,

    // Fallback descriptions
    escapedChar: (ch: string) => `Carattere di escape: "${ch}" letterale`,
    literalChar: (ch: string) => `Carattere letterale: "${ch}"`,

    // Character class parts
    lowercaseLetters: "lettere minuscole",
    uppercaseLetters: "lettere maiuscole",
    digits: "cifre",
    wordChars: "caratteri di parola",
    spaces: "spazi bianchi",
    characters: (chars: string) => `caratteri: ${chars}`,
    charSet: "insieme di caratteri",
    anyCharExcept: (desc: string) => `Qualsiasi carattere TRANNE: ${desc}`,
    oneOf: (desc: string) => `Uno tra: ${desc}`,

    // Group explanations
    nonCapturingGroup: (inner: string) => `Gruppo non catturante: ${inner}`,
    positiveLookahead: (inner: string) => `Lookahead positivo: seguito da ${inner}`,
    negativeLookahead: (inner: string) => `Lookahead negativo: NON seguito da ${inner}`,
    positiveLookbehind: (inner: string) => `Lookbehind positivo: preceduto da ${inner}`,
    negativeLookbehind: (inner: string) => `Lookbehind negativo: NON preceduto da ${inner}`,
    captureGroup: (inner: string) => `Gruppo di cattura: ${inner}`,

    // Quantifier explanations
    quantifierLabel: (q: string) => `Quantificatore: ${q}`,
    exactlyN: (n: string) => `Esattamente ${n} ripetizioni`,
    nOrMore: (n: string) => `${n} o più ripetizioni`,
    betweenNAndM: (n: string, m: string) => `Tra ${n} e ${m} ripetizioni`,

    // buildExplanation labels
    patternDetected: (name: string) => `Pattern rilevato: ${name}`,
    patternBreakdown: "Scomposizione del pattern:",
    captureGroups: "Gruppi di cattura:",
    groupLabel: (idx: number, pat: string) => `Gruppo ${idx}: ${pat}`,
    flags: "Flag:",
    flagG: "g → Globale (tutte le corrispondenze)",
    flagI: "i → Insensibile alle maiuscole/minuscole",
    flagM: "m → Multilinea (^ e $ per riga)",
    flagS: "s → Dotall (. include a capo)",
    flagU: "u → Unicode",
    flagY: "y → Sticky (ricerca da lastIndex)",

    // testRegex error
    invalidRegex: "Regex non valida",

    // Common patterns
    commonPatterns: {
      email: {
        name: "Email",
        description: "Valida un indirizzo email di base",
        examples: ["user@example.com", "name.surname@domain.co"],
      },
      url: {
        name: "URL",
        description: "Valida un URL HTTP o HTTPS",
        examples: ["https://example.com", "http://www.example.com/path"],
      },
      "phone-es": {
        name: "Telefono (Spagna)",
        description: "Valida un numero di telefono spagnolo",
        examples: ["+34612345678", "612345678"],
      },
      "date-iso": {
        name: "Data ISO 8601",
        description: "Valida una data in formato ISO 8601",
        examples: ["2024-01-15", "2024-01-15T10:30:00"],
      },
      ipv4: {
        name: "IPv4",
        description: "Valida un indirizzo IPv4",
        examples: ["192.168.1.1", "10.0.0.1"],
      },
      password: {
        name: "Password Sicura",
        description: "Minimo 8 caratteri con maiuscola, minuscola, cifra e carattere speciale",
        examples: ["P@ssw0rd!", "Segura#123"],
      },
      "dni-es": {
        name: "DNI/NIF (Spagna)",
        description: "Valida un DNI/NIF spagnolo",
        examples: ["12345678Z", "00000000T"],
      },
      "hex-color": {
        name: "Colore Esadecimale",
        description: "Valida un codice colore esadecimale",
        examples: ["#FFF", "#FF5733"],
      },
    } as Record<string, { name: string; description: string; examples: string[] }>,

    // generateRegex keyword detection
    keywords: {
      email: ["email", "posta", "e-mail"],
      url: ["url", "link", "web", "indirizzo"],
      phone: ["telefono", "cellulare", "mobile", "numero"],
      phoneSpanish: ["spagnolo", "spagna", "spanish", "spain", "es"],
      date: ["data", "date"],
      dateIso: ["iso"],
      dateDDMM: ["gg/mm", "giorno/mese", "dd/mm"],
      ip: ["ip", "ipv4"],
      password: ["password", "parola d'ordine"],
      dni: ["dni", "nif"],
      color: ["colore", "hex", "color"],
      digits: /(\d+)\s*cifre?/,
      digitsEs: /(\d+)\s*dígitos?/,
      startingWith: /(?:iniziando con|inizia(?:no)? con)\s*([0-9,\s]+)/,
      startingWithEs: /(?:empezando por|empieza(?:n)? (?:por|con))\s*([0-9,\s]+)/,
      letters: ["lettera", "lettere", "letter", "letters"],
      uppercase: ["maiuscola", "maiuscole", "uppercase"],
      lowercase: ["minuscola", "minuscole", "lowercase"],
      alphanumeric: ["alfanumerico", "alphanumeric"],
    },
  },
  zh: {
    // Token explanations
    tokens: {
      "\\d": "任意数字 (0-9)",
      "\\D": "任意非数字字符",
      "\\w": "任意单词字符 (a-z, A-Z, 0-9, _)",
      "\\W": "任意非单词字符",
      "\\s": "任意空白字符（空格、制表符、换行符）",
      "\\S": "任意非空白字符",
      "\\b": "单词边界",
      "\\B": "非单词边界",
      "\\n": "换行符",
      "\\t": "制表符",
      "\\r": "回车符",
      "\\0": "空字符",
      "\\.": "字面点号",
      "\\\\": "字面反斜杠",
      "\\(": "字面左圆括号",
      "\\)": "字面右圆括号",
      "\\[": "字面左方括号",
      "\\]": "字面右方括号",
      "\\{": "字面左花括号",
      "\\}": "字面右花括号",
      "\\+": "字面加号",
      "\\*": "字面星号",
      "\\?": "字面问号",
      "\\^": "字面脱字符",
      "\\$": "字面美元符号",
      "\\|": "字面竖线",
      "*": "零次或多次重复（贪婪）",
      "+": "一次或多次重复（贪婪）",
      "?": "零次或一次重复（可选）",
      "^": "字符串开头",
      "$": "字符串结尾",
      "|": "交替（或）",
      ".": "除换行符外的任意字符",
    } as Record<string, string>,

    // Fallback descriptions
    escapedChar: (ch: string) => `转义字符："${ch}" 字面值`,
    literalChar: (ch: string) => `字面字符："${ch}"`,

    // Character class parts
    lowercaseLetters: "小写字母",
    uppercaseLetters: "大写字母",
    digits: "数字",
    wordChars: "单词字符",
    spaces: "空白字符",
    characters: (chars: string) => `字符：${chars}`,
    charSet: "字符集",
    anyCharExcept: (desc: string) => `除以下之外的任意字符：${desc}`,
    oneOf: (desc: string) => `其中之一：${desc}`,

    // Group explanations
    nonCapturingGroup: (inner: string) => `非捕获组：${inner}`,
    positiveLookahead: (inner: string) => `正向前瞻：后跟 ${inner}`,
    negativeLookahead: (inner: string) => `负向前瞻：不后跟 ${inner}`,
    positiveLookbehind: (inner: string) => `正向后顾：前面是 ${inner}`,
    negativeLookbehind: (inner: string) => `负向后顾：前面不是 ${inner}`,
    captureGroup: (inner: string) => `捕获组：${inner}`,

    // Quantifier explanations
    quantifierLabel: (q: string) => `量词：${q}`,
    exactlyN: (n: string) => `恰好 ${n} 次重复`,
    nOrMore: (n: string) => `${n} 次或更多重复`,
    betweenNAndM: (n: string, m: string) => `${n} 到 ${m} 次重复`,

    // buildExplanation labels
    patternDetected: (name: string) => `检测到模式：${name}`,
    patternBreakdown: "模式分解：",
    captureGroups: "捕获组：",
    groupLabel: (idx: number, pat: string) => `组 ${idx}：${pat}`,
    flags: "标志：",
    flagG: "g → 全局（所有匹配）",
    flagI: "i → 不区分大小写",
    flagM: "m → 多行（^ 和 $ 逐行匹配）",
    flagS: "s → Dotall（. 包含换行符）",
    flagU: "u → Unicode",
    flagY: "y → 粘性（从 lastIndex 搜索）",

    // testRegex error
    invalidRegex: "无效的正则表达式",

    // Common patterns
    commonPatterns: {
      email: {
        name: "电子邮件",
        description: "验证基本的电子邮件地址",
        examples: ["user@example.com", "name.surname@domain.co"],
      },
      url: {
        name: "URL",
        description: "验证 HTTP 或 HTTPS URL",
        examples: ["https://example.com", "http://www.example.com/path"],
      },
      "phone-es": {
        name: "电话（西班牙）",
        description: "验证西班牙电话号码",
        examples: ["+34612345678", "612345678"],
      },
      "date-iso": {
        name: "ISO 8601 日期",
        description: "验证 ISO 8601 格式的日期",
        examples: ["2024-01-15", "2024-01-15T10:30:00"],
      },
      ipv4: {
        name: "IPv4",
        description: "验证 IPv4 地址",
        examples: ["192.168.1.1", "10.0.0.1"],
      },
      password: {
        name: "安全密码",
        description: "至少8个字符，包含大写、小写、数字和特殊字符",
        examples: ["P@ssw0rd!", "Segura#123"],
      },
      "dni-es": {
        name: "DNI/NIF（西班牙）",
        description: "验证西班牙 DNI/NIF",
        examples: ["12345678Z", "00000000T"],
      },
      "hex-color": {
        name: "十六进制颜色",
        description: "验证十六进制颜色代码",
        examples: ["#FFF", "#FF5733"],
      },
    } as Record<string, { name: string; description: string; examples: string[] }>,

    // generateRegex keyword detection
    keywords: {
      email: ["邮箱", "邮件", "电子邮件", "email"],
      url: ["网址", "链接", "url", "web"],
      phone: ["电话", "手机", "号码", "phone"],
      phoneSpanish: ["西班牙", "spanish", "spain", "es"],
      date: ["日期", "date"],
      dateIso: ["iso"],
      dateDDMM: ["dd/mm", "日/月"],
      ip: ["ip", "ipv4"],
      password: ["密码", "口令", "password"],
      dni: ["dni", "nif"],
      color: ["颜色", "色彩", "hex", "color"],
      digits: /(\d+)\s*(?:位数?|个数字)/,
      digitsEs: /(\d+)\s*dígitos?/,
      startingWith: /(?:以|开头为)\s*([0-9,\s]+)\s*开头/,
      startingWithEs: /(?:empezando por|empieza(?:n)? (?:por|con))\s*([0-9,\s]+)/,
      letters: ["字母", "letter", "letters"],
      uppercase: ["大写", "uppercase"],
      lowercase: ["小写", "lowercase"],
      alphanumeric: ["字母数字", "alphanumeric"],
    },
  },
  ja: {
    // Token explanations
    tokens: {
      "\\d": "任意の数字 (0-9)",
      "\\D": "数字以外の任意の文字",
      "\\w": "任意の単語文字 (a-z, A-Z, 0-9, _)",
      "\\W": "単語文字以外の任意の文字",
      "\\s": "任意の空白文字（スペース、タブ、改行）",
      "\\S": "空白文字以外の任意の文字",
      "\\b": "単語境界",
      "\\B": "単語境界でない位置",
      "\\n": "改行",
      "\\t": "タブ",
      "\\r": "キャリッジリターン",
      "\\0": "ヌル文字",
      "\\.": "リテラルのドット",
      "\\\\": "リテラルのバックスラッシュ",
      "\\(": "リテラルの開き括弧",
      "\\)": "リテラルの閉じ括弧",
      "\\[": "リテラルの開き角括弧",
      "\\]": "リテラルの閉じ角括弧",
      "\\{": "リテラルの開き波括弧",
      "\\}": "リテラルの閉じ波括弧",
      "\\+": "リテラルのプラス記号",
      "\\*": "リテラルのアスタリスク",
      "\\?": "リテラルの疑問符",
      "\\^": "リテラルのキャレット",
      "\\$": "リテラルのドル記号",
      "\\|": "リテラルのパイプ",
      "*": "0回以上の繰り返し（貪欲）",
      "+": "1回以上の繰り返し（貪欲）",
      "?": "0回または1回の繰り返し（任意）",
      "^": "文字列の先頭",
      "$": "文字列の末尾",
      "|": "交替（OR）",
      ".": "改行以外の任意の文字",
    } as Record<string, string>,

    // Fallback descriptions
    escapedChar: (ch: string) => `エスケープ文字：「${ch}」リテラル`,
    literalChar: (ch: string) => `リテラル文字：「${ch}」`,

    // Character class parts
    lowercaseLetters: "小文字",
    uppercaseLetters: "大文字",
    digits: "数字",
    wordChars: "単語文字",
    spaces: "空白文字",
    characters: (chars: string) => `文字：${chars}`,
    charSet: "文字セット",
    anyCharExcept: (desc: string) => `次を除く任意の文字：${desc}`,
    oneOf: (desc: string) => `いずれか：${desc}`,

    // Group explanations
    nonCapturingGroup: (inner: string) => `非キャプチャグループ：${inner}`,
    positiveLookahead: (inner: string) => `肯定先読み：後に ${inner} が続く`,
    negativeLookahead: (inner: string) => `否定先読み：後に ${inner} が続かない`,
    positiveLookbehind: (inner: string) => `肯定後読み：前に ${inner} がある`,
    negativeLookbehind: (inner: string) => `否定後読み：前に ${inner} がない`,
    captureGroup: (inner: string) => `キャプチャグループ：${inner}`,

    // Quantifier explanations
    quantifierLabel: (q: string) => `量指定子：${q}`,
    exactlyN: (n: string) => `ちょうど ${n} 回の繰り返し`,
    nOrMore: (n: string) => `${n} 回以上の繰り返し`,
    betweenNAndM: (n: string, m: string) => `${n} 回から ${m} 回の繰り返し`,

    // buildExplanation labels
    patternDetected: (name: string) => `パターン検出：${name}`,
    patternBreakdown: "パターンの分解：",
    captureGroups: "キャプチャグループ：",
    groupLabel: (idx: number, pat: string) => `グループ ${idx}：${pat}`,
    flags: "フラグ：",
    flagG: "g → グローバル（全ての一致）",
    flagI: "i → 大文字小文字を区別しない",
    flagM: "m → 複数行（^ と $ を行ごとに適用）",
    flagS: "s → Dotall（. が改行を含む）",
    flagU: "u → Unicode",
    flagY: "y → Sticky（lastIndex から検索）",

    // testRegex error
    invalidRegex: "無効な正規表現",

    // Common patterns
    commonPatterns: {
      email: {
        name: "メールアドレス",
        description: "基本的なメールアドレスを検証",
        examples: ["user@example.com", "name.surname@domain.co"],
      },
      url: {
        name: "URL",
        description: "HTTP または HTTPS の URL を検証",
        examples: ["https://example.com", "http://www.example.com/path"],
      },
      "phone-es": {
        name: "電話番号（スペイン）",
        description: "スペインの電話番号を検証",
        examples: ["+34612345678", "612345678"],
      },
      "date-iso": {
        name: "ISO 8601 日付",
        description: "ISO 8601 形式の日付を検証",
        examples: ["2024-01-15", "2024-01-15T10:30:00"],
      },
      ipv4: {
        name: "IPv4",
        description: "IPv4 アドレスを検証",
        examples: ["192.168.1.1", "10.0.0.1"],
      },
      password: {
        name: "安全なパスワード",
        description: "大文字、小文字、数字、特殊文字を含む8文字以上",
        examples: ["P@ssw0rd!", "Segura#123"],
      },
      "dni-es": {
        name: "DNI/NIF（スペイン）",
        description: "スペインの DNI/NIF を検証",
        examples: ["12345678Z", "00000000T"],
      },
      "hex-color": {
        name: "16進カラー",
        description: "16進カラーコードを検証",
        examples: ["#FFF", "#FF5733"],
      },
    } as Record<string, { name: string; description: string; examples: string[] }>,

    // generateRegex keyword detection
    keywords: {
      email: ["メール", "メールアドレス", "email"],
      url: ["URL", "リンク", "ウェブ", "url", "web"],
      phone: ["電話", "携帯", "番号", "phone"],
      phoneSpanish: ["スペイン", "spanish", "spain", "es"],
      date: ["日付", "date"],
      dateIso: ["iso"],
      dateDDMM: ["dd/mm", "日/月"],
      ip: ["ip", "ipv4"],
      password: ["パスワード", "password"],
      dni: ["dni", "nif"],
      color: ["色", "カラー", "hex", "color"],
      digits: /(\d+)\s*(?:桁|文字)/,
      digitsEs: /(\d+)\s*dígitos?/,
      startingWith: /(?:で始まる|から始まる)\s*([0-9,\s]+)/,
      startingWithEs: /(?:empezando por|empieza(?:n)? (?:por|con))\s*([0-9,\s]+)/,
      letters: ["文字", "letter", "letters"],
      uppercase: ["大文字", "uppercase"],
      lowercase: ["小文字", "lowercase"],
      alphanumeric: ["英数字", "alphanumeric"],
    },
  },
} as const;

// Helper to get the strings object for a locale
type SupportedRegexLocale = "en" | "es" | "fr" | "pt" | "de" | "it" | "zh" | "ja";
function getStrings(locale: RegexLocale) {
  return (REGEX_STRINGS[locale as SupportedRegexLocale] ?? REGEX_STRINGS.en);
}

// --- Advanced Safety Patterns (ReDoS Detection) ---
const DANGEROUS_PATTERNS = [
  {
    pattern: /(\(.*\)\*|\(.*\)\+|\(.*\){\d+,})\*/,
    message: "Nested quantifiers (e.g., (a*)*) can cause catastrophic backtracking.",
    severity: "critical"
  },
  {
    pattern: /(\.\*){3,}/,
    message: "Multiple overlapping wildcards (.*.*.*) may degrade performance.",
    severity: "warning"
  },
  {
    pattern: /\[.*\](\*|\+)/,
    message: "Loose character classes with quantifiers can be slow if followed by overlapping literal characters.",
    severity: "info"
  }
];

// --- Common Patterns (locale-aware getter) ---
function getCommonPatterns(locale: RegexLocale): CommonPattern[] {
  const s = getStrings(locale);
  const patternData = s.commonPatterns;

  return [
    {
      id: "email",
      name: patternData["email"]?.name ?? "Email",
      pattern: "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$",
      description: patternData["email"]?.description ?? "",
      examples: patternData["email"]?.examples ?? [],
    },
    {
      id: "url",
      name: patternData["url"]?.name ?? "URL",
      pattern: "^https?:\\/\\/[\\w\\-]+(\\.[\\w\\-]+)+([\\w.,@?^=%&:/~+#\\-]*[\\w@?^=%&/~+#\\-])?$",
      description: patternData["url"]?.description ?? "",
      examples: patternData["url"]?.examples ?? [],
    },
    {
      id: "phone-es",
      name: patternData["phone-es"]?.name ?? "Phone (Spain)",
      pattern: "^(\\+34)?[6-9]\\d{8}$",
      description: patternData["phone-es"]?.description ?? "",
      examples: patternData["phone-es"]?.examples ?? [],
    },
    {
      id: "date-iso",
      name: patternData["date-iso"]?.name ?? "ISO 8601 Date",
      pattern: "^\\d{4}-\\d{2}-\\d{2}(T\\d{2}:\\d{2}:\\d{2})?",
      description: patternData["date-iso"]?.description ?? "",
      examples: patternData["date-iso"]?.examples ?? [],
    },
    {
      id: "ipv4",
      name: patternData["ipv4"]?.name ?? "IPv4",
      pattern: "^(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$",
      description: patternData["ipv4"]?.description ?? "",
      examples: patternData["ipv4"]?.examples ?? [],
    },
    {
      id: "password",
      name: patternData["password"]?.name ?? "Secure Password",
      pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
      description: patternData["password"]?.description ?? "",
      examples: patternData["password"]?.examples ?? [],
    },
    {
      id: "dni-es",
      name: patternData["dni-es"]?.name ?? "DNI/NIF (Spain)",
      pattern: "^\\d{8}[A-Z]$",
      description: patternData["dni-es"]?.description ?? "",
      examples: patternData["dni-es"]?.examples ?? [],
    },
    {
      id: "hex-color",
      name: patternData["hex-color"]?.name ?? "Hex Color",
      pattern: "^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$",
      description: patternData["hex-color"]?.description ?? "",
      examples: patternData["hex-color"]?.examples ?? [],
    },
  ];
}

// Backward-compatible export: defaults to "en"
export const COMMON_PATTERNS: CommonPattern[] = getCommonPatterns("en");

// Locale-aware export
export { getCommonPatterns };

// --- Parse and Explain Regex ---
export function explainRegex(
  patternInput: string,
  flavor: RegexFlavor = "javascript",
  locale: RegexLocale = "en"
): RegexAnalysis {
  // Extract pattern and flags
  let pattern = patternInput;
  let flags = "";

  // Handle /pattern/flags format
  const regexMatch = patternInput.match(/^\/(.+)\/([gimsuy]*)$/);
  if (regexMatch && regexMatch[1]) {
    pattern = regexMatch[1];
    flags = regexMatch[2] ?? "";
  }

  const tokens = tokenizeRegex(pattern, locale);
  const groups = extractGroups(pattern, locale);
  const patterns = getCommonPatterns(locale);
  const commonPattern = detectCommonPattern(pattern, patterns);
  const safety = performSafetyAnalysis(pattern);

  // Build explanation
  const explanation = buildExplanation(tokens, groups, commonPattern, flags, locale);

  // Add flavor-specific warnings
  const flavorWarnings = getFlavorWarnings(pattern, flags, flavor, locale);
  const allWarnings = [...safety.warnings, ...flavorWarnings];

  return {
    id: crypto.randomUUID(),
    pattern,
    flags,
    flavor,
    explanation,
    tokens,
    groups,
    commonPattern: commonPattern?.name ?? null,
    safetyScore: safety.score,
    isDangerous: safety.isDangerous,
    warnings: allWarnings,
    analyzedAt: new Date().toISOString(),
  };
}

// --- Flavor Compatibility Warnings ---

interface FlavorCheck {
  test: (pattern: string, flags: string) => boolean;
  incompatible: RegexFlavor[];
  message: Record<RegexLocale, string>;
}

const FLAVOR_CHECKS: FlavorCheck[] = [
  {
    test: (p) => /\(\?<=/.test(p) || /\(\?<!/.test(p),
    incompatible: ["go"],
    message: {
      en: "Lookbehind assertions are not supported in Go regex",
      es: "Las aserciones lookbehind no son compatibles con regex de Go",
      fr: "Les assertions lookbehind ne sont pas prises en charge dans les regex Go",
      pt: "As asserções lookbehind não são suportadas em regex Go",
      de: "Lookbehind-Assertions werden in Go-Regex nicht unterstützt",
      it: "Le asserzioni lookbehind non sono supportate nelle regex Go",
      zh: "Go 正则不支持后顾断言",
      ja: "Go の正規表現では後読みアサーションはサポートされていません",
    },
  },
  {
    test: (p) => /\(\?=/.test(p) || /\(\?!/.test(p),
    incompatible: ["go"],
    message: {
      en: "Lookahead assertions are not supported in Go regex",
      es: "Las aserciones lookahead no son compatibles con regex de Go",
      fr: "Les assertions lookahead ne sont pas prises en charge dans les regex Go",
      pt: "As asserções lookahead não são suportadas em regex Go",
      de: "Lookahead-Assertions werden in Go-Regex nicht unterstützt",
      it: "Le asserzioni lookahead non sono supportate nelle regex Go",
      zh: "Go 正则不支持前瞻断言",
      ja: "Go の正規表現では先読みアサーションはサポートされていません",
    },
  },
  {
    test: (_p, f) => f.includes("u"),
    incompatible: ["python", "go", "pcre"],
    message: {
      en: "The 'u' (unicode) flag is JavaScript-specific",
      es: "La flag 'u' (unicode) es específica de JavaScript",
      fr: "Le drapeau 'u' (unicode) est spécifique à JavaScript",
      pt: "A flag 'u' (unicode) é específica do JavaScript",
      de: "Das 'u'-Flag (Unicode) ist JavaScript-spezifisch",
      it: "Il flag 'u' (unicode) è specifico di JavaScript",
      zh: "'u'（unicode）标志是 JavaScript 特有的",
      ja: "'u'（Unicode）フラグは JavaScript 固有です",
    },
  },
  {
    test: (p) => /\\A/.test(p),
    incompatible: ["javascript"],
    message: {
      en: "\\A (start of string) does not exist in JavaScript — use ^ instead",
      es: "\\A (inicio de cadena) no existe en JavaScript — usa ^ en su lugar",
      fr: "\\A (début de chaîne) n'existe pas en JavaScript — utilisez ^ à la place",
      pt: "\\A (início da string) não existe em JavaScript — use ^ em vez disso",
      de: "\\A (Anfang der Zeichenkette) existiert in JavaScript nicht — verwende stattdessen ^",
      it: "\\A (inizio stringa) non esiste in JavaScript — usa ^ al suo posto",
      zh: "\\A（字符串开头）在 JavaScript 中不存在 — 请改用 ^",
      ja: "\\A（文字列の先頭）は JavaScript には存在しません — 代わりに ^ を使用してください",
    },
  },
  {
    test: (p) => /\\Z/.test(p),
    incompatible: ["javascript"],
    message: {
      en: "\\Z (end of string) does not exist in JavaScript — use $ instead",
      es: "\\Z (fin de cadena) no existe en JavaScript — usa $ en su lugar",
      fr: "\\Z (fin de chaîne) n'existe pas en JavaScript — utilisez $ à la place",
      pt: "\\Z (fim da string) não existe em JavaScript — use $ em vez disso",
      de: "\\Z (Ende der Zeichenkette) existiert in JavaScript nicht — verwende stattdessen $",
      it: "\\Z (fine stringa) non esiste in JavaScript — usa $ al suo posto",
      zh: "\\Z（字符串结尾）在 JavaScript 中不存在 — 请改用 $",
      ja: "\\Z（文字列の末尾）は JavaScript には存在しません — 代わりに $ を使用してください",
    },
  },
  {
    test: (p) => /\(\?P</.test(p),
    incompatible: ["javascript"],
    message: {
      en: "(?P<name>) is Python syntax — use (?<name>) in JavaScript",
      es: "(?P<nombre>) es sintaxis Python — usa (?<nombre>) en JavaScript",
      fr: "(?P<nom>) est une syntaxe Python — utilisez (?<nom>) en JavaScript",
      pt: "(?P<nome>) é sintaxe Python — use (?<nome>) em JavaScript",
      de: "(?P<name>) ist Python-Syntax — verwende (?<name>) in JavaScript",
      it: "(?P<nome>) è sintassi Python — usa (?<nome>) in JavaScript",
      zh: "(?P<name>) 是 Python 语法 — 在 JavaScript 中使用 (?<name>)",
      ja: "(?P<name>) は Python 構文です — JavaScript では (?<name>) を使用してください",
    },
  },
  {
    test: (p) => /\(\?P=/.test(p),
    incompatible: ["javascript", "go"],
    message: {
      en: "(?P=name) backreference is Python-specific",
      es: "La retroreferencia (?P=nombre) es específica de Python",
      fr: "La référence arrière (?P=nom) est spécifique à Python",
      pt: "A referência retroativa (?P=nome) é específica do Python",
      de: "Die Rückreferenz (?P=name) ist Python-spezifisch",
      it: "Il riferimento all'indietro (?P=nome) è specifico di Python",
      zh: "(?P=name) 反向引用是 Python 特有的",
      ja: "(?P=name) 後方参照は Python 固有です",
    },
  },
  {
    test: (p) => /\(\?\{/.test(p),
    incompatible: ["javascript", "go", "python"],
    message: {
      en: "Code callouts (?{...}) are PCRE-specific",
      es: "Las llamadas a código (?{...}) son específicas de PCRE",
      fr: "Les appels de code (?{...}) sont spécifiques à PCRE",
      pt: "As chamadas de código (?{...}) são específicas do PCRE",
      de: "Code-Callouts (?{...}) sind PCRE-spezifisch",
      it: "Le chiamate di codice (?{...}) sono specifiche di PCRE",
      zh: "代码调出 (?{...}) 是 PCRE 特有的",
      ja: "コードコールアウト (?{...}) は PCRE 固有です",
    },
  },
  {
    test: (_p, f) => f.includes("s"),
    incompatible: ["go"],
    message: {
      en: "The 's' (dotAll) flag is not supported in Go — use [\\s\\S] instead",
      es: "La flag 's' (dotAll) no es compatible con Go — usa [\\s\\S] en su lugar",
      fr: "Le drapeau 's' (dotAll) n'est pas pris en charge dans Go — utilisez [\\s\\S] à la place",
      pt: "A flag 's' (dotAll) não é suportada em Go — use [\\s\\S] em vez disso",
      de: "Das 's'-Flag (dotAll) wird in Go nicht unterstützt — verwende stattdessen [\\s\\S]",
      it: "Il flag 's' (dotAll) non è supportato in Go — usa [\\s\\S] al suo posto",
      zh: "'s'（dotAll）标志在 Go 中不受支持 — 请改用 [\\s\\S]",
      ja: "'s'（dotAll）フラグは Go ではサポートされていません — 代わりに [\\s\\S] を使用してください",
    },
  },
  {
    test: (p) => /\{,\d+\}/.test(p),
    incompatible: ["javascript"],
    message: {
      en: "{,n} (implicit zero minimum) is not valid in JavaScript — use {0,n}",
      es: "{,n} (mínimo implícito cero) no es válido en JavaScript — usa {0,n}",
      fr: "{,n} (minimum implicite zéro) n'est pas valide en JavaScript — utilisez {0,n}",
      pt: "{,n} (mínimo implícito zero) não é válido em JavaScript — use {0,n}",
      de: "{,n} (implizites Minimum null) ist in JavaScript ungültig — verwende {0,n}",
      it: "{,n} (minimo implicito zero) non è valido in JavaScript — usa {0,n}",
      zh: "{,n}（隐式最小值零）在 JavaScript 中无效 — 请使用 {0,n}",
      ja: "{,n}（暗黙の最小値ゼロ）は JavaScript では無効です — {0,n} を使用してください",
    },
  },
];

function getFlavorWarnings(pattern: string, flags: string, flavor: RegexFlavor, locale: RegexLocale): string[] {
  const warnings: string[] = [];
  for (const check of FLAVOR_CHECKS) {
    if (check.test(pattern, flags) && check.incompatible.includes(flavor)) {
      const msg = (check.message[locale as SupportedRegexLocale] ?? check.message["en"]) ?? "";
      if (msg) warnings.push(msg);
    }
  }
  return warnings;
}

function performSafetyAnalysis(pattern: string): { score: number; isDangerous: boolean; warnings: string[] } {
  const warnings: string[] = [];
  let score = 100;

  for (const danger of DANGEROUS_PATTERNS) {
    if (danger.pattern.test(pattern)) {
      warnings.push(danger.message);
      if (danger.severity === "critical") score -= 50;
      if (danger.severity === "warning") score -= 20;
      if (danger.severity === "info") score -= 5;
    }
  }

  return {
    score: Math.max(0, score),
    isDangerous: score <= 50,
    warnings
  };
}

function tokenizeRegex(pattern: string, locale: RegexLocale = "en"): RegexToken[] {
  const s = getStrings(locale);
  const tokenExplanations = s.tokens;
  const tokens: RegexToken[] = [];
  let i = 0;

  while (i < pattern.length) {
    const char = pattern[i] as string;
    const nextChar = pattern[i + 1] ?? "";

    // Escape sequences
    if (char === "\\") {
      const escapeSeq = char + (nextChar || "");
      const description =
        tokenExplanations[escapeSeq] ??
        s.escapedChar(nextChar);
      tokens.push({
        type: "escape",
        value: escapeSeq,
        description,
        start: i,
        end: i + 2,
      });
      i += 2;
      continue;
    }

    // Character classes [...]
    if (char === "[") {
      const end = findMatchingBracket(pattern, i, "[", "]");
      const classContent = pattern.slice(i, end + 1);
      tokens.push({
        type: "charClass",
        value: classContent,
        description: explainCharClass(classContent, locale),
        start: i,
        end: end + 1,
      });
      i = end + 1;
      continue;
    }

    // Groups (...)
    if (char === "(") {
      const end = findMatchingBracket(pattern, i, "(", ")");
      const groupContent = pattern.slice(i, end + 1);
      tokens.push({
        type: "group",
        value: groupContent,
        description: explainGroup(groupContent, locale),
        start: i,
        end: end + 1,
      });
      i = end + 1;
      continue;
    }

    // Quantifiers
    if (char === "{") {
      const end = pattern.indexOf("}", i);
      if (end !== -1) {
        const quantifier = pattern.slice(i, end + 1);
        tokens.push({
          type: "quantifier",
          value: quantifier,
          description: explainQuantifier(quantifier, locale),
          start: i,
          end: end + 1,
        });
        i = end + 1;
        continue;
      }
    }

    // Simple quantifiers
    if ("*+?".includes(char)) {
      tokens.push({
        type: "quantifier",
        value: char,
        description: tokenExplanations[char] ?? char,
        start: i,
        end: i + 1,
      });
      i++;
      continue;
    }

    // Anchors
    if ("^$".includes(char)) {
      tokens.push({
        type: "anchor",
        value: char,
        description: tokenExplanations[char] ?? char,
        start: i,
        end: i + 1,
      });
      i++;
      continue;
    }

    // Alternation
    if (char === "|") {
      tokens.push({
        type: "alternation",
        value: char,
        description: tokenExplanations[char] ?? char,
        start: i,
        end: i + 1,
      });
      i++;
      continue;
    }

    // Dot
    if (char === ".") {
      tokens.push({
        type: "literal",
        value: char,
        description: tokenExplanations[char] ?? char,
        start: i,
        end: i + 1,
      });
      i++;
      continue;
    }

    // Literal character
    tokens.push({
      type: "literal",
      value: char,
      description: s.literalChar(char),
      start: i,
      end: i + 1,
    });
    i++;
  }

  return tokens;
}

function findMatchingBracket(
  str: string,
  start: number,
  open: string,
  close: string
): number {
  let depth = 0;
  for (let i = start; i < str.length; i++) {
    if (str[i] === "\\" && i + 1 < str.length) {
      i++; // Skip escaped characters
      continue;
    }
    if (str[i] === open) depth++;
    if (str[i] === close) depth--;
    if (depth === 0) return i;
  }
  return str.length - 1;
}

function explainCharClass(charClass: string, locale: RegexLocale = "en"): string {
  const s = getStrings(locale);
  const inner = charClass.slice(1, -1);
  const isNegated = inner.startsWith("^");
  const content = isNegated ? inner.slice(1) : inner;

  const parts: string[] = [];

  if (content.includes("a-z")) parts.push(s.lowercaseLetters);
  if (content.includes("A-Z")) parts.push(s.uppercaseLetters);
  if (content.includes("0-9")) parts.push(s.digits);
  if (content.includes("\\d")) parts.push(s.digits);
  if (content.includes("\\w")) parts.push(s.wordChars);
  if (content.includes("\\s")) parts.push(s.spaces);

  // Check for specific characters
  const specials = content
    .replace(/[a-z]-[a-z]|[A-Z]-[A-Z]|[0-9]-[0-9]|\\[dws]/gi, "")
    .replace(/[\[\]^]/g, "");
  if (specials) {
    parts.push(s.characters(specials.split("").join(", ")));
  }

  const desc = parts.length > 0 ? parts.join(", ") : s.charSet;
  return isNegated ? s.anyCharExcept(desc) : s.oneOf(desc);
}

function explainGroup(group: string, locale: RegexLocale = "en"): string {
  const s = getStrings(locale);
  const inner = group.slice(1, -1);

  if (inner.startsWith("?:")) {
    return s.nonCapturingGroup(inner.slice(2));
  }
  if (inner.startsWith("?=")) {
    return s.positiveLookahead(inner.slice(2));
  }
  if (inner.startsWith("?!")) {
    return s.negativeLookahead(inner.slice(2));
  }
  if (inner.startsWith("?<=")) {
    return s.positiveLookbehind(inner.slice(3));
  }
  if (inner.startsWith("?<!")) {
    return s.negativeLookbehind(inner.slice(3));
  }

  return s.captureGroup(inner);
}

function explainQuantifier(quantifier: string, locale: RegexLocale = "en"): string {
  const s = getStrings(locale);
  // eslint-disable-next-line security/detect-unsafe-regex -- simple quantifier parser
  const match = quantifier.match(/\{(\d+)(?:,(\d*))?\}/);
  if (!match || !match[1]) return s.quantifierLabel(quantifier);

  const min = match[1];
  const max = match[2];

  if (max === undefined) {
    return s.exactlyN(min);
  }
  if (max === "") {
    return s.nOrMore(min);
  }
  return s.betweenNAndM(min, max);
}

function extractGroups(pattern: string, locale: RegexLocale = "en"): RegexGroup[] {
  const groups: RegexGroup[] = [];
  let groupIndex = 0;
  let depth = 0;
  let groupStart = -1;

  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === "\\" && i + 1 < pattern.length) {
      i++; // Skip escaped
      continue;
    }

    if (pattern[i] === "(") {
      if (depth === 0) {
        groupStart = i;
      }
      depth++;
    }

    if (pattern[i] === ")") {
      depth--;
      if (depth === 0 && groupStart !== -1) {
        const groupContent = pattern.slice(groupStart, i + 1);
        const inner = groupContent.slice(1, -1);

        // Skip non-capturing groups for numbering
        if (!inner.startsWith("?:") && !inner.startsWith("?")) {
          groupIndex++;
          groups.push({
            index: groupIndex,
            pattern: groupContent,
            description: explainGroup(groupContent, locale),
            start: groupStart,
            end: i + 1,
          });
        }
        groupStart = -1;
      }
    }
  }

  return groups;
}

function detectCommonPattern(pattern: string, patterns: CommonPattern[]): CommonPattern | null {
  const normalizedPattern = pattern.replace(/\\\\/g, "\\");

  for (const common of patterns) {
    // Normalize both patterns for comparison
    const normalizedCommon = common.pattern.replace(/\\\\/g, "\\");
    if (normalizedPattern === normalizedCommon) {
      return common;
    }
  }

  // Check for partial matches
  if (pattern.includes("@") && pattern.includes("\\.")) {
    return patterns.find((p) => p.id === "email") ?? null;
  }
  if (pattern.includes("https?") || pattern.includes("http")) {
    return patterns.find((p) => p.id === "url") ?? null;
  }

  return null;
}

function buildExplanation(
  tokens: RegexToken[],
  groups: RegexGroup[],
  commonPattern: CommonPattern | null,
  flags: string,
  locale: RegexLocale = "en"
): string {
  const s = getStrings(locale);
  const lines: string[] = [];

  if (commonPattern) {
    lines.push(`\u{1F4CB} ${s.patternDetected(commonPattern.name)}`);
    lines.push(`   ${commonPattern.description}`);
    lines.push("");
  }

  lines.push(`\u{1F4DD} ${s.patternBreakdown}`);
  lines.push("");

  for (const token of tokens) {
    const indent = "   ";
    lines.push(`${indent}${token.value} \u2192 ${token.description}`);
  }

  if (groups.length > 0) {
    lines.push("");
    lines.push(`\u{1F3AF} ${s.captureGroups}`);
    for (const group of groups) {
      lines.push(`   ${s.groupLabel(group.index, group.pattern)}`);
      lines.push(`      ${group.description}`);
    }
  }

  if (flags) {
    lines.push("");
    lines.push(`\u{1F6A9} ${s.flags}`);
    if (flags.includes("g")) lines.push(`   ${s.flagG}`);
    if (flags.includes("i")) lines.push(`   ${s.flagI}`);
    if (flags.includes("m")) lines.push(`   ${s.flagM}`);
    if (flags.includes("s")) lines.push(`   ${s.flagS}`);
    if (flags.includes("u")) lines.push(`   ${s.flagU}`);
    if (flags.includes("y")) lines.push(`   ${s.flagY}`);
  }

  return lines.join("\n");
}

// --- Generate Regex from Description ---
export function generateRegex(description: string, locale: RegexLocale = "en"): string {
  const desc = description.toLowerCase();
  const patterns = getCommonPatterns(locale);
  const s = getStrings(locale);
  const kw = s.keywords;

  // Build Map for O(1) pattern lookup by id
  const patternMap = new Map(patterns.map((p) => [p.id, p.pattern]));
  const getPattern = (id: string): string => patternMap.get(id) ?? "^.*$";

  // Check for common pattern keywords
  if (kw.email.some((k) => desc.includes(k))) {
    return getPattern("email");
  }
  if (kw.url.some((k) => desc.includes(k))) {
    return getPattern("url");
  }
  if (kw.phone.some((k) => desc.includes(k))) {
    if (kw.phoneSpanish.some((k) => desc.includes(k))) {
      return getPattern("phone-es");
    }
    return "^\\+?[\\d\\s\\-\\(\\)]+$";
  }
  if (kw.date.some((k) => desc.includes(k))) {
    if (kw.dateIso.some((k) => desc.includes(k))) {
      return getPattern("date-iso");
    }
    if (kw.dateDDMM.some((k) => desc.includes(k))) {
      return "^\\d{2}/\\d{2}/\\d{4}$";
    }
    return getPattern("date-iso");
  }
  if (kw.ip.some((k) => desc.includes(k))) {
    return getPattern("ipv4");
  }
  if (kw.password.some((k) => desc.includes(k))) {
    return getPattern("password");
  }
  if (kw.dni.some((k) => desc.includes(k))) {
    return getPattern("dni-es");
  }
  if (kw.color.some((k) => desc.includes(k))) {
    return getPattern("hex-color");
  }

  // Parse digit patterns (both EN and ES keywords accepted regardless of locale)
  const digitMatchEn = desc.match(kw.digits);
  const digitMatchEs = desc.match(kw.digitsEs);
  const digitMatch = digitMatchEn ?? digitMatchEs;
  if (digitMatch && digitMatch[1]) {
    const countNum = Math.max(1, Math.min(parseInt(digitMatch[1]) || 1, 100));
    const startMatchEn = desc.match(kw.startingWith);
    const startMatchEs = desc.match(kw.startingWithEs);
    const startMatch = startMatchEn ?? startMatchEs;
    if (startMatch && startMatch[1]) {
      const starts = startMatch[1].replace(/\s/g, "").split(",").join("");
      return `^[${starts}]\\d{${countNum - 1}}$`;
    }
    return `^\\d{${countNum}}$`;
  }

  // Parse letter patterns
  if (kw.letters.some((k) => desc.includes(k))) {
    if (kw.uppercase.some((k) => desc.includes(k))) {
      return "^[A-Z]+$";
    }
    if (kw.lowercase.some((k) => desc.includes(k))) {
      return "^[a-z]+$";
    }
    return "^[a-zA-Z]+$";
  }

  // Alphanumeric
  if (kw.alphanumeric.some((k) => desc.includes(k))) {
    return "^[a-zA-Z0-9]+$";
  }

  // Default: return a basic pattern hint
  return "^.*$";
}

/** Default group colors — UI concern injected into test results for rendering */
export const DEFAULT_GROUP_COLORS = [
  "text-blue-600 dark:text-blue-400",
  "text-emerald-600 dark:text-emerald-400",
  "text-purple-600 dark:text-purple-400",
  "text-amber-600 dark:text-amber-400",
  "text-rose-600 dark:text-rose-400",
  "text-indigo-600 dark:text-indigo-400",
];

// --- Test Regex ---
const MAX_PATTERN_LENGTH = 500;
const MAX_TEST_INPUT_LENGTH = 50_000;

export function testRegex(patternInput: string, input: string, locale: RegexLocale = "en", groupColors: string[] = DEFAULT_GROUP_COLORS): TestResult {
  const s = getStrings(locale);

  if (patternInput.length > MAX_PATTERN_LENGTH) {
    return { pattern: patternInput, input, isValid: false, matches: false, allMatches: [], error: "Pattern too long (max 500 characters)" };
  }
  if (input.length > MAX_TEST_INPUT_LENGTH) {
    return { pattern: patternInput, input, isValid: false, matches: false, allMatches: [], error: "Test input too long (max 50,000 characters)" };
  }

  let pattern = patternInput;
  let flags = "g";

  // Handle /pattern/flags format
  const regexMatch = patternInput.match(/^\/(.+)\/([gimsuy]*)$/);
  if (regexMatch && regexMatch[1]) {
    pattern = regexMatch[1];
    flags = regexMatch[2] || "g";
    if (!flags.includes("g")) flags += "g";
  }

  try {
    // eslint-disable-next-line security/detect-non-literal-regexp -- core tool: compiles user regex for testing
    const regex = new RegExp(pattern, flags);
    const allMatches: TestMatch[] = [];
    const MAX_MATCHES = 500;
    const TIMEOUT_MS = 2000;
    const startTime = Date.now();

    let match;
    while ((match = regex.exec(input)) !== null) {
      if (allMatches.length >= MAX_MATCHES || Date.now() - startTime > TIMEOUT_MS) {
        break;
      }

      const groups: Record<string, string> = {};
      const groupColorMap: Record<string, string> = {};

      // Named groups (safe copy, skip prototype pollution keys)
      if (match.groups) {
        for (const [k, v] of Object.entries(match.groups)) {
          if (k !== "__proto__" && k !== "constructor" && k !== "prototype") {
            groups[k] = v ?? "";
          }
        }
      }

      // Numbered groups
      for (let i = 1; i < match.length; i++) {
        const groupValue = match[i];
        if (groupValue !== undefined) {
          groups[`$${i}`] = groupValue;
          groupColorMap[`$${i}`] = groupColors[(i - 1) % groupColors.length]!;
        }
      }

      allMatches.push({
        match: match[0] ?? "",
        index: match.index,
        groups,
        groupColors: groupColorMap,
      });

      // Prevent infinite loops with zero-length matches (Unicode-safe)
      if ((match[0] ?? "").length === 0) {
        const cp = input.codePointAt(regex.lastIndex);
        regex.lastIndex += cp !== undefined && cp > 0xFFFF ? 2 : 1;
      }
    }

    return {
      pattern,
      input,
      isValid: true,
      matches: allMatches.length > 0,
      allMatches,
      error: null,
    };
  } catch (e) {
    return {
      pattern,
      input,
      isValid: false,
      matches: false,
      allMatches: [],
      error: e instanceof Error ? e.message : s.invalidRegex,
    };
  }
}

// --- Validate Regex Syntax ---
export function isValidRegex(pattern: string): boolean {
  try {
    // Handle /pattern/flags format
    const match = pattern.match(/^\/(.+)\/([gimsuy]*)$/);
    if (match && match[1]) {
      // eslint-disable-next-line security/detect-non-literal-regexp -- validation of user regex
      new RegExp(match[1], match[2] ?? "");
    } else {
      // eslint-disable-next-line security/detect-non-literal-regexp -- validation of user regex
      new RegExp(pattern);
    }
    return true;
  } catch {
    return false;
  }
}
