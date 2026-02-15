"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  variant?: "primary" | "secondary" | "accent" | "info" | "success" | "warning" | "error";
  size?: "xs" | "sm" | "md" | "lg";
}

const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(
  ({ className, variant, size = "md", ...props }, ref) => {
    return (
      <input
        type="checkbox"
        className={cn(
          "toggle",
          variant && `toggle-${variant}`,
          size && `toggle-${size}`,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Toggle.displayName = "Toggle";

export { Toggle };
