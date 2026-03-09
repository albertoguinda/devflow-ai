/**
 * Regex Railroad Diagram Generator
 *
 * Converts a regex pattern string into an SVG railroad/syntax diagram.
 * Pure TypeScript — no external dependencies.
 *
 * Handles: literals, character classes, quantifiers, alternation,
 * groups, anchors, escape sequences, dot metacharacter.
 */

// --- SVG Layout Constants ---
const CHAR_HEIGHT = 28;
const CHAR_PADDING_X = 12;
const CHAR_FONT_SIZE = 13;
const GAP = 12;
const ARROW_SIZE = 5;
const GROUP_PADDING = 8;
const FORK_GAP = 10;
const LOOP_OFFSET = 18;
const ANCHOR_SIZE = 14;
const START_END_RADIUS = 8;
const MAX_NODES = 80;

// --- SVG Escape ---
function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// --- Node Types ---
interface RailNode {
  type: "literal" | "class" | "anchor" | "group" | "alternation";
  label: string;
  /** For quantifiers applied to this node */
  quantifier?: string;
  /** Sub-nodes for groups */
  children?: RailNode[];
  /** Branches for alternation */
  branches?: RailNode[][];
  /** Group number (1-based) for capture groups, 0 for non-capturing */
  groupIndex?: number;
}

// --- Escape Sequence Labels ---
const ESCAPE_LABELS: Record<string, string> = {
  d: "digit",
  D: "non-digit",
  w: "word",
  W: "non-word",
  s: "space",
  S: "non-space",
  b: "boundary",
  B: "non-boundary",
  n: "newline",
  t: "tab",
  r: "return",
  "0": "null",
};

// --- Tokenizer/Parser ---

interface ParseState {
  pos: number;
  groupCount: number;
}

function parseAlternation(pattern: string, state: ParseState): RailNode[] {
  const branches: RailNode[][] = [];
  let current = parseSequence(pattern, state);

  while (state.pos < pattern.length && pattern[state.pos] === "|") {
    branches.push(current);
    state.pos++; // skip |
    current = parseSequence(pattern, state);
  }

  if (branches.length === 0) {
    return current;
  }

  branches.push(current);
  return [
    {
      type: "alternation",
      label: "",
      branches,
    },
  ];
}

function parseSequence(pattern: string, state: ParseState): RailNode[] {
  const nodes: RailNode[] = [];

  while (state.pos < pattern.length) {
    const ch = pattern[state.pos]!;

    // Stop at | or ) — these are handled by the caller
    if (ch === "|" || ch === ")") break;

    // Guard against too many nodes
    if (nodes.length >= MAX_NODES) {
      state.pos = pattern.length;
      break;
    }

    const node = parseAtom(pattern, state);
    if (node) {
      // Check for quantifier after atom
      if (state.pos < pattern.length) {
        const q = pattern[state.pos];
        if (q === "*" || q === "+" || q === "?") {
          node.quantifier = q;
          state.pos++;
          // Check for lazy modifier
          if (state.pos < pattern.length && pattern[state.pos] === "?") {
            node.quantifier += "?";
            state.pos++;
          }
        } else if (q === "{") {
          const braceEnd = pattern.indexOf("}", state.pos);
          if (braceEnd !== -1) {
            node.quantifier = pattern.slice(state.pos, braceEnd + 1);
            state.pos = braceEnd + 1;
            // Check for lazy modifier
            if (state.pos < pattern.length && pattern[state.pos] === "?") {
              node.quantifier += "?";
              state.pos++;
            }
          }
        }
      }
      nodes.push(node);
    }
  }

  return nodes;
}

