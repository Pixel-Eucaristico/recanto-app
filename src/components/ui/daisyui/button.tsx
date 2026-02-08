"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "info" | "success" | "warning" | "error" | "ghost" | "link" | "outline";
  size?: "xs" | "sm" | "md" | "lg";
  circle?: boolean;
  square?: boolean;
  wide?: boolean;
  block?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size = "md", circle, square, wide, block, loading, children, ...props }, ref) => {
    return (
      <button
        className={cn(
          "btn",
          variant && `btn-${variant}`,
          size && `btn-${size}`,
          circle && "btn-circle",
          square && "btn-square",
          wide && "btn-wide",
          block && "btn-block",
          className
        )}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && <span className="loading loading-spinner"></span>}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
