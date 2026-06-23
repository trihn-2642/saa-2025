"use client";

import {
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { cva, type VariantProps } from "class-variance-authority";

import IcDown from "@icons/ic-down.svg";
import IcRight from "@icons/ic-right.svg";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/cn";

/**
 * Dropdown family (from the Figma "Dropdown-List" component):
 *   - Dropdown       — the menu surface (presentational)
 *   - DropdownItem   — a single menu item
 *   - DropdownSub    — an item that opens a nested flyout submenu
 *   - DropdownSelect — a full select (trigger + open/close + selection)
 */

// ── Surface ──────────────────────────────────────────────────────────────────
export function Dropdown({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="menu"
      className={cn(
        "custom-scrollbar flex max-h-87.5 flex-col overflow-y-auto rounded-lg border border-primary-dark-hover bg-details-overlay p-1.5",
        className,
      )}
      {...props}
    />
  );
}

// ── Item ─────────────────────────────────────────────────────────────────────
const itemVariants = cva(
  "flex w-full cursor-pointer items-center gap-1 rounded-[4px] px-4 py-4 text-left text-base font-bold whitespace-nowrap text-white transition-colors hover:bg-button-hover disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      selected: {
        true: "bg-button-hover [text-shadow:0_0_6px_var(--button-glow)]",
        false: "",
      },
    },
    defaultVariants: { selected: false },
  },
);

export interface DropdownItemProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof itemVariants> {
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

export function DropdownItem({
  selected,
  iconLeft,
  iconRight,
  className,
  children,
  ...props
}: DropdownItemProps) {
  return (
    <button
      role="menuitem"
      className={cn(itemVariants({ selected }), className)}
      {...props}
    >
      {iconLeft}
      <span className="flex-1">{children}</span>
      {iconRight}
    </button>
  );
}

// ── Submenu (flyout) ──────────────────────────────────────────────────────────
export interface DropdownSubProps {
  label: ReactNode;
  iconLeft?: ReactNode;
  /** Preferred flyout side; auto-flips when there isn't room. */
  side?: "right" | "left";
  children: ReactNode;
  className?: string;
}

export function DropdownSub({
  label,
  iconLeft,
  side = "right",
  children,
  className,
}: DropdownSubProps) {
  const [open, setOpen] = useState(false);
  const [resolvedSide, setResolvedSide] = useState<"right" | "left">(side);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const toggle = () => {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceRight = window.innerWidth - rect.right;
      setResolvedSide(
        spaceRight < 180 && rect.left > spaceRight ? "left" : "right",
      );
    }
    setOpen((o) => !o);
  };

  return (
    <div ref={ref} className="relative">
      <DropdownItem
        aria-haspopup="menu"
        aria-expanded={open}
        selected={open}
        iconLeft={iconLeft}
        iconRight={
          <IcRight
            className={cn(
              "transition-transform",
              resolvedSide === "left" && "rotate-180",
            )}
          />
        }
        onClick={toggle}
        className={className}
      >
        {label}
      </DropdownItem>

      {open && (
        // -top-1.5 cancels the parent panel padding so the first submenu item
        // lines up with this item; mx-2 keeps a clear gap from the panel edge.
        <Dropdown
          className={cn(
            "absolute -top-1.5 z-50 min-w-40",
            resolvedSide === "right" ? "left-full ml-2" : "right-full mr-2",
          )}
        >
          {children}
        </Dropdown>
      )}
    </div>
  );
}

// ── Select (trigger + selection) ──────────────────────────────────────────────
export interface DropdownOption {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  /** Nested options render as a flyout submenu. */
  children?: DropdownOption[];
}

export interface DropdownSelectProps {
  options: DropdownOption[];
  /** Controlled value. Omit for uncontrolled (use `defaultValue`). */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: ReactNode;
  /** Trigger button style (default "secondary"). */
  triggerVariant?: NonNullable<ButtonProps["variant"]>;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
}

function findOption(
  options: DropdownOption[],
  value: string | undefined,
): DropdownOption | undefined {
  if (value === undefined) return undefined;
  for (const o of options) {
    if (o.value === value) return o;
    const inner = o.children && findOption(o.children, value);
    if (inner) return inner;
  }
  return undefined;
}

export function DropdownSelect({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Select…",
  triggerVariant = "secondary",
  className,
  buttonClassName,
  menuClassName,
}: DropdownSelectProps) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<"bottom" | "top">("bottom");
  const [internal, setInternal] = useState(defaultValue);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selectedValue = value !== undefined ? value : internal;
  const selected = findOption(options, selectedValue);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const toggle = () => {
    if (!open && rootRef.current) {
      const rect = rootRef.current.getBoundingClientRect();
      const estimatedHeight = options.length * 56 + 12;
      const spaceBelow = window.innerHeight - rect.bottom;
      setPlacement(
        spaceBelow < estimatedHeight + 8 && rect.top > spaceBelow
          ? "top"
          : "bottom",
      );
    }
    setOpen((o) => !o);
  };

  const choose = (next: string) => {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={cn("relative inline-block", className)}>
      <Button
        type="button"
        variant={triggerVariant}
        className={cn("font-bold", buttonClassName)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        iconLeft={selected?.icon}
        iconRight={
          <IcDown
            className={cn("transition-transform", open && "rotate-180")}
          />
        }
        onClick={toggle}
      >
        {selected?.label ?? placeholder}
      </Button>

      {open && (
        <Dropdown
          id={listId}
          role="listbox"
          className={cn(
            "absolute left-0 z-50 min-w-full",
            placement === "bottom" ? "top-full mt-2" : "bottom-full mb-2",
            menuClassName,
          )}
        >
          {options.map((o) =>
            o.children ? (
              <DropdownSub key={o.value} label={o.label} iconLeft={o.icon}>
                {o.children.map((c) => (
                  <DropdownItem
                    key={c.value}
                    role="option"
                    aria-selected={c.value === selectedValue}
                    selected={c.value === selectedValue}
                    disabled={c.disabled}
                    iconLeft={c.icon}
                    onClick={() => choose(c.value)}
                  >
                    {c.label}
                  </DropdownItem>
                ))}
              </DropdownSub>
            ) : (
              <DropdownItem
                key={o.value}
                role="option"
                aria-selected={o.value === selectedValue}
                selected={o.value === selectedValue}
                disabled={o.disabled}
                iconLeft={o.icon}
                onClick={() => choose(o.value)}
              >
                {o.label}
              </DropdownItem>
            ),
          )}
        </Dropdown>
      )}
    </div>
  );
}
