import type { PromptIssue } from "@/types/prompt-analyzer";

const LABELS = {
  en: {
    roles: {
      default: "an expert assistant",
      code: "a Senior Software Engineer and Architect",
      write: "a Professional Content Writer and Editor",
      business: "a Strategic Business Consultant",
      design: "a Senior UI/UX Designer",
    },
    actAs: "Act as",
    goalLine: "Your goal is to provide a high-quality, professional, and accurate response.",
    contextPlaceholder: "[Provide detailed background or context here to improve results]",
    contextDefault: "The user is seeking assistance with the following request.",
    chainOfThought: "Reason through the task step-by-step to ensure logical consistency.",
    noConstraints: "Avoid filler text and maintain a professional, direct tone.",
    successCriteria: "Ensure the final output is comprehensive and directly addresses the core objective.",
    examples: "If possible, provide illustrative examples to clarify your response.",
    followAll: "Follow all instructions strictly and maintain the specified persona throughout.",
    outputFormat: "Please provide the response in a structured and well-formatted manner using Markdown. Use clear headings, lists, or tables where appropriate to maximize readability.",
    recommended: "Recommended Parameters",
  },
  es: {
    roles: {
      default: "un asistente experto",
      code: "un Ingeniero de Software Senior y Arquitecto",
      write: "un Redactor y Editor de Contenido Profesional",
      business: "un Consultor Estrategico de Negocios",
      design: "un Disenador UI/UX Senior",
    },
    actAs: "Actua como",
    goalLine: "Tu objetivo es proporcionar una respuesta de alta calidad, profesional y precisa.",
    contextPlaceholder: "[Proporciona contexto o antecedentes detallados aqui para mejorar los resultados]",
    contextDefault: "El usuario solicita asistencia con la siguiente peticion.",
    chainOfThought: "Razona paso a paso para asegurar consistencia logica.",
    noConstraints: "Evita texto de relleno y manten un tono profesional y directo.",
    successCriteria: "Asegura que el resultado final sea completo y aborde directamente el objetivo principal.",
    examples: "Si es posible, proporciona ejemplos ilustrativos para clarificar tu respuesta.",
    followAll: "Sigue todas las instrucciones estrictamente y manten el rol asignado en todo momento.",
    outputFormat: "Proporciona la respuesta de forma estructurada y bien formateada usando Markdown. Usa encabezados claros, listas o tablas donde sea apropiado para maximizar la legibilidad.",
    recommended: "Parametros Recomendados",
  },
} as const;

function detectLang(text: string): "en" | "es" {
  const esPatterns = /\b(hazme|haz|crear|crea|quiero|necesito|dame|dime|escribe|genera|analiza|explica|como|para|una|con|del|de|los|las|por|que|esto|esta|hacer|tiene|puede|sobre|desde|tambien|seria|podrias|ayuda|favor|mejor|ejemplo|proyecto|pagina|aplicacion|usuario|datos|archivo|codigo|funcion|clase|imagen|texto|problema|solucion|resultado)\b/gi;
  const esCount = (text.match(esPatterns) || []).length;
  return esCount >= 2 ? "es" : "en";
}

export function refinePrompt(prompt: string, issues: PromptIssue[]): string {
  const issueTypes = new Set(issues.map((i) => i.type));
  const lowerPrompt = prompt.toLowerCase();
  const lang = detectLang(prompt);
  const l = LABELS[lang];

  // 1. Identify Role
  let role: string = l.roles.default;
  if (/\b(code|react|nextjs|typescript|javascript|python|rust|golang|java|c\+\+|coding|program|codigo|programar|desarrollo|web)\b/i.test(lowerPrompt)) {
    role = l.roles.code;
  } else if (/\b(write|article|blog|essay|copy|content|story|escribe|articulo|redacta|contenido|historia|ensayo)\b/i.test(lowerPrompt)) {
    role = l.roles.write;
  } else if (/\b(market|sell|business|strategy|startup|product|negocio|estrategia|vender|producto|mercado|empresa)\b/i.test(lowerPrompt)) {
    role = l.roles.business;
  } else if (/\b(design|ui|ux|layout|css|tailwind|style|figma|diseno|interfaz|estilo|maqueta)\b/i.test(lowerPrompt)) {
    role = l.roles.design;
  }

  // 2. Build Structural Components (XML Style like Anthropic)
  let refined = `<role>
${l.actAs} ${role}. ${l.goalLine}
</role>

<context>
${issueTypes.has("missing_context") ? l.contextPlaceholder : l.contextDefault}
</context>

<task>
${prompt}
</task>

<guidelines>
${issueTypes.has("no_chain_of_thought") ? `- ${l.chainOfThought}\n` : ""}${issueTypes.has("no_constraints") ? `- ${l.noConstraints}\n` : ""}${issueTypes.has("no_success_criteria") ? `- ${l.successCriteria}\n` : ""}${issueTypes.has("missing_examples") ? `- ${l.examples}\n` : ""}- ${l.followAll}
</guidelines>`;

  // 3. Output Format
  if (issueTypes.has("no_output_format")) {
    refined += `\n\n<output_format>
${l.outputFormat}
</output_format>`;
  }

  // 4. Parameter Hints
  let params = "";
  if (/\b(code|math|calculate|logic|reason|algorithm|codigo|calcular|logica|algoritmo)\b/i.test(lowerPrompt)) {
    params = `\n\n<!-- ${l.recommended}: Temperature: 0.0, Top-P: 1.0 -->`;
  } else if (/\b(creative|story|poem|brainstorm|idea|creativo|historia|poema|lluvia de ideas)\b/i.test(lowerPrompt)) {
    params = `\n\n<!-- ${l.recommended}: Temperature: 0.8, Top-P: 0.9 -->`;
  }

  return `${refined}${params}`.trim();
}
