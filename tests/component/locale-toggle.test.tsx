import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock locale store
const mockSetLocale = vi.fn();
let mockLocale = "en";
vi.mock("@/lib/stores/locale-store", () => ({
  useLocaleStore: (selector: (s: { locale: string; setLocale: typeof mockSetLocale }) => unknown) =>
    selector({ locale: mockLocale, setLocale: mockSetLocale }),
}));

// Mock translations
vi.mock("@/hooks/use-translation", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "sidebar.switchLocale": "Switch language",
      };
      return map[key] ?? key;
    },
  }),
}));

// Mock HeroUI Dropdown as a simple button (dropdown behavior tested via Playwright)
vi.mock("@heroui/react", () => {
  const Dropdown = ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown">{children}</div>;
  Dropdown.Popover = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  Dropdown.Menu = ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-menu">{children}</div>;
  Dropdown.Item = ({ children, id }: { children: React.ReactNode; id: string }) => <div data-testid={`locale-${id}`}>{children}</div>;
  Dropdown.ItemIndicator = () => null;
  const Label = ({ children }: { children: React.ReactNode }) => <span>{children}</span>;
  return { Dropdown, Label };
});

// Mock Button
vi.mock("@/components/ui", () => ({
  Button: ({
    children,
    onPress,
    isIconOnly,
    ...props
  }: Record<string, unknown>) => (
    <button
      onClick={() => (onPress as () => void)?.()}
      aria-label={props["aria-label"] as string | undefined}
      data-testid="locale-btn"
      data-icon-only={isIconOnly ? "true" : undefined}
    >
      {children as React.ReactNode}
    </button>
  ),
}));

// Mock lucide-react
vi.mock("lucide-react", () => ({
  Globe: () => <svg data-testid="globe-icon" />,
}));

import { LocaleToggle } from "@/components/shared/locale-toggle";

describe("LocaleToggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocale = "en";
  });

  it("renders icon variant with Globe icon", () => {
    render(<LocaleToggle variant="icon" />);
    expect(screen.getByTestId("globe-icon")).toBeInTheDocument();
  });

  it("renders full variant with current locale name", () => {
    mockLocale = "en";
    render(<LocaleToggle variant="full" />);
    // "English" appears in trigger button and in the dropdown menu item
    expect(screen.getAllByText("English").length).toBeGreaterThanOrEqual(1);
  });

  it("shows native name for Spanish locale in full variant", () => {
    mockLocale = "es";
    render(<LocaleToggle variant="full" />);
    // "Español" appears in trigger button and in the dropdown menu item
    expect(screen.getAllByText("Español").length).toBeGreaterThanOrEqual(1);
  });

  it("renders dropdown menu with all 8 locales", () => {
    render(<LocaleToggle />);
    expect(screen.getByTestId("locale-en")).toBeInTheDocument();
    expect(screen.getByTestId("locale-es")).toBeInTheDocument();
    expect(screen.getByTestId("locale-fr")).toBeInTheDocument();
    expect(screen.getByTestId("locale-pt")).toBeInTheDocument();
    expect(screen.getByTestId("locale-de")).toBeInTheDocument();
    expect(screen.getByTestId("locale-it")).toBeInTheDocument();
    expect(screen.getByTestId("locale-zh")).toBeInTheDocument();
    expect(screen.getByTestId("locale-ja")).toBeInTheDocument();
  });

  it("shows flag emoji and native name for each locale", () => {
    render(<LocaleToggle />);
    expect(screen.getByText("Français")).toBeInTheDocument();
    expect(screen.getByText("Português")).toBeInTheDocument();
    expect(screen.getByText("Deutsch")).toBeInTheDocument();
    expect(screen.getByText("Italiano")).toBeInTheDocument();
    expect(screen.getByText("中文")).toBeInTheDocument();
    expect(screen.getByText("日本語")).toBeInTheDocument();
  });

  it("has accessible label", () => {
    render(<LocaleToggle />);
    const btn = screen.getByTestId("locale-btn");
    expect(btn.getAttribute("aria-label")).toBe("Switch language");
  });
});
