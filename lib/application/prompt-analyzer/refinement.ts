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
  fr: {
    roles: {
      default: "un assistant expert",
      code: "un Ingénieur Logiciel Senior et Architecte",
      write: "un Rédacteur et Éditeur de Contenu Professionnel",
      business: "un Consultant Stratégique en Affaires",
      design: "un Designer UI/UX Senior",
    },
    actAs: "Agis en tant que",
    goalLine: "Ton objectif est de fournir une réponse de haute qualité, professionnelle et précise.",
    contextPlaceholder: "[Fournis un contexte ou des informations détaillées ici pour améliorer les résultats]",
    contextDefault: "L'utilisateur demande de l'aide pour la requête suivante.",
    chainOfThought: "Raisonne étape par étape pour assurer la cohérence logique.",
    noConstraints: "Évite le texte de remplissage et maintiens un ton professionnel et direct.",
    successCriteria: "Assure-toi que le résultat final est complet et répond directement à l'objectif principal.",
    examples: "Si possible, fournis des exemples illustratifs pour clarifier ta réponse.",
    followAll: "Suis toutes les instructions strictement et maintiens le rôle assigné tout au long.",
    outputFormat: "Fournis la réponse de manière structurée et bien formatée en Markdown. Utilise des titres clairs, des listes ou des tableaux si approprié pour maximiser la lisibilité.",
    recommended: "Paramètres recommandés",
  },
  pt: {
    roles: {
      default: "um assistente especialista",
      code: "um Engenheiro de Software Sênior e Arquiteto",
      write: "um Redator e Editor de Conteúdo Profissional",
      business: "um Consultor Estratégico de Negócios",
      design: "um Designer UI/UX Sênior",
    },
    actAs: "Atue como",
    goalLine: "Seu objetivo é fornecer uma resposta de alta qualidade, profissional e precisa.",
    contextPlaceholder: "[Forneça contexto ou informações detalhadas aqui para melhorar os resultados]",
    contextDefault: "O usuário solicita assistência com o seguinte pedido.",
    chainOfThought: "Raciocine passo a passo para garantir consistência lógica.",
    noConstraints: "Evite texto de preenchimento e mantenha um tom profissional e direto.",
    successCriteria: "Certifique-se de que o resultado final seja completo e aborde diretamente o objetivo principal.",
    examples: "Se possível, forneça exemplos ilustrativos para esclarecer sua resposta.",
    followAll: "Siga todas as instruções rigorosamente e mantenha o papel atribuído durante todo o processo.",
    outputFormat: "Forneça a resposta de forma estruturada e bem formatada usando Markdown. Use títulos claros, listas ou tabelas quando apropriado para maximizar a legibilidade.",
    recommended: "Parâmetros Recomendados",
  },
  de: {
    roles: {
      default: "ein Experten-Assistent",
      code: "ein Senior Software-Ingenieur und Architekt",
      write: "ein professioneller Content-Autor und Redakteur",
      business: "ein strategischer Unternehmensberater",
      design: "ein Senior UI/UX-Designer",
    },
    actAs: "Agiere als",
    goalLine: "Dein Ziel ist es, eine hochwertige, professionelle und präzise Antwort zu liefern.",
    contextPlaceholder: "[Gib hier detaillierten Hintergrund oder Kontext an, um die Ergebnisse zu verbessern]",
    contextDefault: "Der Benutzer bittet um Unterstützung bei folgender Anfrage.",
    chainOfThought: "Denke Schritt für Schritt, um logische Konsistenz sicherzustellen.",
    noConstraints: "Vermeide Fülltext und halte einen professionellen, direkten Ton ein.",
    successCriteria: "Stelle sicher, dass das Endergebnis umfassend ist und das Kernziel direkt anspricht.",
    examples: "Wenn möglich, gib anschauliche Beispiele an, um deine Antwort zu verdeutlichen.",
    followAll: "Befolge alle Anweisungen strikt und halte die zugewiesene Rolle durchgehend ein.",
    outputFormat: "Gib die Antwort in einer strukturierten und gut formatierten Weise in Markdown an. Verwende klare Überschriften, Listen oder Tabellen, wo es angemessen ist, um die Lesbarkeit zu maximieren.",
    recommended: "Empfohlene Parameter",
  },
  it: {
    roles: {
      default: "un assistente esperto",
      code: "un Ingegnere del Software Senior e Architetto",
      write: "un Redattore e Editore di Contenuti Professionista",
      business: "un Consulente Strategico Aziendale",
      design: "un Designer UI/UX Senior",
    },
    actAs: "Agisci come",
    goalLine: "Il tuo obiettivo è fornire una risposta di alta qualità, professionale e accurata.",
    contextPlaceholder: "[Fornisci contesto o informazioni dettagliate qui per migliorare i risultati]",
    contextDefault: "L'utente richiede assistenza per la seguente richiesta.",
    chainOfThought: "Ragiona passo dopo passo per garantire coerenza logica.",
    noConstraints: "Evita testo di riempimento e mantieni un tono professionale e diretto.",
    successCriteria: "Assicurati che il risultato finale sia completo e affronti direttamente l'obiettivo principale.",
    examples: "Se possibile, fornisci esempi illustrativi per chiarire la tua risposta.",
    followAll: "Segui tutte le istruzioni rigorosamente e mantieni il ruolo assegnato per tutta la durata.",
    outputFormat: "Fornisci la risposta in modo strutturato e ben formattato usando Markdown. Usa intestazioni chiare, elenchi o tabelle dove appropriato per massimizzare la leggibilità.",
    recommended: "Parametri Consigliati",
  },
  zh: {
    roles: {
      default: "一位专业助手",
      code: "一位高级软件工程师和架构师",
      write: "一位专业内容撰稿人和编辑",
      business: "一位战略商业顾问",
      design: "一位高级 UI/UX 设计师",
    },
    actAs: "扮演",
    goalLine: "你的目标是提供高质量、专业且准确的回答。",
    contextPlaceholder: "[在此提供详细的背景或上下文信息以改善结果]",
    contextDefault: "用户正在寻求以下请求的帮助。",
    chainOfThought: "逐步推理以确保逻辑一致性。",
    noConstraints: "避免填充文字，保持专业、直接的语气。",
    successCriteria: "确保最终输出全面且直接解决核心目标。",
    examples: "如有可能，请提供说明性示例以阐明你的回答。",
    followAll: "严格遵循所有指示，并在整个过程中保持指定的角色。",
    outputFormat: "请以结构化且格式良好的 Markdown 方式提供回答。在适当时使用清晰的标题、列表或表格以最大化可读性。",
    recommended: "推荐参数",
  },
  ja: {
    roles: {
      default: "エキスパートアシスタント",
      code: "シニアソフトウェアエンジニア兼アーキテクト",
      write: "プロフェッショナルなコンテンツライター兼エディター",
      business: "戦略的ビジネスコンサルタント",
      design: "シニア UI/UX デザイナー",
    },
    actAs: "次の役割を演じてください：",
    goalLine: "あなたの目標は、高品質でプロフェッショナルかつ正確な回答を提供することです。",
    contextPlaceholder: "[結果を改善するための詳細な背景やコンテキストをここに記入してください]",
    contextDefault: "ユーザーは以下のリクエストについて支援を求めています。",
    chainOfThought: "論理的な一貫性を確保するため、ステップバイステップで推論してください。",
    noConstraints: "無駄なテキストを避け、プロフェッショナルで直接的なトーンを維持してください。",
    successCriteria: "最終結果が包括的で、核心的な目標に直接対応していることを確認してください。",
    examples: "可能であれば、回答を明確にするための具体例を提供してください。",
    followAll: "すべての指示に厳密に従い、全体を通して指定された役割を維持してください。",
    outputFormat: "Markdown を使用して、構造化された見やすい形式で回答を提供してください。読みやすさを最大化するため、適切な箇所で明確な見出し、リスト、表を使用してください。",
    recommended: "推奨パラメータ",
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
