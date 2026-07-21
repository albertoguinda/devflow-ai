import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSetLocale = vi.fn();
let mockLocale = "en";

vi.mock("@/lib/stores/locale-store", () => ({
  useLocaleStore: (selector: (s: { locale: string; setLocale: typeof mockSetLocale }) => unknown) =>
    selector({ locale: mockLocale, setLocale: mockSetLocale }),
}));

vi.mock("@/hooks/use-translation", () => ({
  useTranslation: () => ({
    t: (key: string) => (key === "sidebar.switchLocale" ? "Switch language" : key),
  }),
}));

vi.mock("lucide-react", () => ({
  Globe: () => <svg data-testid="globe-icon" />,
  Check: () => <svg data-testid="check-icon" />,
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

  it("trigger has an accessible label", () => {
    render(<LocaleToggle />);
    expect(screen.getByRole("button", { name: "Switch language" })).toBeInTheDocument();
  });

  it("menu is closed by default and opens on click", () => {
    render(<LocaleToggle />);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Switch language" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("shows all 8 locales when open", () => {
    render(<LocaleToggle />);
    fireEvent.click(screen.getByRole("button", { name: "Switch language" }));
    expect(screen.getAllByRole("menuitemradio")).toHaveLength(8);
    for (const native of ["Español", "Français", "Português", "Deutsch", "Italiano"]) {
      // eslint-disable-next-line security/detect-non-literal-regexp -- hardcoded locale names, not user input
      expect(screen.getByRole("menuitemradio", { name: new RegExp(native, "i") })).toBeInTheDocument();
    }
  });

  it("full variant shows the current locale native name on the trigger", () => {
    mockLocale = "es";
    render(<LocaleToggle variant="full" />);
    expect(screen.getByRole("button", { name: /switch language/i })).toHaveTextContent("Español");
  });

  it("selecting a locale calls setLocale and closes the menu", () => {
    render(<LocaleToggle />);
    fireEvent.click(screen.getByRole("button", { name: "Switch language" }));
    fireEvent.click(screen.getByRole("menuitemradio", { name: /Español/i }));
    expect(mockSetLocale).toHaveBeenCalledWith("es");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
