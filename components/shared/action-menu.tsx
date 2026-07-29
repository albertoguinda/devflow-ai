"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ActionMenuItem {
  /** Stable key handed back to `onSelect`. */
  id: string;
  /** Rendered inside the option. Plain text or a full node. */
  label: React.ReactNode;
  /** Read by screen readers and used for type-ahead when `label` is a node. */
  textValue?: string;
}

interface ActionMenuProps {
  /** Accessible name for the trigger and for the menu. */
  label: string;
  /** Content of the trigger button. */
  trigger: React.ReactNode;
  items: ActionMenuItem[];
  onSelect: (id: string) => void;
  /** When set, the menu behaves as a single-choice group and marks the current one. */
  selectedId?: string;
  triggerClassName?: string;
  menuClassName?: string;
  /** Which edge the popover lines up with. */
  align?: "start" | "end";
}

/**
 * Dropdown menu that does not use HeroUI v3 beta's `Dropdown`.
 *
 * That component does not open in this project: clicking the trigger produces no
 * `menu`, `listbox`, `menuitem` or `option` in the accessibility tree — verified
 * against beta.7 on the UUID generator, the code review assistant and the commit
 * generator, both with the documented `Dropdown.Trigger` wrapper and without it.
 * The three tools shipped with a dead control each; `locale-toggle` had already
 * been rewritten by hand for the same reason, so this is that fix extracted once
 * instead of a fourth copy.
 *
 * Keyboard support is the point of writing it out rather than using a plain
 * <select>: Enter/Space/ArrowDown open, Arrow keys move, Home/End jump, Enter
 * picks, Escape closes and returns focus to the trigger, Tab closes. The trigger
 * and every option are plain buttons, so there are no nested interactives for
 * axe-core to flag.
 */
export function ActionMenu({
  label,
  trigger,
  items,
  onSelect,
  selectedId,
  triggerClassName,
  menuClassName,
  align = "end",
}: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();

  const abrir = useCallback(
    (indice: number) => {
      setActiveIndex(indice);
      setOpen(true);
    },
    [],
  );

  const cerrar = useCallback((devolverFoco = true) => {
    setOpen(false);
    if (devolverFoco) triggerRef.current?.focus();
  }, []);

  // Índice inicial: la opción marcada si la hay, si no la primera.
  const indiceInicial = selectedId ? Math.max(0, items.findIndex((i) => i.id === selectedId)) : 0;

  useEffect(() => {
    if (!open) return;
    // El foco entra en la opción activa: sin esto el lector de pantalla se queda
    // en el botón y anuncia el menú como si no hubiera pasado nada.
    itemRefs.current[activeIndex]?.focus();
  }, [open, activeIndex]);

  useEffect(() => {
    if (!open) return;
    const alPuntero = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", alPuntero);
    document.addEventListener("touchstart", alPuntero);
    return () => {
      document.removeEventListener("mousedown", alPuntero);
      document.removeEventListener("touchstart", alPuntero);
    };
  }, [open]);

  const alTeclearEnTrigger = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      abrir(indiceInicial);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      abrir(items.length - 1);
    }
  };

  const alTeclearEnMenu = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % items.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + items.length) % items.length);
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(items.length - 1);
        break;
      case "Escape":
        e.preventDefault();
        cerrar();
        break;
      case "Tab":
        // Tab sale del menú; no se devuelve el foco o se pelearía con el destino.
        cerrar(false);
        break;
      default:
        break;
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => (open ? cerrar(false) : abrir(indiceInicial))}
        onKeyDown={alTeclearEnTrigger}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          triggerClassName,
        )}
      >
        {trigger}
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={label}
          onKeyDown={alTeclearEnMenu}
          className={cn(
            "absolute z-50 mt-2 max-h-72 min-w-52 overflow-auto rounded-lg border border-border bg-background p-1 shadow-lg",
            align === "end" ? "right-0" : "left-0",
            menuClassName,
          )}
        >
          {items.map((item, indice) => {
            const activo = selectedId === item.id;
            return (
              <button
                key={item.id}
                ref={(el) => {
                  itemRefs.current[indice] = el;
                }}
                type="button"
                role={selectedId === undefined ? "menuitem" : "menuitemradio"}
                {...(selectedId === undefined ? {} : { "aria-checked": activo })}
                tabIndex={indice === activeIndex ? 0 : -1}
                onClick={() => {
                  onSelect(item.id);
                  cerrar();
                }}
                onMouseEnter={() => setActiveIndex(indice)}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span className="flex-1">{item.label}</span>
                {activo && <Check className="ml-auto size-4 shrink-0 text-primary" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
