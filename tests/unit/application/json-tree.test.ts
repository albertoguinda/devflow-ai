import { describe, it, expect } from "vitest";
import {
  buildJsonTree,
  collectPathsToDepth,
  collectAllPaths,
} from "@/lib/application/json-tree";

describe("JSON Tree Builder", () => {
  describe("buildJsonTree", () => {
    it("should return null for undefined input", () => {
      expect(buildJsonTree(undefined)).toBeNull();
    });

    it("should build a tree from a simple object", () => {
      const data = { a: 1 };
      const tree = buildJsonTree(data);

      expect(tree).not.toBeNull();
      expect(tree!.type).toBe("object");
      expect(tree!.key).toBe("$");
      expect(tree!.path).toBe("$");
      expect(tree!.children).toHaveLength(1);
      expect(tree!.children![0]!.key).toBe("a");
      expect(tree!.children![0]!.value).toBe(1);
      expect(tree!.children![0]!.type).toBe("number");
      expect(tree!.children![0]!.path).toBe("$.a");
    });

    it("should build a tree from a nested object", () => {
      const data = { user: { name: "Alice", age: 30 } };
      const tree = buildJsonTree(data);

      expect(tree).not.toBeNull();
      expect(tree!.children).toHaveLength(1);

      const userNode = tree!.children![0]!;
      expect(userNode.key).toBe("user");
      expect(userNode.type).toBe("object");
      expect(userNode.path).toBe("$.user");
      expect(userNode.children).toHaveLength(2);

      const nameNode = userNode.children![0]!;
      expect(nameNode.key).toBe("name");
      expect(nameNode.value).toBe("Alice");
      expect(nameNode.type).toBe("string");
      expect(nameNode.path).toBe("$.user.name");

      const ageNode = userNode.children![1]!;
      expect(ageNode.key).toBe("age");
      expect(ageNode.value).toBe(30);
      expect(ageNode.type).toBe("number");
      expect(ageNode.path).toBe("$.user.age");
    });

    it("should build a tree from an array", () => {
      const data = [1, 2, 3];
      const tree = buildJsonTree(data);

      expect(tree).not.toBeNull();
      expect(tree!.type).toBe("array");
      expect(tree!.children).toHaveLength(3);

      expect(tree!.children![0]!.key).toBe("0");
      expect(tree!.children![0]!.value).toBe(1);
      expect(tree!.children![0]!.type).toBe("number");
      expect(tree!.children![0]!.path).toBe("$[0]");

      expect(tree!.children![1]!.key).toBe("1");
      expect(tree!.children![1]!.path).toBe("$[1]");

      expect(tree!.children![2]!.key).toBe("2");
      expect(tree!.children![2]!.path).toBe("$[2]");
    });

    it("should handle a string primitive", () => {
      const tree = buildJsonTree("hello");

      expect(tree).not.toBeNull();
      expect(tree!.type).toBe("string");
      expect(tree!.value).toBe("hello");
      expect(tree!.path).toBe("$");
      expect(tree!.children).toBeUndefined();
    });

    it("should handle a number primitive", () => {
      const tree = buildJsonTree(42);

      expect(tree).not.toBeNull();
      expect(tree!.type).toBe("number");
      expect(tree!.value).toBe(42);
      expect(tree!.path).toBe("$");
      expect(tree!.children).toBeUndefined();
    });

    it("should handle a boolean primitive", () => {
      const tree = buildJsonTree(true);

      expect(tree).not.toBeNull();
      expect(tree!.type).toBe("boolean");
      expect(tree!.value).toBe(true);
      expect(tree!.path).toBe("$");
      expect(tree!.children).toBeUndefined();
    });

    it("should handle null", () => {
      const tree = buildJsonTree(null);

      expect(tree).not.toBeNull();
      expect(tree!.type).toBe("null");
      expect(tree!.value).toBeNull();
      expect(tree!.path).toBe("$");
      expect(tree!.children).toBeUndefined();
    });

    it("should handle an empty object", () => {
      const tree = buildJsonTree({});

      expect(tree).not.toBeNull();
      expect(tree!.type).toBe("object");
      expect(tree!.children).toHaveLength(0);
    });

    it("should handle an empty array", () => {
      const tree = buildJsonTree([]);

      expect(tree).not.toBeNull();
      expect(tree!.type).toBe("array");
      expect(tree!.children).toHaveLength(0);
    });

    it("should handle a complex nested structure", () => {
      const data = {
        users: [
          { id: 1, name: "Alice", roles: ["admin", "user"] },
          { id: 2, name: "Bob", roles: ["user"] },
        ],
        metadata: {
          total: 2,
          active: true,
          deleted: null,
        },
      };
      const tree = buildJsonTree(data);

      expect(tree).not.toBeNull();
      expect(tree!.type).toBe("object");
      expect(tree!.children).toHaveLength(2);

      // users array
      const usersNode = tree!.children![0]!;
      expect(usersNode.key).toBe("users");
      expect(usersNode.type).toBe("array");
      expect(usersNode.path).toBe("$.users");
      expect(usersNode.children).toHaveLength(2);

      // First user
      const user0 = usersNode.children![0]!;
      expect(user0.type).toBe("object");
      expect(user0.path).toBe("$.users[0]");
      expect(user0.children).toHaveLength(3);

      // Roles array nested in user
      const rolesNode = user0.children![2]!;
      expect(rolesNode.key).toBe("roles");
      expect(rolesNode.type).toBe("array");
      expect(rolesNode.path).toBe("$.users[0].roles");
      expect(rolesNode.children).toHaveLength(2);
      expect(rolesNode.children![0]!.value).toBe("admin");
      expect(rolesNode.children![0]!.path).toBe("$.users[0].roles[0]");

      // metadata object
      const metaNode = tree!.children![1]!;
      expect(metaNode.key).toBe("metadata");
      expect(metaNode.type).toBe("object");
      expect(metaNode.path).toBe("$.metadata");
      expect(metaNode.children).toHaveLength(3);

      // Check nested primitive types
      const totalNode = metaNode.children![0]!;
      expect(totalNode.type).toBe("number");
      expect(totalNode.value).toBe(2);

      const activeNode = metaNode.children![1]!;
      expect(activeNode.type).toBe("boolean");
      expect(activeNode.value).toBe(true);

      const deletedNode = metaNode.children![2]!;
      expect(deletedNode.type).toBe("null");
      expect(deletedNode.value).toBeNull();
    });

    it("should use custom root key when provided", () => {
      const tree = buildJsonTree({ a: 1 }, "root");

      expect(tree).not.toBeNull();
      expect(tree!.key).toBe("root");
      expect(tree!.path).toBe("root");
      expect(tree!.children![0]!.path).toBe("root.a");
    });

    it("should handle keys that need bracket notation", () => {
      const data = { "my-key": 1, "0start": 2, normal: 3 };
      const tree = buildJsonTree(data);

      expect(tree!.children![0]!.path).toBe('$["my-key"]');
      expect(tree!.children![1]!.path).toBe('$["0start"]');
      expect(tree!.children![2]!.path).toBe("$.normal");
    });

    it("should filter out dangerous keys (__proto__, constructor, prototype)", () => {
      // Build from an object that has these keys without triggering prototype pollution
      const obj = Object.create(null);
      obj["safe"] = 1;
      obj["__proto__"] = "bad";
      obj["constructor"] = "bad";
      obj["prototype"] = "bad";

      const tree = buildJsonTree(obj);

      expect(tree).not.toBeNull();
      expect(tree!.children).toHaveLength(1);
      expect(tree!.children![0]!.key).toBe("safe");
    });

    it("should handle false as a valid value", () => {
      const tree = buildJsonTree(false);

      expect(tree).not.toBeNull();
      expect(tree!.type).toBe("boolean");
      expect(tree!.value).toBe(false);
    });

    it("should handle zero as a valid value", () => {
      const tree = buildJsonTree(0);

      expect(tree).not.toBeNull();
      expect(tree!.type).toBe("number");
      expect(tree!.value).toBe(0);
    });

    it("should handle empty string as a valid value", () => {
      const tree = buildJsonTree("");

      expect(tree).not.toBeNull();
      expect(tree!.type).toBe("string");
      expect(tree!.value).toBe("");
    });
  });

  describe("collectPathsToDepth", () => {
    it("should collect paths up to specified depth", () => {
      const data = {
        a: { b: { c: 1 } },
        d: [1, 2],
      };
      const tree = buildJsonTree(data)!;

      // Depth 1: root's children that are expandable
      const depth1 = collectPathsToDepth(tree, 1);
      expect(depth1.has("$")).toBe(true);
      expect(depth1.has("$.a")).toBe(false);
      expect(depth1.has("$.d")).toBe(false);

      // Depth 2: root + root's expandable children
      const depth2 = collectPathsToDepth(tree, 2);
      expect(depth2.has("$")).toBe(true);
      expect(depth2.has("$.a")).toBe(true);
      expect(depth2.has("$.d")).toBe(true);
      expect(depth2.has("$.a.b")).toBe(false);

      // Depth 3: includes nested
      const depth3 = collectPathsToDepth(tree, 3);
      expect(depth3.has("$.a.b")).toBe(true);
    });

    it("should return empty set for leaf nodes", () => {
      const tree = buildJsonTree(42)!;
      const paths = collectPathsToDepth(tree, 5);
      expect(paths.size).toBe(0);
    });
  });

  describe("collectAllPaths", () => {
    it("should collect all expandable paths", () => {
      const data = {
        a: { b: { c: 1 } },
        d: [1, 2],
      };
      const tree = buildJsonTree(data)!;
      const allPaths = collectAllPaths(tree);

      expect(allPaths.has("$")).toBe(true);
      expect(allPaths.has("$.a")).toBe(true);
      expect(allPaths.has("$.a.b")).toBe(true);
      expect(allPaths.has("$.d")).toBe(true);
      // Leaf nodes should NOT be in the set
      expect(allPaths.has("$.a.b.c")).toBe(false);
    });

    it("should return empty set for a primitive root", () => {
      const tree = buildJsonTree("hello")!;
      const allPaths = collectAllPaths(tree);
      expect(allPaths.size).toBe(0);
    });

    it("should return empty set for empty object", () => {
      const tree = buildJsonTree({})!;
      const allPaths = collectAllPaths(tree);
      // Empty object has no children to expand
      expect(allPaths.size).toBe(0);
    });
  });
});