function parseAtom(pattern: string, state: ParseState): RailNode | null {
  const ch = pattern[state.pos]!;

  // Escape sequences
  if (ch === "\\") {
    state.pos++;
    if (state.pos >= pattern.length) return null;
    const next = pattern[state.pos]!;
    state.pos++;
    const label = ESCAPE_LABELS[next];
    if (label) {
      return { type: "class", label };
    }
    // Literal escaped char
    return { type: "literal", label: next };
  }

  // Character class [...]
  if (ch === "[") {
    const start = state.pos;
    state.pos++; // skip [
    // Handle negated class
    if (state.pos < pattern.length && pattern[state.pos] === "^") {
      state.pos++;
    }
    // Handle ] as first char in class
    if (state.pos < pattern.length && pattern[state.pos] === "]") {
      state.pos++;
    }
    while (state.pos < pattern.length && pattern[state.pos] !== "]") {
      if (pattern[state.pos] === "\\" && state.pos + 1 < pattern.length) {
        state.pos += 2;
      } else {
        state.pos++;
      }
    }
    if (state.pos < pattern.length) state.pos++; // skip ]
    const classText = pattern.slice(start, state.pos);
    return { type: "class", label: classText };
  }

  // Groups (...)
  if (ch === "(") {
    state.pos++; // skip (
    let groupIndex = 0;
    let groupLabel = "";

    // Check for special group types
    if (state.pos < pattern.length && pattern[state.pos] === "?") {
      state.pos++; // skip ?
      if (state.pos < pattern.length) {
        const next = pattern[state.pos]!;
        if (next === ":") {
          state.pos++; // non-capturing
          groupLabel = "(?:)";
        } else if (next === "=") {
          state.pos++;
          groupLabel = "(?=)";
        } else if (next === "!") {
          state.pos++;
          groupLabel = "(?!)";
        } else if (next === "<") {
          state.pos++;
          if (state.pos < pattern.length) {
            const afterLt = pattern[state.pos]!;
            if (afterLt === "=") {
              state.pos++;
              groupLabel = "(?<=)";
            } else if (afterLt === "!") {
              state.pos++;
              groupLabel = "(?<!)";
            } else {
              // Named group (?<name>...)
              const nameEnd = pattern.indexOf(">", state.pos);
              if (nameEnd !== -1) {
                state.pos = nameEnd + 1;
              }
              state.groupCount++;
              groupIndex = state.groupCount;
            }
          }
        }
      }
    } else {
      state.groupCount++;
      groupIndex = state.groupCount;
    }

    const children = parseAlternation(pattern, state);

    // skip closing )
    if (state.pos < pattern.length && pattern[state.pos] === ")") {
      state.pos++;
    }

    return {
      type: "group",
      label: groupLabel || `#${groupIndex}`,
      children,
      groupIndex,
    };
  }

  // Anchors
  if (ch === "^" || ch === "$") {
    state.pos++;
    return { type: "anchor", label: ch };
  }

  // Dot metacharacter
  if (ch === ".") {
    state.pos++;
    return { type: "class", label: "any" };
  }

  // Literal character
  state.pos++;
  return { type: "literal", label: ch };
}

// --- Measurement ---

interface MeasuredNode {
  node: RailNode;
  width: number;
  height: number;
  /** For alternation: per-branch measurements */
  branchMeasures?: { nodes: MeasuredNode[]; width: number; height: number }[];
  /** For group: measured children */
  measuredChildren?: MeasuredNode[];
}

function measureText(text: string): number {
  // Approximate character width at CHAR_FONT_SIZE
  return text.length * (CHAR_FONT_SIZE * 0.62) + CHAR_PADDING_X * 2;
}

function measureNode(node: RailNode): MeasuredNode {
  if (node.type === "alternation" && node.branches) {
    const branchMeasures = node.branches.map((branch) => {
      const measured = branch.map(measureNode);
      const w = measured.reduce((sum, m) => sum + m.width + GAP, 0) - GAP;
      const h = Math.max(CHAR_HEIGHT, ...measured.map((m) => m.height));
      return { nodes: measured, width: Math.max(w, 0), height: h };
    });
    const maxWidth = Math.max(...branchMeasures.map((b) => b.width), 0);
    const totalHeight = branchMeasures.reduce((sum, b) => sum + b.height + FORK_GAP, 0) - FORK_GAP;
    return {
      node,
      width: maxWidth + FORK_GAP * 4,
      height: Math.max(totalHeight, CHAR_HEIGHT),
      branchMeasures,
    };
  }

  if (node.type === "group" && node.children) {
    const measured = node.children.map(measureNode);
    const innerWidth = measured.reduce((sum, m) => sum + m.width + GAP, 0) - GAP;
    const innerHeight = Math.max(CHAR_HEIGHT, ...measured.map((m) => m.height));
    return {
      node,
      width: Math.max(innerWidth, 0) + GROUP_PADDING * 2 + GAP,
      height: innerHeight + GROUP_PADDING * 2,
      measuredChildren: measured,
    };
  }

  if (node.type === "anchor") {
    const w = ANCHOR_SIZE * 2;
    const extra = node.quantifier ? measureText(node.quantifier) : 0;
    return { node, width: w + extra, height: CHAR_HEIGHT };
  }

  // Literal, class
  const textW = measureText(node.label);
  const quantExtra = node.quantifier ? LOOP_OFFSET : 0;
  return {
    node,
    width: Math.max(textW, 24) + quantExtra,
    height: CHAR_HEIGHT + (node.quantifier ? LOOP_OFFSET : 0),
  };
}

