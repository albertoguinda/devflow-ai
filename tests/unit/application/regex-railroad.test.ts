import { describe, it, expect } from "vitest";
import { generateRailroadSvg } from "@/lib/application/regex-railroad";

describe("Regex Railroad Diagram Generator", () => {
  describe("generateRailroadSvg", () => {
    it("should produce SVG with 3 character boxes for simple literal 'abc'", () => {
      const svg = generateRailroadSvg("abc");
      expect(svg).toMatch(/^<svg/);
      expect(svg).toMatch(/<\/svg>$/);
      // Should contain 3 literal boxes with a, b, c
      expect(svg).toContain(">a<");
      expect(svg).toContain(">b<");
      expect(svg).toContain(">c<");
    });

    it("should produce SVG for character class [a-z]", () => {
      const svg = generateRailroadSvg("[a-z]");
      expect(svg).toMatch(/^<svg/);
      expect(svg).toMatch(/<\/svg>$/);
      expect(svg).toContain("[a-z]");
    });

    it("should produce SVG with loop for quantifier a+", () => {
      const svg = generateRailroadSvg("a+");
      expect(svg).toMatch(/^<svg/);
      expect(svg).toMatch(/<\/svg>$/);
      // Should contain the literal 'a' and a loop arrow (path with stroke-dasharray)
      expect(svg).toContain(">a<");
      expect(svg).toContain("stroke-dasharray");
    });

    it("should produce SVG with fork for alternation cat|dog", () => {
      const svg = generateRailroadSvg("cat|dog");
      expect(svg).toMatch(/^<svg/);
      expect(svg).toMatch(/<\/svg>$/);
      // Should contain both alternatives
      expect(svg).toContain(">c<");
      expect(svg).toContain(">a<");
      expect(svg).toContain(">t<");
      expect(svg).toContain(">d<");
      expect(svg).toContain(">o<");
      expect(svg).toContain(">g<");
    });

    it("should produce SVG with group box for (abc)", () => {
      const svg = generateRailroadSvg("(abc)");
      expect(svg).toMatch(/^<svg/);
      expect(svg).toMatch(/<\/svg>$/);
      // Should contain a dashed rect for the group
      expect(svg).toContain("stroke-dasharray");
      // Should show group number
      expect(svg).toContain("#1");
      // Should contain the literal characters
      expect(svg).toContain(">a<");
      expect(svg).toContain(">b<");
      expect(svg).toContain(">c<");
    });

    it("should produce SVG with diamonds for anchors ^abc$", () => {
      const svg = generateRailroadSvg("^abc$");
      expect(svg).toMatch(/^<svg/);
      expect(svg).toMatch(/<\/svg>$/);
      // Anchors are rendered as diamonds (polygon)
      expect(svg).toContain("<polygon");
      // Should contain ^ and $ labels
      expect(svg).toContain(">^<");
      expect(svg).toContain(">$<");
    });

    it("should produce SVG with 'digit' label for escape sequence \\d+", () => {
      const svg = generateRailroadSvg("\\d+");
      expect(svg).toMatch(/^<svg/);
      expect(svg).toMatch(/<\/svg>$/);
      expect(svg).toContain(">digit<");
      // Should have a loop for +
      expect(svg).toContain("stroke-dasharray");
    });

    it("should handle escape sequences \\w, \\s, \\b", () => {
      const svgW = generateRailroadSvg("\\w");
      expect(svgW).toContain(">word<");

      const svgS = generateRailroadSvg("\\s");
      expect(svgS).toContain(">space<");

      const svgB = generateRailroadSvg("\\b");
      expect(svgB).toContain(">boundary<");
    });

    it("should produce SVG with 'any' label for dot", () => {
      const svg = generateRailroadSvg(".");
      expect(svg).toMatch(/^<svg/);
      expect(svg).toMatch(/<\/svg>$/);
      expect(svg).toContain(">any<");
    });

    it("should handle complex pattern without throwing", () => {
      const svg = generateRailroadSvg("^(?:[a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+)\\.([a-zA-Z]{2,})$");
      expect(svg).toMatch(/^<svg/);
      expect(svg).toMatch(/<\/svg>$/);
      // Should not be the fallback message
      expect(svg).not.toContain("too complex");
    });

    it("should return fallback SVG for empty pattern", () => {
      const svg = generateRailroadSvg("");
      expect(svg).toMatch(/^<svg/);
      expect(svg).toMatch(/<\/svg>$/);
      expect(svg).toContain("Empty pattern");
    });

    it("should return fallback SVG for whitespace-only pattern", () => {
      const svg = generateRailroadSvg("   ");
      expect(svg).toMatch(/^<svg/);
      expect(svg).toMatch(/<\/svg>$/);
      expect(svg).toContain("Empty pattern");
    });

    it("should handle /pattern/flags delimiters", () => {
      const svg = generateRailroadSvg("/abc/gi");
      expect(svg).toMatch(/^<svg/);
      expect(svg).toMatch(/<\/svg>$/);
      expect(svg).toContain(">a<");
      expect(svg).toContain(">b<");
      expect(svg).toContain(">c<");
    });

    it("should handle quantifiers *, ?, {n}, {n,m}", () => {
      const svgStar = generateRailroadSvg("a*");
      expect(svgStar).toContain(">a<");
      expect(svgStar).toContain("stroke-dasharray");

      const svgQ = generateRailroadSvg("a?");
      expect(svgQ).toContain(">a<");

      const svgBrace = generateRailroadSvg("a{3}");
      expect(svgBrace).toContain(">a<");

      const svgRange = generateRailroadSvg("a{2,5}");
      expect(svgRange).toContain(">a<");
    });

    it("should handle negated character classes [^abc]", () => {
      const svg = generateRailroadSvg("[^abc]");
      expect(svg).toMatch(/^<svg/);
      expect(svg).toMatch(/<\/svg>$/);
      expect(svg).toContain("[^abc]");
    });

    it("should handle non-capturing groups (?:...)", () => {
      const svg = generateRailroadSvg("(?:abc)");
      expect(svg).toMatch(/^<svg/);
      expect(svg).toMatch(/<\/svg>$/);
      expect(svg).toContain("(?:)");
    });

    it("should handle lookahead (?=...) and lookbehind (?<=...)", () => {
      const svgAhead = generateRailroadSvg("(?=abc)");
      expect(svgAhead).toContain("(?=)");

      const svgBehind = generateRailroadSvg("(?<=abc)");
      expect(svgBehind).toContain("(?&lt;=)");
    });

    it("should handle multiple groups with correct numbering", () => {
      const svg = generateRailroadSvg("(a)(b)(c)");
      expect(svg).toContain("#1");
      expect(svg).toContain("#2");
      expect(svg).toContain("#3");
    });

    it("should render start and end circles", () => {
      const svg = generateRailroadSvg("a");
      // Start circle (filled)
      expect(svg).toContain("<circle");
      // End circle (double)
      const circles = svg.match(/<circle/g);
      expect(circles).not.toBeNull();
      expect(circles!.length).toBeGreaterThanOrEqual(2);
    });

    it("should use currentColor for dark mode compatibility", () => {
      const svg = generateRailroadSvg("abc");
      expect(svg).toContain("currentColor");
    });

    it("should have a valid viewBox", () => {
      const svg = generateRailroadSvg("abc");
      expect(svg).toMatch(/viewBox="0 0 \d+ \d+"/);
    });

    it("should escape HTML special characters in labels", () => {
      const svg = generateRailroadSvg("\\<");
      expect(svg).toMatch(/^<svg/);
      expect(svg).toMatch(/<\/svg>$/);
      expect(svg).toContain("&lt;");
    });
  });
});
