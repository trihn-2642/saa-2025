import { type VariantProps, cva } from "class-variance-authority";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Button — design-system button from the Figma "Button" component set.
 *
 * Type: primary | secondary | text | icon. States: hover/disabled (CSS) and
 * `selected` (text/icon accent). Exact Figma values: radius 4px, padding 16px
 * (icon 10px), gap 8px (text 4px), Montserrat 500/16px, hover glow. Colors come
 * from the design tokens in globals.css.
 *
 * Icons (`iconLeft`/`iconRight`, or `children` for the icon variant) inherit the
 * text color when authored as inline SVG with `fill="currentColor"`.
 */
const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center rounded-[4px] text-base font-medium transition-colors disabled:cursor-not-allowed disabled:border-transparent disabled:bg-neutral-dark disabled:text-text-primary-2 disabled:shadow-none disabled:hover:bg-neutral-dark [&_img]:size-5 [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "gap-2 bg-primary-normal px-4 py-4 text-text-primary-2 hover:bg-primary-light-active hover:shadow-button-glow",
        secondary:
          "gap-2 border border-primary-dark-hover bg-button-hover px-4 py-4 text-white hover:bg-button-hover-strong hover:shadow-button-glow",
        // Glow sits on the content: text-shadow on the label, drop-shadow on the icon.
        text: "gap-1 px-4 py-4 hover:bg-button-hover hover:text-shadow-glow",
        icon: "size-10 p-2.5 hover:bg-button-hover hover:drop-shadow-glow",
      },
      selected: { true: "", false: "" },
    },
    // Text/icon color toggles with `selected` (one color class at a time).
    compoundVariants: [
      { variant: "text", selected: false, class: "text-white" },
      {
        variant: "text",
        selected: true,
        class:
          "rounded-none border-b border-primary-normal text-primary-normal hover:bg-transparent",
      },
      { variant: "icon", selected: false, class: "text-white" },
      {
        variant: "icon",
        selected: true,
        class: "text-primary-normal hover:bg-transparent",
      },
    ],
    defaultVariants: { variant: "primary", selected: false },
  },
);

export interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

export function Button({
  variant,
  selected,
  iconLeft,
  iconRight,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, selected }), className)}
      {...props}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}
