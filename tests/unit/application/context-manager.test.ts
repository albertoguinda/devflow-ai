import { describe, it, expect, beforeEach } from "vitest";
import {
  createDocument,
  createContextWindow,
  addDocumentToWindow,
  removeDocumentFromWindow,
  reorderDocuments,
  exportContext,
  stripComments,
  generateTree,
  exportForAI,
  searchDocuments,
  detectDocType,
  getModelPreset,
  preloadTokenEncoder,
  MODEL_PRESETS,
} from "@/lib/application/context-manager";
import type { ContextWindow } from "@/types/context-manager";

describe("Context Manager", () => {
  describe("createDocument", () => {
    it("should create a document with correct properties", () => {
      const doc = createDocument(
        "Test Document",
        "This is the content",
        "code",
        "high",
        ["react", "typescript"]
      );

      expect(doc.id).toBeDefined();
      expect(doc.title).toBe("Test Document");
      expect(doc.content).toBe("This is the content");
      expect(doc.type).toBe("code");
      expect(doc.priority).toBe("high");
      expect(doc.tags).toEqual(["react", "typescript"]);
      expect(doc.tokenCount).toBeGreaterThan(0);
      expect(doc.createdAt).toBeDefined();
    });

    it("should estimate tokens correctly", () => {
      const shortDoc = createDocument("Short", "Hi", "notes", "low", []);
      const longDoc = createDocument(
        "Long",
        "This is a much longer content that should have more tokens than the short one",
        "notes",
        "low",
        []
      );

      expect(longDoc.tokenCount).toBeGreaterThan(shortDoc.tokenCount);
    });
  });

  describe("createContextWindow", () => {
    it("should create a window with default max tokens", () => {
      const window = createContextWindow("Test Window");

      expect(window.id).toBeDefined();
      expect(window.name).toBe("Test Window");
      expect(window.documents).toEqual([]);
      expect(window.totalTokens).toBe(0);
      expect(window.maxTokens).toBe(128000);
      expect(window.utilizationPercentage).toBe(0);
      expect(window.createdAt).toBeDefined();
    });

    it("should allow custom max tokens", () => {
      const window = createContextWindow("Custom Window", 32000);

      expect(window.maxTokens).toBe(32000);
    });
  });

  describe("addDocumentToWindow", () => {
    it("should add document and recalculate totals", () => {
      const window = createContextWindow("Test");
      const doc = createDocument("Doc", "Content here", "code", "medium", []);

      const updated = addDocumentToWindow(window, doc);

      expect(updated.documents).toHaveLength(1);
      expect(updated.totalTokens).toBe(doc.tokenCount);
      // Utilization is very small for short content, just check it's defined
      expect(updated.utilizationPercentage).toBeGreaterThanOrEqual(0);
    });

    it("should accumulate tokens when adding multiple documents", () => {
      let window = createContextWindow("Test");
      const doc1 = createDocument("Doc1", "Content one", "code", "high", []);
      const doc2 = createDocument("Doc2", "Content two", "api", "medium", []);

      window = addDocumentToWindow(window, doc1);
      window = addDocumentToWindow(window, doc2);

      expect(window.documents).toHaveLength(2);
      expect(window.totalTokens).toBe(doc1.tokenCount + doc2.tokenCount);
    });
  });

  describe("removeDocumentFromWindow", () => {
    it("should remove document and recalculate totals", () => {
      let window = createContextWindow("Test");
      const doc = createDocument("Doc", "Content", "code", "medium", []);

      window = addDocumentToWindow(window, doc);
      window = removeDocumentFromWindow(window, doc.id);

      expect(window.documents).toHaveLength(0);
      expect(window.totalTokens).toBe(0);
    });

    it("should only remove specified document", () => {
      let window = createContextWindow("Test");
      const doc1 = createDocument("Doc1", "Content one", "code", "high", []);
      const doc2 = createDocument("Doc2", "Content two", "api", "medium", []);

      window = addDocumentToWindow(window, doc1);
      window = addDocumentToWindow(window, doc2);
      window = removeDocumentFromWindow(window, doc1.id);

      expect(window.documents).toHaveLength(1);
      expect(window.documents[0]?.id).toBe(doc2.id);
    });
  });

  describe("reorderDocuments", () => {
    it("should change document priority", () => {
      let window = createContextWindow("Test");
      const doc = createDocument("Doc", "Content", "code", "low", []);

      window = addDocumentToWindow(window, doc);
      window = reorderDocuments(window, doc.id, "high");

      expect(window.documents[0]?.priority).toBe("high");
    });

    it("should sort by priority after reorder", () => {
      let window = createContextWindow("Test");
      const doc1 = createDocument("Doc1", "Content", "code", "low", []);
      const doc2 = createDocument("Doc2", "Content", "api", "low", []);

      window = addDocumentToWindow(window, doc1);
      window = addDocumentToWindow(window, doc2);
      window = reorderDocuments(window, doc2.id, "high");

      expect(window.documents[0]?.id).toBe(doc2.id);
    });
  });

  describe("exportContext", () => {
    let testWindow: ContextWindow;

    beforeEach(() => {
      testWindow = createContextWindow("Export Test");
      const doc = createDocument(
        "Test Doc",
        "Test content",
        "code",
        "high",
        ["tag1"]
      );
      testWindow = addDocumentToWindow(testWindow, doc);
    });

    describe("XML export", () => {
      it("should export as valid XML structure", () => {
        const exported = exportContext(testWindow, "xml");

        expect(exported.format).toBe("xml");
        expect(exported.filename).toBe("export-test-context.xml");
        expect(exported.content).toContain('<?xml version="1.0"');
        expect(exported.content).toContain("<context");
        expect(exported.content).toContain("<document");
        expect(exported.content).toContain("<title>Test Doc</title>");
        expect(exported.content).toContain("<![CDATA[Test content]]>");
      });

      it("should escape XML special characters", () => {
        let window = createContextWindow("XML Test");
        const doc = createDocument(
          "Title with <brackets>",
          "Content with & ampersand",
          "notes",
          "low",
          []
        );
        window = addDocumentToWindow(window, doc);

        const exported = exportContext(window, "xml");

        expect(exported.content).toContain("&lt;brackets&gt;");
        expect(exported.content).not.toContain("<brackets>");
      });
    });

    describe("JSON export", () => {
      it("should export as valid JSON", () => {
        const exported = exportContext(testWindow, "json");

        expect(exported.format).toBe("json");
        expect(exported.filename).toBe("export-test-context.json");

        const parsed = JSON.parse(exported.content);
        expect(parsed.name).toBe("Export Test");
        expect(parsed.documents).toHaveLength(1);
        expect(parsed.documents[0].title).toBe("Test Doc");
      });

      it("should include all document properties", () => {
        const exported = exportContext(testWindow, "json");
        const parsed = JSON.parse(exported.content);

        expect(parsed.documents[0]).toHaveProperty("title");
        expect(parsed.documents[0]).toHaveProperty("type");
        expect(parsed.documents[0]).toHaveProperty("priority");
        expect(parsed.documents[0]).toHaveProperty("content");
        expect(parsed.documents[0]).toHaveProperty("tags");
        expect(parsed.documents[0]).toHaveProperty("tokenCount");
      });
    });

    describe("Markdown export", () => {
      it("should export as markdown", () => {
        const exported = exportContext(testWindow, "markdown");

        expect(exported.format).toBe("markdown");
        expect(exported.filename).toBe("export-test-context.md");
        expect(exported.content).toContain("# Context: Export Test");
        expect(exported.content).toContain("## Test Doc");
        expect(exported.content).toContain("**Type:** code");
        expect(exported.content).toContain("```");
      });

      it("should include token statistics", () => {
        const exported = exportContext(testWindow, "markdown");

        expect(exported.content).toContain("**Total Tokens:**");
        // Check for max tokens value - locale formatting may vary
        expect(exported.content).toMatch(/128[,.]?000/);
      });
    });
  });

  describe("createDocument - optional params", () => {
    it("should create document with filePath", () => {
      const doc = createDocument("File Doc", "content", "code", "high", ["ts"], "src/index.ts");
      expect(doc.filePath).toBe("src/index.ts");
    });

    it("should create document with instructions", () => {
      const doc = createDocument("Inst Doc", "content", "code", "medium", [], undefined, "Follow these rules");
      expect(doc.instructions).toBe("Follow these rules");
    });

    it("should create document with both filePath and instructions", () => {
      const doc = createDocument("Full Doc", "content", "api", "low", ["api"], "api/route.ts", "Use REST");
      expect(doc.filePath).toBe("api/route.ts");
      expect(doc.instructions).toBe("Use REST");
    });
  });

  describe("stripComments", () => {
    it("should strip single-line comments from code", () => {
      const code = "const x = 1; // this is a comment\nconst y = 2;";
      const result = stripComments(code, "code");
      expect(result).not.toContain("// this is a comment");
      expect(result).toContain("const x = 1;");
      expect(result).toContain("const y = 2;");
    });

    it("should strip multi-line comments from code", () => {
      const code = "/* multi\nline\ncomment */\nconst x = 1;";
      const result = stripComments(code, "code");
      expect(result).not.toContain("multi");
      expect(result).toContain("const x = 1;");
    });

    it("should return content unchanged for non-code types", () => {
      const notes = "// this is not code\nsome notes";
      expect(stripComments(notes, "documentation")).toBe(notes);
      expect(stripComments(notes, "notes")).toBe(notes);
      expect(stripComments(notes, "api")).toBe(notes);
      expect(stripComments(notes, "other")).toBe(notes);
    });

    it("should remove empty lines after stripping comments", () => {
      const code = "const a = 1;\n// comment\n\nconst b = 2;";
      const result = stripComments(code, "code");
      expect(result).not.toMatch(/^\s*$/m);
    });
  });

  describe("generateTree", () => {
    it("should generate tree from file paths", () => {
      const docs = [
        createDocument("A", "c", "code", "high", [], "src/index.ts"),
        createDocument("B", "c", "code", "high", [], "src/utils/helper.ts"),
      ];
      const tree = generateTree(docs);
      expect(tree).toContain("src");
      expect(tree).toContain("index.ts");
      expect(tree).toContain("utils");
      expect(tree).toContain("helper.ts");
    });

    it("should use title when filePath is missing", () => {
      const docs = [
        createDocument("My Document", "c", "notes", "low", []),
      ];
      const tree = generateTree(docs);
      expect(tree).toContain("My Document");
    });

    it("should handle empty array", () => {
      const tree = generateTree([]);
      expect(tree).toBe("");
    });
  });

  describe("exportForAI", () => {
    it("should generate AI export with project hierarchy", () => {
      let win = createContextWindow("AI Test");
      const doc = createDocument("App", "const x = 1;", "code", "high", [], "src/app.ts");
      win = addDocumentToWindow(win, doc);

      const result = exportForAI(win);
      expect(result).toContain("Senior Software Engineer");
      expect(result).toContain("<project_hierarchy>");
      expect(result).toContain("<context_documents>");
      expect(result).toContain("src/app.ts");
      expect(result).toContain("const x = 1;");
    });

    it("should strip comments when option is set", () => {
      let win = createContextWindow("AI Test");
      const doc = createDocument("App", "const x = 1; // comment\nconst y = 2;", "code", "high", [], "src/app.ts");
      win = addDocumentToWindow(win, doc);

      const result = exportForAI(win, { stripComments: true });
      expect(result).not.toContain("// comment");
      expect(result).toContain("const x = 1;");
    });

    it("should include instructions when document has them", () => {
      let win = createContextWindow("AI Test");
      const doc = createDocument("App", "code here", "code", "high", [], "src/app.ts", "Follow DRY principle");
      win = addDocumentToWindow(win, doc);

      const result = exportForAI(win);
      expect(result).toContain("<instructions>Follow DRY principle</instructions>");
    });

    it("should omit instructions tag when document has no instructions", () => {
      let win = createContextWindow("AI Test");
      const doc = createDocument("App", "code here", "code", "high", [], "src/app.ts");
      win = addDocumentToWindow(win, doc);

      const result = exportForAI(win);
      expect(result).not.toContain("<instructions>");
    });
  });

  describe("exportContext - additional branches", () => {
    it("should include tags in markdown when present", () => {
      let win = createContextWindow("Tag Test");
      const doc = createDocument("Tagged", "content", "code", "high", ["react", "ts"]);
      win = addDocumentToWindow(win, doc);

      const exported = exportContext(win, "markdown");
      expect(exported.content).toContain("**Tags:** react, ts");
    });

    it("should handle document with no tags in markdown", () => {
      let win = createContextWindow("No Tag Test");
      const doc = createDocument("No Tags", "content", "code", "low", []);
      win = addDocumentToWindow(win, doc);

      const exported = exportContext(win, "markdown");
      expect(exported.content).not.toContain("**Tags:**");
    });

    it("should include tags in XML export", () => {
      let win = createContextWindow("XML Tags");
      const doc = createDocument("Tagged XML", "content", "code", "medium", ["js"]);
      win = addDocumentToWindow(win, doc);

      const exported = exportContext(win, "xml");
      expect(exported.content).toContain("<tag>js</tag>");
    });

    it("should escape quotes and apostrophes in XML", () => {
      let win = createContextWindow("XML Escape");
      const doc = createDocument("Title with \"quotes\" and 'apostrophes'", "content", "notes", "low", []);
      win = addDocumentToWindow(win, doc);

      const exported = exportContext(win, "xml");
      expect(exported.content).toContain("&quot;");
      expect(exported.content).toContain("&apos;");
    });
  });

  describe("reorderDocuments - additional branches", () => {
    it("should sort multiple documents by priority order", () => {
      let win = createContextWindow("Sort Test");
      const doc1 = createDocument("Low", "c", "code", "low", []);
      const doc2 = createDocument("Med", "c", "code", "medium", []);
      const doc3 = createDocument("High", "c", "code", "high", []);

      win = addDocumentToWindow(win, doc1);
      win = addDocumentToWindow(win, doc2);
      win = addDocumentToWindow(win, doc3);

      // Reorder doc1 to medium priority - triggers sort
      win = reorderDocuments(win, doc1.id, "medium");

      expect(win.documents[0]?.priority).toBe("high");
    });

    it("should not change non-target documents", () => {
      let win = createContextWindow("Test");
      const doc1 = createDocument("A", "c", "code", "low", []);
      const doc2 = createDocument("B", "c", "code", "high", []);

      win = addDocumentToWindow(win, doc1);
      win = addDocumentToWindow(win, doc2);
      win = reorderDocuments(win, doc1.id, "medium");

      const doc2Updated = win.documents.find(d => d.id === doc2.id);
      expect(doc2Updated?.priority).toBe("high");
    });
  });

  describe("estimateTokens (tiktoken)", () => {
    it("should count tokens using tiktoken for known text", () => {
      // "Hello world" ≈ 2 tokens in cl100k_base
      const doc = createDocument("test", "Hello world", "notes", "medium", []);
      expect(doc.tokenCount).toBeGreaterThan(0);
      // tiktoken should give a more accurate count than length/4
      // "Hello world" is 11 chars / 4 = 3 with naive, but 2 tokens with tiktoken
      expect(doc.tokenCount).toBeLessThanOrEqual(3);
    });

    it("should return 0 tokens for empty string", () => {
      const doc = createDocument("test", "", "notes", "medium", []);
      expect(doc.tokenCount).toBe(0);
    });

    it("should handle long text without error", () => {
      const longText = "The quick brown fox jumps over the lazy dog. ".repeat(100);
      const doc = createDocument("test", longText, "notes", "medium", []);
      expect(doc.tokenCount).toBeGreaterThan(0);
      expect(doc.tokenCount).toBeLessThan(longText.length); // tiktoken is more efficient
    });

    it("should handle unicode text", () => {
      const doc = createDocument("test", "Hello 世界 🌍", "notes", "medium", []);
      expect(doc.tokenCount).toBeGreaterThan(0);
    });

    it("should handle code content", () => {
      const code = 'function hello() { return "world"; }';
      const doc = createDocument("test", code, "code", "medium", []);
      expect(doc.tokenCount).toBeGreaterThan(0);
    });
  });

  describe("addDocumentToWindow - batch accumulation", () => {
    it("should accumulate 3+ documents correctly", () => {
      let win = createContextWindow("Batch Test");
      const doc1 = createDocument("A", "content alpha", "code", "high", [], "src/a.ts");
      const doc2 = createDocument("B", "content beta", "code", "medium", [], "src/b.ts");
      const doc3 = createDocument("C", "content gamma", "api", "low", [], "src/c.ts");

      win = addDocumentToWindow(win, doc1);
      win = addDocumentToWindow(win, doc2);
      win = addDocumentToWindow(win, doc3);

      expect(win.documents).toHaveLength(3);
      expect(win.totalTokens).toBe(doc1.tokenCount + doc2.tokenCount + doc3.tokenCount);
      expect(win.utilizationPercentage).toBeGreaterThanOrEqual(0);
    });

    it("should accumulate 5 documents and recalculate utilization", () => {
      let win = createContextWindow("Five Docs", 1000);
      const docs = Array.from({ length: 5 }, (_, i) =>
        createDocument(`Doc${i}`, `Content for document number ${i} with some text`, "code", "medium", [])
      );

      for (const doc of docs) {
        win = addDocumentToWindow(win, doc);
      }

      expect(win.documents).toHaveLength(5);
      const expectedTotal = docs.reduce((sum, d) => sum + d.tokenCount, 0);
      expect(win.totalTokens).toBe(expectedTotal);
      expect(win.utilizationPercentage).toBe(Math.round((expectedTotal / 1000) * 100));
    });
  });

  describe("stripComments - URL preservation", () => {
    it("should preserve URLs with // in code", () => {
      const code = 'const url = "https://example.com/api";\nconst x = 1;';
      const result = stripComments(code, "code");
      expect(result).toContain("https://example.com/api");
      expect(result).toContain("const x = 1;");
    });

    it("should preserve URLs with http:// in code", () => {
      const code = 'const url = "http://localhost:3000";\n// remove this\nconst y = 2;';
      const result = stripComments(code, "code");
      expect(result).toContain("http://localhost:3000");
      expect(result).not.toContain("remove this");
      expect(result).toContain("const y = 2;");
    });

    it("should handle mixed URLs and comments", () => {
      const code = `const base = "https://api.dev/v1"; // endpoint URL
// fetch data
const data = fetch(base);`;
      const result = stripComments(code, "code");
      expect(result).toContain("https://api.dev/v1");
      expect(result).not.toContain("fetch data");
      expect(result).toContain("const data = fetch(base);");
    });
  });

  describe("exportForAI - multiple documents", () => {
    it("should export multiple documents with correct structure", () => {
      let win = createContextWindow("Multi Export");
      const doc1 = createDocument("App", "const app = 1;", "code", "high", [], "src/app.ts");
      const doc2 = createDocument("Utils", "export function helper() {}", "code", "medium", [], "src/utils.ts");
      const doc3 = createDocument("README", "# Project Info", "documentation", "low", [], "README.md");

      win = addDocumentToWindow(win, doc1);
      win = addDocumentToWindow(win, doc2);
      win = addDocumentToWindow(win, doc3);

      const result = exportForAI(win);
      expect(result).toContain("src/app.ts");
      expect(result).toContain("src/utils.ts");
      expect(result).toContain("README.md");
      expect(result).toContain("const app = 1;");
      expect(result).toContain("export function helper() {}");
      expect(result).toContain("# Project Info");
      // Should have project hierarchy
      expect(result).toContain("<project_hierarchy>");
      // Should contain all three files in context_documents
      expect(result).toContain('<file path="src/app.ts"');
      expect(result).toContain('<file path="src/utils.ts"');
      expect(result).toContain('<file path="README.md"');
    });

    it("should strip comments only from code type documents", () => {
      let win = createContextWindow("Strip Test");
      const codeDoc = createDocument("Code", "const x = 1; // inline\nconst y = 2;", "code", "high", [], "app.ts");
      const docDoc = createDocument("Docs", "// This should stay\nSome docs", "documentation", "medium", [], "notes.md");

      win = addDocumentToWindow(win, codeDoc);
      win = addDocumentToWindow(win, docDoc);

      const result = exportForAI(win, { stripComments: true });
      expect(result).not.toContain("// inline");
      expect(result).toContain("// This should stay");
    });
  });

  describe("searchDocuments", () => {
    it("should return all documents when query is empty", () => {
      let win = createContextWindow("Search Test");
      const doc1 = createDocument("App", "code here", "code", "high", ["react"]);
      const doc2 = createDocument("Config", "settings", "notes", "low", ["config"]);
      win = addDocumentToWindow(win, doc1);
      win = addDocumentToWindow(win, doc2);

      expect(searchDocuments(win, "")).toHaveLength(2);
      expect(searchDocuments(win, "   ")).toHaveLength(2);
    });

    it("should search by title", () => {
      let win = createContextWindow("Search Test");
      const doc1 = createDocument("App Component", "code", "code", "high", []);
      const doc2 = createDocument("Config File", "settings", "notes", "low", []);
      win = addDocumentToWindow(win, doc1);
      win = addDocumentToWindow(win, doc2);

      const results = searchDocuments(win, "app");
      expect(results).toHaveLength(1);
      expect(results[0]?.title).toBe("App Component");
    });

    it("should search by content", () => {
      let win = createContextWindow("Search Test");
      const doc1 = createDocument("A", "function handleClick() {}", "code", "high", []);
      const doc2 = createDocument("B", "export const API_URL", "code", "low", []);
      win = addDocumentToWindow(win, doc1);
      win = addDocumentToWindow(win, doc2);

      const results = searchDocuments(win, "handleClick");
      expect(results).toHaveLength(1);
      expect(results[0]?.title).toBe("A");
    });

    it("should search by tags", () => {
      let win = createContextWindow("Search Test");
      const doc1 = createDocument("A", "code", "code", "high", ["react", "hooks"]);
      const doc2 = createDocument("B", "code", "code", "low", ["utils"]);
      win = addDocumentToWindow(win, doc1);
      win = addDocumentToWindow(win, doc2);

      const results = searchDocuments(win, "hooks");
      expect(results).toHaveLength(1);
      expect(results[0]?.title).toBe("A");
    });

    it("should be case-insensitive", () => {
      let win = createContextWindow("Search Test");
      const doc = createDocument("MyComponent", "code", "code", "high", []);
      win = addDocumentToWindow(win, doc);

      expect(searchDocuments(win, "MYCOMPONENT")).toHaveLength(1);
      expect(searchDocuments(win, "mycomponent")).toHaveLength(1);
    });
  });

  describe("detectDocType", () => {
    it("should detect code extensions", () => {
      expect(detectDocType("index.ts")).toBe("code");
      expect(detectDocType("app.tsx")).toBe("code");
      expect(detectDocType("main.py")).toBe("code");
      expect(detectDocType("App.java")).toBe("code");
      expect(detectDocType("lib.rs")).toBe("code");
      expect(detectDocType("style.css")).toBe("code");
    });

    it("should detect documentation extensions", () => {
      expect(detectDocType("README.md")).toBe("documentation");
      expect(detectDocType("docs.txt")).toBe("documentation");
      expect(detectDocType("guide.mdx")).toBe("documentation");
      expect(detectDocType("notes.rst")).toBe("documentation");
    });

    it("should detect API extensions", () => {
      expect(detectDocType("schema.json")).toBe("api");
      expect(detectDocType("config.yaml")).toBe("api");
      expect(detectDocType("api.yml")).toBe("api");
      expect(detectDocType("schema.graphql")).toBe("api");
      expect(detectDocType("service.proto")).toBe("api");
    });

    it("should return notes for unknown extensions", () => {
      expect(detectDocType("file.xyz")).toBe("notes");
      expect(detectDocType("image.png")).toBe("notes");
      expect(detectDocType("data.csv")).toBe("notes");
    });

    it("should handle files without extension", () => {
      expect(detectDocType("Makefile")).toBe("notes");
      expect(detectDocType("Dockerfile")).toBe("notes");
    });
  });

  describe("getModelPreset", () => {
    it("should return preset for known model", () => {
      const preset = getModelPreset("gpt-4o");
      expect(preset).toBeDefined();
      expect(preset?.name).toBe("GPT-4o");
      expect(preset?.maxTokens).toBe(128000);
    });

    it("should return undefined for unknown model", () => {
      expect(getModelPreset("unknown-model")).toBeUndefined();
    });

    it("should have all expected presets", () => {
      expect(MODEL_PRESETS.length).toBeGreaterThanOrEqual(10);
      expect(getModelPreset("claude-opus-4")).toBeDefined();
      expect(getModelPreset("gemini-2.0-flash")).toBeDefined();
      expect(getModelPreset("custom")).toBeDefined();
    });
  });

  describe("preloadTokenEncoder", () => {
    it("should return a promise", () => {
      const result = preloadTokenEncoder();
      expect(result).toBeInstanceOf(Promise);
    });

    it("should resolve without error", async () => {
      await expect(preloadTokenEncoder()).resolves.toBeUndefined();
    });
  });

  describe("generateTree - nested paths", () => {
    it("should generate tree with deeply nested paths", () => {
      const docs = [
        createDocument("A", "c", "code", "high", [], "src/components/ui/button.tsx"),
        createDocument("B", "c", "code", "high", [], "src/components/ui/card.tsx"),
        createDocument("C", "c", "code", "high", [], "src/hooks/use-auth.ts"),
        createDocument("D", "c", "code", "high", [], "src/lib/utils.ts"),
      ];
      const tree = generateTree(docs);
      expect(tree).toContain("src");
      expect(tree).toContain("components");
      expect(tree).toContain("ui");
      expect(tree).toContain("button.tsx");
      expect(tree).toContain("card.tsx");
      expect(tree).toContain("hooks");
      expect(tree).toContain("use-auth.ts");
      expect(tree).toContain("lib");
      expect(tree).toContain("utils.ts");
    });

    it("should handle single-level paths", () => {
      const docs = [
        createDocument("A", "c", "code", "high", [], "package.json"),
        createDocument("B", "c", "code", "high", [], "tsconfig.json"),
      ];
      const tree = generateTree(docs);
      expect(tree).toContain("package.json");
      expect(tree).toContain("tsconfig.json");
    });

    it("should merge common prefixes in tree", () => {
      const docs = [
        createDocument("A", "c", "code", "high", [], "src/a.ts"),
        createDocument("B", "c", "code", "high", [], "src/b.ts"),
      ];
      const tree = generateTree(docs);
      // "src" should appear exactly once as a branch
      const srcMatches = tree.match(/src/g);
      expect(srcMatches).toHaveLength(1);
    });
  });
});
