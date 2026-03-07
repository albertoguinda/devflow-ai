import type { SecurityFlag, SecurityFlagType } from "@/types/prompt-analyzer";

const INJECTION_PATTERNS: {
  pattern: RegExp;
  type: SecurityFlagType;
  severity: "critical" | "warning" | "info";
  description: string;
  descriptionKey: string;
}[] = [
  {
    // eslint-disable-next-line security/detect-unsafe-regex -- static prompt injection detection
    pattern: /ignore\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?)/i,
    type: "ignore_instruction",
    severity: "critical",
    description: "Attempt to ignore previous instructions detected",
    descriptionKey: "ignore_instruction",
  },
  {
    pattern: /you\s+are\s+(now|actually)\s+a/i,
    type: "role_override",
    severity: "critical",
    description: "Role override attempt detected",
    descriptionKey: "role_override",
  },
  {
    pattern: /pretend\s+(you('re|are)|to\s+be)/i,
    type: "role_override",
    severity: "warning",
    description: "Role pretending instruction detected",
    descriptionKey: "role_pretending",
  },
  {
    pattern: /forget\s+(everything|all|your)/i,
    type: "ignore_instruction",
    severity: "critical",
    description: "Memory reset attempt detected",
    descriptionKey: "memory_reset",
  },
  {
    pattern: /jailbreak|dan\s+mode|developer\s+mode/i,
    type: "jailbreak_attempt",
    severity: "critical",
    description: "Jailbreak attempt detected",
    descriptionKey: "jailbreak_attempt",
  },
  {
    pattern: /bypass\s+(safety|filter|restriction)/i,
    type: "jailbreak_attempt",
    severity: "critical",
    description: "Safety bypass attempt detected",
    descriptionKey: "safety_bypass",
  },
  {
    pattern: /reveal\s+(your|the)\s+(system|initial)\s+prompt/i,
    type: "data_exfiltration",
    severity: "warning",
    description: "System prompt extraction attempt detected",
    descriptionKey: "system_prompt_extraction",
  },
  {
    pattern: /\[system\]|\[admin\]|<\s*system\s*>/i,
    type: "prompt_injection",
    severity: "critical",
    description: "System tag injection detected",
    descriptionKey: "system_tag_injection",
  },
  {
    // eslint-disable-next-line security/detect-unsafe-regex -- static jailbreak detection
    pattern: /act\s+as\s+(if|though)\s+you\s+(have\s+)?no\s+(restrictions?|rules?|limits?)/i,
    type: "jailbreak_attempt",
    severity: "critical",
    description: "Restriction bypass attempt detected",
    descriptionKey: "restriction_bypass",
  },
  {
    pattern: /echo\s+back\s+the\s+content\s+of/i,
    type: "data_exfiltration",
    severity: "warning",
    description: "Potential data exfiltration attempt",
    descriptionKey: "data_exfiltration",
  },
  {
    pattern: /decode\s+this\s+base64/i,
    type: "prompt_injection",
    severity: "info",
    description: "Obfuscated content (Base64) detected",
    descriptionKey: "base64_detected",
  },
  {
    pattern: /from\s+now\s+on,\s+every\s+response\s+must/i,
    type: "role_override",
    severity: "warning",
    description: "Constraint override attempt",
    descriptionKey: "constraint_override",
  },
  {
    pattern: /markdown\s+link\s+to\s+https?:\/\//i,
    type: "data_exfiltration",
    severity: "info",
    description: "Potential tracking pixel or exfiltration via Markdown link",
    descriptionKey: "markdown_exfiltration",
  },
  {
    // Detect suspicious letter-space patterns (payload splitting). Uses non-backtracking \s match.
    pattern: /\b[a-z]\s+[a-z]\s+[a-z]\s+[a-z]\s+[a-z]\s/i,
    type: "prompt_injection",
    severity: "warning",
    description: "Suspicious spacing detected (potential payload splitting)",
    descriptionKey: "suspicious_spacing",
  },
  {
    pattern: /translate\s+the\s+following\s+and\s+ignore/i,
    type: "jailbreak_attempt",
    severity: "critical",
    description: "Indirect injection via translation task detected",
    descriptionKey: "translation_injection",
  },
  {
    pattern: /reveal\s+the\s+hidden\s+text\s+above/i,
    type: "data_exfiltration",
    severity: "critical",
    description: "Attempt to reveal hidden context detected",
    descriptionKey: "reveal_hidden_context",
  },
];

export function detectSecurityFlags(prompt: string): SecurityFlag[] {
  const flags: SecurityFlag[] = [];

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.pattern.test(prompt)) {
      flags.push({
        type: pattern.type,
        severity: pattern.severity,
        description: pattern.description,
        descriptionKey: pattern.descriptionKey,
      });
    }
  }

  return flags;
}