// --- SVG Rendering ---

function renderRoundedRect(x: number, y: number, w: number, h: number, label: string, isClass: boolean): string {
  const rx = isClass ? 4 : 10;
  const fill = isClass ? "rgba(128,128,128,0.08)" : "none";
  return (
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" ry="${rx}" ` +
    `fill="${fill}" stroke="currentColor" stroke-width="1.5"/>` +
    `<text x="${x + w / 2}" y="${y + h / 2 + CHAR_FONT_SIZE * 0.35}" ` +
    `text-anchor="middle" font-family="monospace" font-size="${CHAR_FONT_SIZE}" fill="currentColor">${esc(label)}</text>`
  );
}

function renderAnchor(x: number, y: number, label: string): string {
  const cx = x + ANCHOR_SIZE;
  const cy = y;
  // Diamond shape
  return (
    `<polygon points="${cx},${cy - ANCHOR_SIZE} ${cx + ANCHOR_SIZE},${cy} ${cx},${cy + ANCHOR_SIZE} ${cx - ANCHOR_SIZE},${cy}" ` +
    `fill="rgba(128,128,128,0.08)" stroke="currentColor" stroke-width="1.5"/>` +
    `<text x="${cx}" y="${cy + CHAR_FONT_SIZE * 0.35}" ` +
    `text-anchor="middle" font-family="monospace" font-size="${CHAR_FONT_SIZE}" fill="currentColor">${esc(label)}</text>`
  );
}

function renderQuantifierLabel(x: number, y: number, quantifier: string): string {
  // Render a small label below/above the node
  let label = quantifier;
  if (quantifier === "*") label = "0+";
  else if (quantifier === "+") label = "1+";
  else if (quantifier === "?") label = "0..1";
  else if (quantifier === "*?") label = "0+ lazy";
  else if (quantifier === "+?") label = "1+ lazy";
  else if (quantifier === "??") label = "0..1 lazy";
  else {
    // {n}, {n,m}, {n,}
    label = quantifier.replace(/\?$/, " lazy");
  }

  return (
    `<text x="${x}" y="${y}" text-anchor="middle" font-family="monospace" ` +
    `font-size="${CHAR_FONT_SIZE - 2}" fill="currentColor" opacity="0.65">${esc(label)}</text>`
  );
}

function renderLoopArrow(x: number, y: number, w: number): string {
  // Draw a loop arrow below the node
  const loopY = y + CHAR_HEIGHT / 2 + 4;
  const loopBottom = loopY + LOOP_OFFSET - 6;
  const leftX = x + 4;
  const rightX = x + w - 4;
  const midX = (leftX + rightX) / 2;

  return (
    `<path d="M${rightX},${loopY} C${rightX + 6},${loopBottom} ${leftX - 6},${loopBottom} ${leftX},${loopY}" ` +
    `fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="3,2"/>` +
    // Small arrowhead on the left end
    `<polygon points="${leftX},${loopY} ${leftX + ARROW_SIZE},${loopY - ARROW_SIZE / 2} ${leftX + ARROW_SIZE},${loopY + ARROW_SIZE / 2}" ` +
    `fill="currentColor" opacity="0.5"/>` +
    renderQuantifierLabel(midX, loopBottom + CHAR_FONT_SIZE - 2, "")
  );
}

interface RenderResult {
  svg: string;
  width: number;
  height: number;
}

