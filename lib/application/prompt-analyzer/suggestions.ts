import type { PromptDimension, PromptIssue, SecurityFlag } from "@/types/prompt-analyzer";

function detectLang(text: string): "en" | "es" {
  const esPatterns = /\b(hazme|haz|crear|crea|quiero|necesito|dame|dime|escribe|genera|analiza|explica|como|para|una|con|del|de|los|las|por|que|esto|esta|hacer|tiene|puede|sobre|desde|tambien|seria|podrias|ayuda|favor|mejor|ejemplo|proyecto|pagina|aplicacion|usuario|datos|archivo|codigo|funcion|clase|imagen|texto|problema|solucion|resultado)\b/gi;
  const esCount = (text.match(esPatterns) || []).length;
  return esCount >= 2 ? "es" : "en";
}

type LangMap<T> = { en: T; es: T };

const ANATOMY_SUGGESTIONS: LangMap<Record<string, string>> = {
  en: {
    role: 'Define a professional role: e.g., "Act as a senior backend developer specialized in REST APIs"',
    task: 'Be specific about your objective: e.g., "Create a REST API endpoint that validates user input and returns a structured JSON response"',
    context: 'Provide background context: technology stack, project type, environment, and target audience',
    steps: 'Break down the task into steps: e.g., "First, analyze the requirements. Then, implement the solution. Finally, write tests."',
    format: 'Specify the expected output format: e.g., "Return as JSON", "Format as a markdown table", "Provide as a code block"',
    constraints: 'Add constraints and restrictions: e.g., "Avoid deprecated APIs", "Maximum 200 lines", "Follow SOLID principles"',
    clarification: 'Add a clarification clause: e.g., "If anything is unclear, ask before proceeding"',
  },
  es: {
    role: 'Define un rol profesional: ej., "Actúa como un desarrollador backend senior especializado en APIs REST"',
    task: 'Sé específico con tu objetivo: ej., "Crea un endpoint REST API que valide la entrada del usuario y devuelva una respuesta JSON estructurada"',
    context: 'Proporciona contexto: stack tecnológico, tipo de proyecto, entorno y audiencia objetivo',
    steps: 'Desglosa la tarea en pasos: ej., "Primero, analiza los requisitos. Luego, implementa la solución. Finalmente, escribe tests."',
    format: 'Especifica el formato de salida esperado: ej., "Devuelve como JSON", "Formatea como tabla markdown", "Proporciona como bloque de código"',
    constraints: 'Añade restricciones: ej., "Evita APIs obsoletas", "Máximo 200 líneas", "Sigue los principios SOLID"',
    clarification: 'Añade una cláusula de clarificación: ej., "Si algo no está claro, pregunta antes de continuar"',
  },
};

