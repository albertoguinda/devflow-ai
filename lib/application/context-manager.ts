import type {
  ContextDocument,
  DocumentType,
  Priority,
  ContextWindow,
  ExportedContext,
} from "@/types/context-manager";
import type { Tiktoken } from "js-tiktoken";

const DEFAULT_MAX_TOKENS = 128000; // GPT-4 context window

// Dynamically loaded encoder — keeps js-tiktoken out of the initial bundle
let encoder: Tiktoken | null = null;
let encoderLoading: Promise<void> | null = null;

export function preloadTokenEncoder(): Promise<void> {
  if (!encoderLoading) {
    encoderLoading = import("js-tiktoken").then((m) => {
      encoder = m.getEncoding("cl100k_base");
    });
  }
  return encoderLoading;
}

// --- Model Presets ---

export interface ModelPreset {
  id: string;
  name: string;
  provider: string;
  maxTokens: number;
  outputTokens: number;
}

export const MODEL_PRESETS: ModelPreset[] = [
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI", maxTokens: 128000, outputTokens: 16384 },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI", maxTokens: 128000, outputTokens: 16384 },
  { id: "o1", name: "o1", provider: "OpenAI", maxTokens: 200000, outputTokens: 100000 },
  { id: "claude-opus-4", name: "Claude Opus 4", provider: "Anthropic", maxTokens: 200000, outputTokens: 32000 },
  { id: "claude-sonnet-4", name: "Claude Sonnet 4", provider: "Anthropic", maxTokens: 200000, outputTokens: 16000 },
  { id: "claude-haiku-3.5", name: "Claude 3.5 Haiku", provider: "Anthropic", maxTokens: 200000, outputTokens: 8192 },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "Google", maxTokens: 1048576, outputTokens: 8192 },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "Google", maxTokens: 2097152, outputTokens: 8192 },
  { id: "llama-3.1-70b", name: "Llama 3.1 70B", provider: "Meta", maxTokens: 131072, outputTokens: 4096 },
  { id: "deepseek-v3", name: "DeepSeek V3", provider: "DeepSeek", maxTokens: 128000, outputTokens: 8192 },
  { id: "mistral-large", name: "Mistral Large", provider: "Mistral", maxTokens: 128000, outputTokens: 4096 },
  { id: "custom", name: "Custom", provider: "—", maxTokens: DEFAULT_MAX_TOKENS, outputTokens: 4096 },
];

export function getModelPreset(id: string): ModelPreset | undefined {
  return MODEL_PRESETS.find((m) => m.id === id);
}

function estimateTokens(text: string): number {
  if (encoder) {
    try {
      return encoder.encode(text).length;
    } catch {
      // Fall through to heuristic
    }
  }
  return Math.ceil(text.length / 4);
}

export function createDocument(
  title: string,
  content: string,
  type: DocumentType,
  priority: Priority,
  tags: string[],
  filePath?: string,
  instructions?: string
): ContextDocument {
  return {
    id: crypto.randomUUID(),
    title,
    content,
    type,
    priority,
    tags,
    tokenCount: estimateTokens(content),
    createdAt: new Date().toISOString(),
    filePath,
    instructions,
  };
}

export function createContextWindow(
  name: string,
  maxTokens: number = DEFAULT_MAX_TOKENS
): ContextWindow {
  return {
    id: crypto.randomUUID(),
    name,
    documents: [],
    totalTokens: 0,
    maxTokens,
    utilizationPercentage: 0,
    createdAt: new Date().toISOString(),
  };
}

function recalculateWindow(window: ContextWindow): ContextWindow {
  const totalTokens = window.documents.reduce(
    (sum, doc) => sum + doc.tokenCount,
    0
  );
  const utilizationPercentage = window.maxTokens > 0
    ? Math.round((totalTokens / window.maxTokens) * 100)
    : 0;

  return {
    ...window,
    totalTokens,
    utilizationPercentage,
  };
}

/**
 * Search documents within a context window by title, content, and tags.
 * Returns matching documents with case-insensitive matching.
 */
export function searchDocuments(
  window: ContextWindow,
  query: string
): ContextDocument[] {
  if (!query.trim()) return window.documents;
  const lower = query.toLowerCase();
  return window.documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(lower) ||
      doc.content.toLowerCase().includes(lower) ||
      doc.tags.some((tag) => tag.toLowerCase().includes(lower))
  );
}

export function addDocumentToWindow(
  window: ContextWindow,
  document: ContextDocument
): ContextWindow {
  const updated = {
    ...window,
    documents: [...window.documents, document],
  };
  return recalculateWindow(updated);
}

export function removeDocumentFromWindow(
  window: ContextWindow,
  documentId: string
): ContextWindow {
  const updated = {
    ...window,
    documents: window.documents.filter((doc) => doc.id !== documentId),
  };
  return recalculateWindow(updated);
}

export function reorderDocuments(
  window: ContextWindow,
  documentId: string,
  newPriority: Priority
): ContextWindow {
  const documents = window.documents.map((doc) =>
    doc.id === documentId ? { ...doc, priority: newPriority } : doc
  );

  // Sort by priority
  const priorityOrder: Record<Priority, number> = {
    high: 0,
    medium: 1,
    low: 2,
  };

  documents.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  return {
    ...window,
    documents,
  };
}