function renderMeasuredNode(m: MeasuredNode, x: number, railY: number): RenderResult {
  const { node } = m;
  let svg = "";

  // Anchor
  if (node.type === "anchor") {
    svg += renderAnchor(x, railY, node.label);
    return { svg, width: ANCHOR_SIZE * 2, height: CHAR_HEIGHT };
  }

  // Alternation
  if (node.type === "alternation" && m.branchMeasures) {
    const forkX = x;
    const joinX = x + m.width;
    let branchY = railY - (m.height / 2) + m.branchMeasures[0]!.height / 2;

    for (const branch of m.branchMeasures) {
      const branchRailY = branchY;
      // Line from fork to branch start
      const branchStartX = forkX + FORK_GAP * 2;
      svg += `<path d="M${forkX},${railY} C${forkX + FORK_GAP},${railY} ${branchStartX - FORK_GAP},${branchRailY} ${branchStartX},${branchRailY}" fill="none" stroke="currentColor" stroke-width="1.5"/>`;

      // Render branch nodes
      let cx = branchStartX;
      for (const child of branch.nodes) {
        const result = renderMeasuredNode(child, cx, branchRailY);
        svg += result.svg;
        cx += child.width + GAP;
        // Connector line
        if (cx < joinX - FORK_GAP * 2) {
          svg += `<line x1="${cx - GAP}" y1="${branchRailY}" x2="${cx}" y2="${branchRailY}" stroke="currentColor" stroke-width="1.5"/>`;
        }
      }

      // Line from branch end to join
      const branchEndX = joinX - FORK_GAP * 2;
      svg += `<path d="M${Math.min(cx - GAP, branchEndX)},${branchRailY} C${branchEndX + FORK_GAP},${branchRailY} ${joinX - FORK_GAP},${railY} ${joinX},${railY}" fill="none" stroke="currentColor" stroke-width="1.5"/>`;

      branchY += branch.height + FORK_GAP;
    }

    return { svg, width: m.width, height: m.height };
  }

  // Group
  if (node.type === "group" && m.measuredChildren) {
    const groupX = x;
    const groupY = railY - m.height / 2;
    const groupW = m.width;
    const groupH = m.height;

    // Group box (dashed)
    svg += `<rect x="${groupX}" y="${groupY}" width="${groupW}" height="${groupH}" rx="6" ry="6" ` +
      `fill="rgba(128,128,128,0.04)" stroke="currentColor" stroke-width="1" stroke-dasharray="4,3"/>`;

    // Group label
    const groupLabelText = node.label;
    svg += `<text x="${groupX + 4}" y="${groupY + CHAR_FONT_SIZE - 1}" ` +
      `font-family="monospace" font-size="${CHAR_FONT_SIZE - 3}" fill="currentColor" opacity="0.5">${esc(groupLabelText)}</text>`;

    // Render children inside group
    let cx = groupX + GROUP_PADDING + GAP / 2;
    for (let i = 0; i < m.measuredChildren.length; i++) {
      const child = m.measuredChildren[i]!;
      const result = renderMeasuredNode(child, cx, railY);
      svg += result.svg;
      cx += child.width + GAP;
      // Connector
      if (i < m.measuredChildren.length - 1) {
        svg += `<line x1="${cx - GAP}" y1="${railY}" x2="${cx}" y2="${railY}" stroke="currentColor" stroke-width="1.5"/>`;
      }
    }

    // Quantifier for the group
    if (node.quantifier) {
      const loopX = groupX;
      const loopW = groupW;
      svg += renderLoopArrow(loopX, groupY + groupH - CHAR_HEIGHT / 2, loopW);
      svg += renderQuantifierLabel(groupX + groupW / 2, groupY + groupH + LOOP_OFFSET, node.quantifier);
    }

    return { svg, width: m.width, height: m.height };
  }

  // Literal or class
  const isClass = node.type === "class";
  const textW = measureText(node.label);
  const boxW = Math.max(textW, 24);
  const boxH = CHAR_HEIGHT;
  const boxX = x;
  const boxY = railY - boxH / 2;

  svg += renderRoundedRect(boxX, boxY, boxW, boxH, node.label, isClass);

  // Quantifier
  if (node.quantifier) {
    svg += renderLoopArrow(boxX, boxY, boxW);
    svg += renderQuantifierLabel(boxX + boxW / 2, boxY + boxH + LOOP_OFFSET, node.quantifier);
  }

  return { svg, width: boxW, height: m.height };
}