const ISSUE_SUGGESTIONS: LangMap<Record<string, string>> = {
  en: {
    vague_instruction: "Add more specific details about what you want to accomplish",
    missing_context: "Provide background information or context for better results",
    no_output_format: 'Specify the desired output format (e.g., "Respond in JSON format")',
    missing_role: 'Define a role for the AI (e.g., "Act as a senior developer...")',
    too_long: "Consider breaking this into multiple smaller, focused prompts",
    redundant: "Remove repetitive content to make the prompt more concise",
    vague_terms: 'Replace vague terms like "something" or "stuff" with specific nouns',
    no_constraints: 'Add constraints to narrow the output (e.g., "Avoid using deprecated APIs")',
    no_success_criteria: 'Define success criteria (e.g., "The result should handle edge cases")',
    no_audience: 'Specify the target audience (e.g., "for beginner developers")',
    missing_examples: "Add examples of the expected input and output (Few-Shot prompting)",
    no_chain_of_thought: 'Include instructions for the AI to "think step-by-step" or "reason through the task"',
    missing_delimiters: "Use clear delimiters like ### or XML tags (e.g., <context>) to separate different parts of the prompt",
    poor_structure: "Improve prompt structure using paragraphs, headers, and bullet points",
    virtualization_risk: 'Add strict constraints (e.g., "Stay in character only") when using virtualization or simulation',
    payload_splitting_risk: "Check for suspicious spacing or encoding that might be misinterpreted as an injection attempt",
    security: "Review and remove any content that could be interpreted as prompt injection",
    positive: "Your prompt looks good! Consider adding examples for even better results.",
  },
  es: {
    vague_instruction: "Añade detalles más específicos sobre lo que quieres lograr",
    missing_context: "Proporciona información de contexto o antecedentes para mejores resultados",
    no_output_format: 'Especifica el formato de salida deseado (ej., "Responde en formato JSON")',
    missing_role: 'Define un rol para la IA (ej., "Actúa como un desarrollador senior...")',
    too_long: "Considera dividir esto en varios prompts más pequeños y enfocados",
    redundant: "Elimina el contenido repetitivo para hacer el prompt más conciso",
    vague_terms: 'Reemplaza términos vagos como "algo" o "cosas" con sustantivos específicos',
    no_constraints: 'Añade restricciones para acotar la salida (ej., "Evita usar APIs obsoletas")',
    no_success_criteria: 'Define criterios de éxito (ej., "El resultado debe manejar casos límite")',
    no_audience: 'Especifica la audiencia objetivo (ej., "para desarrolladores principiantes")',
    missing_examples: "Añade ejemplos de la entrada y salida esperada (Few-Shot prompting)",
    no_chain_of_thought: 'Incluye instrucciones para que la IA "piense paso a paso" o "razone la tarea"',
    missing_delimiters: "Usa delimitadores claros como ### o etiquetas XML (ej., <context>) para separar las partes del prompt",
    poor_structure: "Mejora la estructura del prompt usando párrafos, encabezados y viñetas",
    virtualization_risk: 'Añade restricciones estrictas (ej., "Mantén solo el personaje") al usar virtualización o simulación',
    payload_splitting_risk: "Revisa si hay espaciado o codificación sospechosa que pueda interpretarse como un intento de inyección",
    security: "Revisa y elimina cualquier contenido que pueda interpretarse como inyección de prompt",
    positive: "Tu prompt se ve bien. Considera añadir ejemplos para obtener resultados aún mejores.",
  },
};

const WEAK_THRESHOLD = 30;

const DEDUP_KEYS: Record<string, string> = {
  missing_context: "context",
  no_output_format: "output format",
  missing_role: "role",
  no_constraints: "constraints",
};

export function generateSuggestions(
  dimensions: PromptDimension[],
  issues: PromptIssue[],
  securityFlags: SecurityFlag[],
  prompt = "",
): string[] {
  const lang = detectLang(prompt);
  const anatomySugs = lang === "es" ? ANATOMY_SUGGESTIONS.es : ANATOMY_SUGGESTIONS.en;
  const issueSugs = lang === "es" ? ISSUE_SUGGESTIONS.es : ISSUE_SUGGESTIONS.en;
  const suggestions: string[] = [];

  // 1. Anatomy-based suggestions (primary)
  for (const dim of dimensions) {
    if (dim.score < WEAK_THRESHOLD) {
      const tip = anatomySugs[dim.id];
      if (tip) suggestions.push(tip);
    }
  }

  // 2. Quality issue suggestions (secondary)
  const issueTypes = new Set(issues.map((i) => i.type));

  for (const type of issueTypes) {
    const dedupKey = DEDUP_KEYS[type];
    if (dedupKey && suggestions.some(s => s.toLowerCase().includes(dedupKey))) continue;
    const sug = issueSugs[type];
    if (sug) suggestions.push(sug);
  }

  // 3. Security-related suggestions
  if (securityFlags.length > 0) {
    const secSug = issueSugs["security"];
    if (secSug) suggestions.push(secSug);
  }

  // 4. Positive feedback if nothing wrong
  if (suggestions.length === 0) {
    const posSug = issueSugs["positive"];
    if (posSug) suggestions.push(posSug);
  }

  return suggestions;
}