export function exportContext(
  window: ContextWindow,
  format: "xml" | "json" | "markdown"
): ExportedContext {
  let content: string;

  switch (format) {
    case "xml":
      content = exportAsXml(window);
      break;
    case "json":
      content = exportAsJson(window);
      break;
    case "markdown":
      content = exportAsMarkdown(window);
      break;
  }

  return {
    format,
    content,
    filename: `${window.name.toLowerCase().replace(/\s+/g, "-")}-context.${format === "markdown" ? "md" : format}`,
  };
}

function exportAsXml(window: ContextWindow): string {
  const docs = window.documents
    .map(
      (doc) => `  <document type="${escapeXml(doc.type)}" priority="${escapeXml(String(doc.priority))}">
    <title>${escapeXml(doc.title)}</title>
    <content><![CDATA[${doc.content}]]></content>
    <tags>${doc.tags.map((t) => `<tag>${escapeXml(t)}</tag>`).join("")}</tags>
    <tokens>${doc.tokenCount}</tokens>
  </document>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<context name="${escapeXml(window.name)}" totalTokens="${window.totalTokens}">
${docs}
</context>`;
}

export function stripComments(code: string, type: DocumentType): string {
  if (type !== "code") return code;

  // Remove multi-line comments first
  let result = code.replace(/\/\*[\s\S]*?\*\//g, "");

  // Remove single-line comments, but preserve URLs (http://, https://, ftp://)
  // Only match // when preceded by whitespace or at line start (not after : which indicates a URL)
  result = result.replace(/(?<=^|[\s;{}()])\/\/.*$/gm, "");

  // Remove empty lines left behind
  result = result.replace(/^\s*\n/gm, "");

  return result.trim();
}

export function generateTree(documents: ContextDocument[]): string {
  const paths = documents.map(d => d.filePath || d.title);
  interface TreeNode { [key: string]: TreeNode; }
  const tree: TreeNode = {};

  const DANGEROUS_KEYS = new Set(["__proto__", "constructor", "prototype"]);
  paths.forEach(path => {
    let current: TreeNode = tree;
    path.split("/").forEach(part => {
      if (DANGEROUS_KEYS.has(part)) return;
      if (!current[part]) current[part] = {};
      current = current[part] as TreeNode;
    });
  });

  const MAX_DEPTH = 20;
  function render(obj: TreeNode, indent: string = "", depth: number = 0): string {
    if (depth >= MAX_DEPTH) return `${indent}└── ...\n`;
    let result = "";
    const keys = Object.keys(obj);
    keys.forEach((key, index) => {
      const isLast = index === keys.length - 1;
      result += `${indent}${isLast ? "└── " : "├── "}${key}\n`;
      const child = obj[key];
      if (child) result += render(child, indent + (isLast ? "    " : "│   "), depth + 1);
    });
    return result;
  }

  return render(tree);
}

export function exportForAI(window: ContextWindow, options: { stripComments?: boolean } = {}): string {
  const projectTree = generateTree(window.documents);

  const docs = window.documents
    .map(
      (doc) => {
        let content = doc.content;
        if (options.stripComments) {
          content = stripComments(content, doc.type);
        }
        return `<file path="${escapeXml(doc.filePath || doc.title)}" type="${escapeXml(doc.type)}">
${doc.instructions ? `<instructions>${escapeXml(doc.instructions)}</instructions>\n` : ""}<content>
${escapeXml(content)}
</content>
</file>`;
      }
    )
    .join("\n\n");

  return `I am providing context for a software development task. Please act as a Senior Software Engineer.

<project_hierarchy>
${projectTree}
</project_hierarchy>

<context_documents>
${docs}
</context_documents>

Please analyze the provided context and wait for my specific instructions.`;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function exportAsJson(window: ContextWindow): string {
  return JSON.stringify(
    {
      name: window.name,
      totalTokens: window.totalTokens,
      maxTokens: window.maxTokens,
      utilizationPercentage: window.utilizationPercentage,
      documents: window.documents.map((doc) => ({
        title: doc.title,
        type: doc.type,
        priority: doc.priority,
        content: doc.content,
        tags: doc.tags,
        tokenCount: doc.tokenCount,
      })),
    },
    null,
    2
  );
}

function exportAsMarkdown(window: ContextWindow): string {
  const docs = window.documents
    .map(
      (doc) => `## ${doc.title}

**Type:** ${doc.type} | **Priority:** ${doc.priority} | **Tokens:** ${doc.tokenCount}
${doc.tags.length > 0 ? `**Tags:** ${doc.tags.join(", ")}` : ""}

\`\`\`
${doc.content}
\`\`\`
`
    )
    .join("\n---\n\n");

  return `# Context: ${window.name}

**Total Tokens:** ${window.totalTokens.toLocaleString()} / ${window.maxTokens.toLocaleString()} (${window.utilizationPercentage}%)

---

${docs}`;
}

const CODE_EXTS = new Set(["ts", "tsx", "js", "jsx", "py", "java", "go", "rs", "c", "cpp", "h", "cs", "rb", "php", "swift", "kt", "vue", "svelte", "css", "scss", "html"]);
const DOC_EXTS = new Set(["md", "mdx", "txt", "rst", "adoc"]);
const API_EXTS = new Set(["json", "yaml", "yml", "graphql", "proto", "openapi"]);

export function detectDocType(filename: string): DocumentType {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (CODE_EXTS.has(ext)) return "code";
  if (DOC_EXTS.has(ext)) return "documentation";
  if (API_EXTS.has(ext)) return "api";
  return "notes";
}
