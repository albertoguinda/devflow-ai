import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "DevFlowAI - 15 Free Developer Tools for AI Development";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TOOL_NAMES = [
  "Prompt Analyzer",
  "Code Review",
  "Cost Calculator",
  "Token Visualizer",
  "Context Manager",
  "JSON Formatter",
  "Regex Humanizer",
  "DTO-Matic",
  "Cron Builder",
  "Tailwind Sorter",
  "Variable Wizard",
  "HTTP Status",
  "Git Commit",
  "Base64",
  "UUID Generator",
];

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "linear-gradient(145deg, #0f172a 0%, #1e1b4b 40%, #0f172a 100%)",
          padding: "50px 60px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decorations */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-80px",
            width: "450px",
            height: "450px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 60%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-120px",
            left: "30%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 60%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "40%",
            right: "10%",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 60%)",
            display: "flex",
          }}
        />

        {/* Top bar: logo + badges */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "32px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "52px",
                height: "52px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #6366f1, #a855f7)",
                boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
              }}
            >
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              </svg>
            </div>
            <span
              style={{
                fontSize: "30px",
                fontWeight: 800,
                color: "#f1f5f9",
                letterSpacing: "-0.02em",
              }}
            >
              DevFlowAI
            </span>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <span
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#34d399",
                textTransform: "uppercase" as const,
                letterSpacing: "0.08em",
                background: "rgba(52,211,153,0.12)",
                padding: "7px 18px",
                borderRadius: "100px",
                border: "1px solid rgba(52,211,153,0.25)",
              }}
            >
              100% Free
            </span>
            <span
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#a78bfa",
                textTransform: "uppercase" as const,
                letterSpacing: "0.08em",
                background: "rgba(167,139,250,0.12)",
                padding: "7px 18px",
                borderRadius: "100px",
                border: "1px solid rgba(167,139,250,0.25)",
              }}
            >
              Open Source
            </span>
            <span
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#38bdf8",
                textTransform: "uppercase" as const,
                letterSpacing: "0.08em",
                background: "rgba(56,189,248,0.12)",
                padding: "7px 18px",
                borderRadius: "100px",
                border: "1px solid rgba(56,189,248,0.25)",
              }}
            >
              No Login
            </span>
          </div>
        </div>

        {/* Main headline */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
          <h1
            style={{
              fontSize: "62px",
              fontWeight: 900,
              color: "#f8fafc",
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              margin: 0,
            }}
          >
            15 developer tools
          </h1>
          <h1
            style={{
              fontSize: "62px",
              fontWeight: 900,
              background: "linear-gradient(90deg, #6366f1, #a855f7, #ec4899)",
              backgroundClip: "text",
              color: "transparent",
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              margin: "0 0 24px 0",
            }}
          >
            for AI development
          </h1>

          {/* Tool pills grid */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", maxWidth: "720px" }}>
            {TOOL_NAMES.map((name) => (
              <span
                key={name}
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#cbd5e1",
                  background: "rgba(148,163,184,0.1)",
                  padding: "5px 14px",
                  borderRadius: "8px",
                  border: "1px solid rgba(148,163,184,0.15)",
                }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <span
            style={{
              fontSize: "17px",
              color: "#94a3b8",
              fontStyle: "italic",
            }}
          >
            Para vosotros, developers
          </span>
          <span
            style={{
              fontSize: "16px",
              color: "#64748b",
              fontWeight: 600,
            }}
          >
            devflowai.dev
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
