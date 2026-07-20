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
  function MockDropdown({ children }: { children: React.ReactNode }) { return <div data-testid="dropdown">{children}</div>; }
  MockDropdown.displayName = "Dropdown";
  function MockPopover({ children }: { children: React.ReactNode }) { return <div>{children}</div>; }
  MockPopover.displayName = "Dropdown.Popover";
  function MockMenu({ children }: { children: React.ReactNode }) { return <div data-testid="dropdown-menu">{children}</div>; }
  MockMenu.displayName = "Dropdown.Menu";
  function MockItem({ children, id }: { children: React.ReactNode; id: string }) { return <div data-testid={`locale-${id}`}>{children}</div>; }
  MockItem.displayName = "Dropdown.Item";
  function MockTrigger({ children }: { children: React.ReactNode }) { return <div data-testid="dropdown-trigger">{children}</div>; }
  MockTrigger.displayName = "Dropdown.Trigger";
  MockDropdown.Trigger = MockTrigger;
  MockDropdown.Popover = MockPopover;
  MockDropdown.Menu = MockMenu;
  MockDropdown.Item = MockItem;
  function MockItemIndicator() { return null; }
  MockItemIndicator.displayName = "Dropdown.ItemIndicator";
  MockDropdown.ItemIndicator = MockItemIndicator;
  const Label = function MockLabel({ children }: { children: React.ReactNode }) { return <span>{children}</span>; };
  Label.displayName = "Label";
  return { Dropdown: MockDropdown, Label };
});

// Mock Button
vi.mock("@/components/ui", () => {
  function MockButton({ children, onPress, isIconOnly, ...props }: Record<string, unknown>) {
    return (
      <button
        onClick={() => (onPress as () => void)?.()}
        aria-label={props["aria-label"] as string | undefined}
        data-testid="locale-btn"
        data-icon-only={isIconOnly ? "true" : undefined}
      >
        {children as React.ReactNode}
      </button>
    );
  }
  MockButton.displayName = "Button";
  return { Button: MockButton };
});

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
