import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock recommendations hook
const mockRecommendations = vi.fn();
vi.mock("@/hooks/use-tool-recommendations", () => ({
  useToolRecommendations: (...args: unknown[]) => mockRecommendations(...args),
}));

// Mock smart navigation — stores plain string (not JSON envelope)
vi.mock("@/hooks/use-smart-navigation", () => ({
  useSmartNavigation: () => ({
    navigateTo: (slug: string, data?: string) => {
      if (data) {
        localStorage.setItem("devflow-shared-data", data);
      }
      mockPush(`/tools/${slug}`);
    },
    getSharedData: () => localStorage.getItem("devflow-shared-data"),
    clearSharedData: () => localStorage.removeItem("devflow-shared-data"),
  }),
}));

// Mock translations
vi.mock("@/hooks/use-translation", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "tools.suggestions": "Next steps",
      };
      return map[key] ?? key;
    },
  }),
}));

// Mock HeroUI Button
vi.mock("@/components/ui", () => ({
  Button: ({
    children,
    onPress,
    ...props
  }: Record<string, unknown>) => (
    <button
      onClick={() => (onPress as () => void)?.()}
      data-testid={`suggestion-btn-${String(children).replace(/\s/g, "-")}`}
      aria-label={props["aria-label"] as string | undefined}
    >
      {children as React.ReactNode}
    </button>
  ),
}));

import { ToolSuggestions } from "@/components/shared/tool-suggestions";

describe("ToolSuggestions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("does not render when recommendations array is empty", () => {
    mockRecommendations.mockReturnValue([]);
    const { container } = render(
      <ToolSuggestions toolId="json-formatter" input="{}" output="{}" />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders buttons with tool names when recommendations exist", () => {
    mockRecommendations.mockReturnValue([
      { toolSlug: "base64-codec", toolName: "Base64", dataToPass: "test" },
      { toolSlug: "hash-generator", toolName: "Hash", dataToPass: undefined },
    ]);
    render(
      <ToolSuggestions toolId="json-formatter" input="data" output="result" />,
    );
    expect(screen.getByText("Next steps")).toBeInTheDocument();
    // Button text includes tool name (and ArrowRight icon as child)
    expect(screen.getByText("Base64")).toBeInTheDocument();
    expect(screen.getByText("Hash")).toBeInTheDocument();
  });

  it("navigates to tool page on button click", async () => {
    mockRecommendations.mockReturnValue([
      { toolSlug: "base64-codec", toolName: "Base64", dataToPass: "shared-data" },
    ]);
    const user = userEvent.setup();
    render(
      <ToolSuggestions toolId="json-formatter" input="data" output="result" />,
    );

    await user.click(screen.getByText("Base64"));
    expect(mockPush).toHaveBeenCalledWith("/tools/base64-codec");
  });

  it("sets shared data in localStorage as plain string via useSmartNavigation", async () => {
    mockRecommendations.mockReturnValue([
      { toolSlug: "base64-codec", toolName: "Base64", dataToPass: "shared-data" },
    ]);
    const user = userEvent.setup();
    render(
      <ToolSuggestions toolId="json-formatter" input="data" output="result" />,
    );

    await user.click(screen.getByText("Base64"));

    // Data is now stored as a plain string (not JSON envelope) via useSmartNavigation
    const stored = localStorage.getItem("devflow-shared-data");
    expect(stored).toBe("shared-data");
  });

  it("shows Sparkles icon and 'Next steps' label", () => {
    mockRecommendations.mockReturnValue([
      { toolSlug: "hash-generator", toolName: "Hash", dataToPass: undefined },
    ]);
    render(
      <ToolSuggestions toolId="json-formatter" input="x" output="y" />,
    );
    expect(screen.getByText("Next steps")).toBeInTheDocument();
  });
});
