import type { PromptDimension, PromptIssue, SecurityFlag } from "@/types/prompt-analyzer";

function detectLang(text: string): "en" | "es" {
  const esPatterns = /\b(hazme|haz|crear|crea|quiero|necesito|dame|dime|escribe|genera|analiza|explica|como|para|una|con|del|de|los|las|por|que|esto|esta|hacer|tiene|puede|sobre|desde|tambien|seria|podrias|ayuda|favor|mejor|ejemplo|proyecto|pagina|aplicacion|usuario|datos|archivo|codigo|funcion|clase|imagen|texto|problema|solucion|resultado)\b/gi;
  const esCount = (text.match(esPatterns) || []).length;
  return esCount >= 2 ? "es" : "en";
}

type LangMap<T> = Record<string, T>;

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
  fr: {
    role: 'Définissez un rôle professionnel : ex., "Agis en tant que développeur backend senior spécialisé dans les APIs REST"',
    task: 'Soyez précis sur votre objectif : ex., "Crée un endpoint REST API qui valide l\'entrée utilisateur et retourne une réponse JSON structurée"',
    context: 'Fournissez du contexte : stack technologique, type de projet, environnement et public cible',
    steps: 'Décomposez la tâche en étapes : ex., "D\'abord, analyse les exigences. Ensuite, implémente la solution. Enfin, écris les tests."',
    format: 'Spécifiez le format de sortie attendu : ex., "Retourne en JSON", "Formate en tableau markdown", "Fournis en bloc de code"',
    constraints: 'Ajoutez des contraintes : ex., "Évite les APIs obsolètes", "Maximum 200 lignes", "Suis les principes SOLID"',
    clarification: 'Ajoutez une clause de clarification : ex., "Si quelque chose n\'est pas clair, demande avant de continuer"',
  },
  pt: {
    role: 'Defina um papel profissional: ex., "Atue como um desenvolvedor backend sênior especializado em APIs REST"',
    task: 'Seja específico com seu objetivo: ex., "Crie um endpoint REST API que valide a entrada do usuário e retorne uma resposta JSON estruturada"',
    context: 'Forneça contexto: stack tecnológico, tipo de projeto, ambiente e público-alvo',
    steps: 'Divida a tarefa em etapas: ex., "Primeiro, analise os requisitos. Depois, implemente a solução. Por fim, escreva os testes."',
    format: 'Especifique o formato de saída esperado: ex., "Retorne como JSON", "Formate como tabela markdown", "Forneça como bloco de código"',
    constraints: 'Adicione restrições: ex., "Evite APIs obsoletas", "Máximo 200 linhas", "Siga os princípios SOLID"',
    clarification: 'Adicione uma cláusula de esclarecimento: ex., "Se algo não estiver claro, pergunte antes de continuar"',
  },
  de: {
    role: 'Definiere eine professionelle Rolle: z.B., "Agiere als Senior-Backend-Entwickler, spezialisiert auf REST-APIs"',
    task: 'Sei spezifisch mit deinem Ziel: z.B., "Erstelle einen REST-API-Endpunkt, der Benutzereingaben validiert und eine strukturierte JSON-Antwort zurückgibt"',
    context: 'Gib Hintergrundkontext an: Technologie-Stack, Projekttyp, Umgebung und Zielgruppe',
    steps: 'Unterteile die Aufgabe in Schritte: z.B., "Zuerst analysiere die Anforderungen. Dann implementiere die Lösung. Schließlich schreibe Tests."',
    format: 'Gib das erwartete Ausgabeformat an: z.B., "Gib als JSON zurück", "Formatiere als Markdown-Tabelle", "Stelle als Code-Block bereit"',
    constraints: 'Füge Einschränkungen hinzu: z.B., "Vermeide veraltete APIs", "Maximal 200 Zeilen", "Befolge die SOLID-Prinzipien"',
    clarification: 'Füge eine Klärungsklausel hinzu: z.B., "Falls etwas unklar ist, frage nach, bevor du fortfährst"',
  },
  it: {
    role: 'Definisci un ruolo professionale: es., "Agisci come uno sviluppatore backend senior specializzato in API REST"',
    task: 'Sii specifico con il tuo obiettivo: es., "Crea un endpoint REST API che validi l\'input dell\'utente e restituisca una risposta JSON strutturata"',
    context: 'Fornisci contesto: stack tecnologico, tipo di progetto, ambiente e pubblico di riferimento',
    steps: 'Suddividi il compito in passaggi: es., "Prima, analizza i requisiti. Poi, implementa la soluzione. Infine, scrivi i test."',
    format: 'Specifica il formato di output atteso: es., "Restituisci come JSON", "Formatta come tabella markdown", "Fornisci come blocco di codice"',
    constraints: 'Aggiungi vincoli: es., "Evita API obsolete", "Massimo 200 righe", "Segui i principi SOLID"',
    clarification: 'Aggiungi una clausola di chiarimento: es., "Se qualcosa non è chiaro, chiedi prima di procedere"',
  },
  zh: {
    role: '定义一个专业角色：例如，"扮演一名专精于 REST API 的资深后端开发工程师"',
    task: '明确你的目标：例如，"创建一个验证用户输入并返回结构化 JSON 响应的 REST API 端点"',
    context: '提供背景上下文：技术栈、项目类型、环境和目标受众',
    steps: '将任务分解为步骤：例如，"首先，分析需求。然后，实现解决方案。最后，编写测试。"',
    format: '指定期望的输出格式：例如，"以 JSON 返回"、"格式化为 Markdown 表格"、"以代码块提供"',
    constraints: '添加约束条件：例如，"避免使用已弃用的 API"、"最多 200 行"、"遵循 SOLID 原则"',
    clarification: '添加澄清条款：例如，"如有不清楚之处，请在继续之前先提问"',
  },
  ja: {
    role: 'プロフェッショナルな役割を定義してください：例、「REST API を専門とするシニアバックエンド開発者として振る舞ってください」',
    task: '目標を具体的にしてください：例、「ユーザー入力を検証し、構造化された JSON レスポンスを返す REST API エンドポイントを作成してください」',
    context: '背景コンテキストを提供してください：技術スタック、プロジェクトタイプ、環境、対象者',
    steps: 'タスクをステップに分解してください：例、「まず要件を分析し、次にソリューションを実装し、最後にテストを作成してください」',
    format: '期待する出力形式を指定してください：例、「JSON で返す」、「Markdown テーブルとしてフォーマット」、「コードブロックとして提供」',
    constraints: '制約を追加してください：例、「非推奨の API を避ける」、「最大 200 行」、「SOLID 原則に従う」',
    clarification: '明確化条項を追加してください：例、「不明な点があれば、続ける前に質問してください」',
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
  fr: {
    vague_instruction: "Ajoutez des détails plus spécifiques sur ce que vous souhaitez accomplir",
    missing_context: "Fournissez des informations de contexte ou des antécédents pour de meilleurs résultats",
    no_output_format: 'Spécifiez le format de sortie souhaité (ex., "Réponds au format JSON")',
    missing_role: 'Définissez un rôle pour l\'IA (ex., "Agis en tant que développeur senior...")',
    too_long: "Envisagez de diviser ceci en plusieurs prompts plus courts et ciblés",
    redundant: "Supprimez le contenu répétitif pour rendre le prompt plus concis",
    vague_terms: 'Remplacez les termes vagues comme "quelque chose" ou "des trucs" par des noms spécifiques',
    no_constraints: 'Ajoutez des contraintes pour affiner la sortie (ex., "Évite d\'utiliser des APIs obsolètes")',
    no_success_criteria: 'Définissez des critères de succès (ex., "Le résultat doit gérer les cas limites")',
    no_audience: 'Spécifiez le public cible (ex., "pour les développeurs débutants")',
    missing_examples: "Ajoutez des exemples d'entrée et de sortie attendues (Few-Shot prompting)",
    no_chain_of_thought: 'Incluez des instructions pour que l\'IA "raisonne étape par étape" ou "analyse la tâche"',
    missing_delimiters: "Utilisez des délimiteurs clairs comme ### ou des balises XML (ex., <context>) pour séparer les parties du prompt",
    poor_structure: "Améliorez la structure du prompt en utilisant des paragraphes, des en-têtes et des listes à puces",
    virtualization_risk: 'Ajoutez des contraintes strictes (ex., "Reste uniquement dans le personnage") lors de l\'utilisation de la virtualisation ou de la simulation',
    payload_splitting_risk: "Vérifiez s'il y a un espacement ou un encodage suspect qui pourrait être interprété comme une tentative d'injection",
    security: "Vérifiez et supprimez tout contenu qui pourrait être interprété comme une injection de prompt",
    positive: "Votre prompt est bien ! Envisagez d'ajouter des exemples pour des résultats encore meilleurs.",
  },
  pt: {
    vague_instruction: "Adicione detalhes mais específicos sobre o que deseja alcançar",
    missing_context: "Forneça informações de contexto ou antecedentes para melhores resultados",
    no_output_format: 'Especifique o formato de saída desejado (ex., "Responda em formato JSON")',
    missing_role: 'Defina um papel para a IA (ex., "Atue como um desenvolvedor sênior...")',
    too_long: "Considere dividir isto em vários prompts menores e focados",
    redundant: "Remova o conteúdo repetitivo para tornar o prompt mais conciso",
    vague_terms: 'Substitua termos vagos como "algo" ou "coisas" por substantivos específicos',
    no_constraints: 'Adicione restrições para refinar a saída (ex., "Evite usar APIs obsoletas")',
    no_success_criteria: 'Defina critérios de sucesso (ex., "O resultado deve lidar com casos extremos")',
    no_audience: 'Especifique o público-alvo (ex., "para desenvolvedores iniciantes")',
    missing_examples: "Adicione exemplos da entrada e saída esperadas (Few-Shot prompting)",
    no_chain_of_thought: 'Inclua instruções para a IA "pensar passo a passo" ou "raciocinar sobre a tarefa"',
    missing_delimiters: "Use delimitadores claros como ### ou tags XML (ex., <context>) para separar as partes do prompt",
    poor_structure: "Melhore a estrutura do prompt usando parágrafos, cabeçalhos e marcadores",
    virtualization_risk: 'Adicione restrições rigorosas (ex., "Mantenha apenas o personagem") ao usar virtualização ou simulação',
    payload_splitting_risk: "Verifique se há espaçamento ou codificação suspeita que possa ser interpretada como uma tentativa de injeção",
    security: "Revise e remova qualquer conteúdo que possa ser interpretado como injeção de prompt",
    positive: "Seu prompt está bom! Considere adicionar exemplos para resultados ainda melhores.",
  },
  de: {
    vague_instruction: "Füge spezifischere Details hinzu, was du erreichen möchtest",
    missing_context: "Gib Hintergrundinformationen oder Kontext an, um bessere Ergebnisse zu erzielen",
    no_output_format: 'Gib das gewünschte Ausgabeformat an (z.B., "Antworte im JSON-Format")',
    missing_role: 'Definiere eine Rolle für die KI (z.B., "Agiere als Senior-Entwickler...")',
    too_long: "Erwäge, dies in mehrere kürzere, fokussierte Prompts aufzuteilen",
    redundant: "Entferne sich wiederholende Inhalte, um den Prompt prägnanter zu gestalten",
    vague_terms: 'Ersetze vage Begriffe wie „etwas" oder „Dinge" durch spezifische Substantive',
    no_constraints: 'Füge Einschränkungen hinzu, um die Ausgabe einzugrenzen (z.B., „Vermeide veraltete APIs")',
    no_success_criteria: 'Definiere Erfolgskriterien (z.B., „Das Ergebnis soll Grenzfälle behandeln")',
    no_audience: 'Gib die Zielgruppe an (z.B., „für Anfänger-Entwickler")',
    missing_examples: "Füge Beispiele für die erwartete Ein- und Ausgabe hinzu (Few-Shot Prompting)",
    no_chain_of_thought: 'Füge Anweisungen hinzu, damit die KI „Schritt für Schritt denkt" oder „die Aufgabe durchdenkt"',
    missing_delimiters: "Verwende klare Trennzeichen wie ### oder XML-Tags (z.B., <context>), um verschiedene Teile des Prompts zu trennen",
    poor_structure: "Verbessere die Prompt-Struktur mit Absätzen, Überschriften und Aufzählungszeichen",
    virtualization_risk: 'Füge strenge Einschränkungen hinzu (z.B., „Bleibe nur in der Rolle"), wenn Virtualisierung oder Simulation verwendet wird',
    payload_splitting_risk: "Überprüfe, ob es verdächtige Abstände oder Codierungen gibt, die als Injektionsversuch interpretiert werden könnten",
    security: "Überprüfe und entferne alle Inhalte, die als Prompt-Injektion interpretiert werden könnten",
    positive: "Dein Prompt sieht gut aus! Erwäge, Beispiele für noch bessere Ergebnisse hinzuzufügen.",
  },
  it: {
    vague_instruction: "Aggiungi dettagli più specifici su ciò che vuoi ottenere",
    missing_context: "Fornisci informazioni di contesto o antecedenti per risultati migliori",
    no_output_format: 'Specifica il formato di output desiderato (es., "Rispondi in formato JSON")',
    missing_role: 'Definisci un ruolo per l\'IA (es., "Agisci come uno sviluppatore senior...")',
    too_long: "Considera di suddividere questo in più prompt più brevi e mirati",
    redundant: "Rimuovi il contenuto ripetitivo per rendere il prompt più conciso",
    vague_terms: 'Sostituisci termini vaghi come "qualcosa" o "roba" con sostantivi specifici',
    no_constraints: 'Aggiungi vincoli per restringere l\'output (es., "Evita di usare API obsolete")',
    no_success_criteria: 'Definisci criteri di successo (es., "Il risultato deve gestire i casi limite")',
    no_audience: 'Specifica il pubblico di riferimento (es., "per sviluppatori principianti")',
    missing_examples: "Aggiungi esempi dell'input e output attesi (Few-Shot prompting)",
    no_chain_of_thought: 'Includi istruzioni affinché l\'IA "pensi passo dopo passo" o "ragioni sul compito"',
    missing_delimiters: "Usa delimitatori chiari come ### o tag XML (es., <context>) per separare le diverse parti del prompt",
    poor_structure: "Migliora la struttura del prompt usando paragrafi, intestazioni e elenchi puntati",
    virtualization_risk: 'Aggiungi vincoli rigorosi (es., "Mantieni solo il personaggio") quando usi virtualizzazione o simulazione',
    payload_splitting_risk: "Controlla se ci sono spaziature o codifiche sospette che potrebbero essere interpretate come un tentativo di iniezione",
    security: "Controlla e rimuovi qualsiasi contenuto che potrebbe essere interpretato come iniezione di prompt",
    positive: "Il tuo prompt è buono! Considera di aggiungere esempi per risultati ancora migliori.",
  },
  zh: {
    vague_instruction: "添加更具体的细节来说明你想要实现的目标",
    missing_context: "提供背景信息或上下文以获得更好的结果",
    no_output_format: '指定所需的输出格式（例如，"以 JSON 格式回复"）',
    missing_role: '为 AI 定义一个角色（例如，"扮演一名高级开发工程师..."）',
    too_long: "考虑将其拆分为多个更短、更有针对性的提示",
    redundant: "删除重复内容以使提示更简洁",
    vague_terms: '将"某些东西"或"一些东西"等模糊词汇替换为具体名词',
    no_constraints: '添加约束来缩小输出范围（例如，"避免使用已弃用的 API"）',
    no_success_criteria: '定义成功标准（例如，"结果应处理边缘情况"）',
    no_audience: '指定目标受众（例如，"面向初级开发者"）',
    missing_examples: "添加期望输入和输出的示例（Few-Shot prompting）",
    no_chain_of_thought: '添加指令让 AI "逐步思考"或"推理任务"',
    missing_delimiters: "使用清晰的分隔符如 ### 或 XML 标签（例如，<context>）来分隔提示的不同部分",
    poor_structure: "使用段落、标题和项目符号改善提示的结构",
    virtualization_risk: '使用虚拟化或模拟时，添加严格的约束（例如，"仅保持角色设定"）',
    payload_splitting_risk: "检查是否存在可疑的间距或编码，可能被误解为注入攻击",
    security: "检查并删除任何可能被解读为提示注入的内容",
    positive: "你的提示看起来不错！考虑添加示例以获得更好的结果。",
  },
  ja: {
    vague_instruction: "達成したい目標についてより具体的な詳細を追加してください",
    missing_context: "より良い結果を得るために、背景情報やコンテキストを提供してください",
    no_output_format: '希望する出力形式を指定してください（例：「JSON 形式で回答してください」）',
    missing_role: 'AI の役割を定義してください（例：「シニア開発者として振る舞ってください...」）',
    too_long: "これを複数の短く焦点を絞ったプロンプトに分割することを検討してください",
    redundant: "繰り返しの内容を削除して、プロンプトをより簡潔にしてください",
    vague_terms: '「何か」や「もの」などの曖昧な用語を具体的な名詞に置き換えてください',
    no_constraints: '出力を絞り込むための制約を追加してください（例：「非推奨の API の使用を避ける」）',
    no_success_criteria: '成功基準を定義してください（例：「結果はエッジケースを処理する必要がある」）',
    no_audience: '対象者を指定してください（例：「初心者の開発者向け」）',
    missing_examples: "期待される入出力の例を追加してください（Few-Shot prompting）",
    no_chain_of_thought: 'AI に「ステップバイステップで考える」または「タスクを推論する」よう指示を含めてください',
    missing_delimiters: "### や XML タグ（例：<context>）などの明確な区切りを使用して、プロンプトの異なる部分を分けてください",
    poor_structure: "段落、見出し、箇条書きを使用してプロンプトの構造を改善してください",
    virtualization_risk: '仮想化やシミュレーションを使用する場合は、厳格な制約を追加してください（例：「キャラクターのみを維持する」）',
    payload_splitting_risk: "インジェクション攻撃と誤解される可能性のある不審なスペースやエンコーディングがないか確認してください",
    security: "プロンプトインジェクションと解釈される可能性のあるコンテンツを確認して削除してください",
    positive: "プロンプトは良好です！さらに良い結果を得るために、例を追加することを検討してください。",
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
  const anatomySugs = (ANATOMY_SUGGESTIONS[lang] ?? ANATOMY_SUGGESTIONS["en"])!;
  const issueSugs = (ISSUE_SUGGESTIONS[lang] ?? ISSUE_SUGGESTIONS["en"])!;
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