// --- Public API ---

/**
 * Generate an SVG railroad diagram for a regex pattern.
 *
 * @param pattern - The regex pattern string (without delimiters or flags).
 * @returns An SVG string.
 */
export function generateRailroadSvg(pattern: string): string {
  // Empty pattern
  if (!pattern.trim()) {
    return makeFallbackSvg("Empty pattern");
  }

  // Strip /.../ delimiters if present
  let raw = pattern;
  const delimMatch = pattern.match(/^\/(.+)\/[gimsuy]*$/);
  if (delimMatch && delimMatch[1]) {
    raw = delimMatch[1];
  }

  try {
    const state: ParseState = { pos: 0, groupCount: 0 };
    const nodes = parseAlternation(raw, state);

    if (nodes.length === 0) {
      return makeFallbackSvg("Empty pattern");
    }

    // Guard: if we hit MAX_NODES, show fallback
    if (nodes.length >= MAX_NODES) {
      return makeFallbackSvg("Pattern too complex to visualize");
    }

    const measured = nodes.map(measureNode);
    const maxHeight = Math.max(CHAR_HEIGHT * 2, ...measured.map((m) => m.height));
    const svgHeight = maxHeight + LOOP_OFFSET + 20;
    const railYPos = svgHeight / 2;

    let svg = "";
    let cx = START_END_RADIUS * 2 + GAP;

    // Start circle
    svg += `<circle cx="${START_END_RADIUS}" cy="${railYPos}" r="${START_END_RADIUS}" fill="currentColor" opacity="0.3"/>`;
    svg += `<line x1="${START_END_RADIUS * 2}" y1="${railYPos}" x2="${cx}" y2="${railYPos}" stroke="currentColor" stroke-width="1.5"/>`;

    // Render each top-level node
    for (let i = 0; i < measured.length; i++) {
      const m = measured[i]!;
      const result = renderMeasuredNode(m, cx, railYPos);
      svg += result.svg;
      cx += m.width + GAP;

      // Connector line between nodes
      if (i < measured.length - 1) {
        svg += `<line x1="${cx - GAP}" y1="${railYPos}" x2="${cx}" y2="${railYPos}" stroke="currentColor" stroke-width="1.5"/>`;
        // Small arrow
        svg += `<polygon points="${cx},${railYPos} ${cx - ARROW_SIZE},${railYPos - ARROW_SIZE / 2} ${cx - ARROW_SIZE},${railYPos + ARROW_SIZE / 2}" fill="currentColor" opacity="0.4"/>`;
      }
    }

    // End circle
    const endX = cx + GAP;
    svg += `<line x1="${cx - GAP}" y1="${railYPos}" x2="${endX}" y2="${railYPos}" stroke="currentColor" stroke-width="1.5"/>`;
    svg += `<circle cx="${endX + START_END_RADIUS}" cy="${railYPos}" r="${START_END_RADIUS}" fill="none" stroke="currentColor" stroke-width="2"/>`;
    svg += `<circle cx="${endX + START_END_RADIUS}" cy="${railYPos}" r="${START_END_RADIUS - 3}" fill="currentColor" opacity="0.3"/>`;

    const finalWidth = endX + START_END_RADIUS * 2 + GAP;

    return (
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Math.ceil(finalWidth)} ${Math.ceil(svgHeight)}" ` +
      `width="${Math.ceil(finalWidth)}" height="${Math.ceil(svgHeight)}" ` +
      `style="color: currentColor; max-width: 100%; height: auto;">` +
      svg +
      `</svg>`
    );
  } catch {
    return makeFallbackSvg("Pattern too complex to visualize");
  }
}

function makeFallbackSvg(message: string): string {
  const w = 320;
  const h = 48;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" ` +
    `style="color: currentColor; max-width: 100%; height: auto;">` +
    `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="8" ry="8" fill="rgba(128,128,128,0.06)" stroke="currentColor" stroke-width="1" stroke-dasharray="4,3"/>` +
    `<text x="${w / 2}" y="${h / 2 + 5}" text-anchor="middle" font-family="monospace" font-size="13" fill="currentColor" opacity="0.5">${esc(message)}</text>` +
    `</svg>`
  );
}
