// JSON Tree Builder — Pure logic for converting parsed JSON into a navigable tree structure

export interface JsonTreeNode {
  key: string;
  value: unknown;
  type: "object" | "array" | "string" | "number" | "boolean" | "null";
  children?: JsonTreeNode[];
  path: string; // JSONPath like "$.foo.bar[0]"
}

const DANGEROUS_KEYS = new Set(["__proto__", "constructor", "prototype"]);

/**
 * Determines the JSON type of a value.
 */
function getJsonType(
  value: unknown
): "object" | "array" | "string" | "number" | "boolean" | "null" {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  switch (typeof value) {
    case "string":
      return "string";
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    default:
      return "object";
  }
}

/**
 * Builds a JSONPath segment for an object key.
 */
function buildObjectKeyPath(parentPath: string, key: string): string {
  if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {
    return `${parentPath}.${key}`;
  }
  return `${parentPath}["${key}"]`;
}

/**
 * Recursively builds a tree from any valid JSON value.
 *
 * @param data - The parsed JSON value to convert into a tree
 * @param rootKey - Optional key name for the root node (defaults to "$")
 * @returns A JsonTreeNode representing the root, or null if data is undefined
 */
export function buildJsonTree(
  data: unknown,
  rootKey?: string
): JsonTreeNode | null {
  if (data === undefined) return null;

  const key = rootKey ?? "$";
  const path = rootKey ?? "$";

  return buildNode(data, key, path);
}

function buildNode(
  value: unknown,
  key: string,
  path: string
): JsonTreeNode {
  const type = getJsonType(value);

  if (type === "object" && value !== null) {
    const entries = Object.entries(value as Record<string, unknown>);
    const children: JsonTreeNode[] = [];

    for (const [childKey, childValue] of entries) {
      if (DANGEROUS_KEYS.has(childKey)) continue;
      const childPath = buildObjectKeyPath(path, childKey);
      children.push(buildNode(childValue, childKey, childPath));
    }

    return { key, value, type, children, path };
  }

  if (type === "array") {
    const arr = value as unknown[];
    const children: JsonTreeNode[] = arr.map((item, index) => {
      const childPath = `${path}[${index}]`;
      return buildNode(item, String(index), childPath);
    });

    return { key, value, type, children, path };
  }

  // Primitives: string, number, boolean, null — leaf nodes
  return { key, value, type, path };
}

/**
 * Collects all paths from a tree up to a given depth.
 * Useful for computing the default expanded set.
 */
export function collectPathsToDepth(
  node: JsonTreeNode,
  maxDepth: number,
  currentDepth: number = 0
): Set<string> {
  const paths = new Set<string>();

  if (currentDepth >= maxDepth) return paths;

  if (node.children && node.children.length > 0) {
    paths.add(node.path);
    for (const child of node.children) {
      const childPaths = collectPathsToDepth(child, maxDepth, currentDepth + 1);
      for (const p of childPaths) {
        paths.add(p);
      }
    }
  }

  return paths;
}

/**
 * Collects ALL expandable paths in the tree (for "expand all").
 */
export function collectAllPaths(node: JsonTreeNode): Set<string> {
  const paths = new Set<string>();

  if (node.children && node.children.length > 0) {
    paths.add(node.path);
    for (const child of node.children) {
      const childPaths = collectAllPaths(child);
      for (const p of childPaths) {
        paths.add(p);
      }
    }
  }

  return paths;
}
