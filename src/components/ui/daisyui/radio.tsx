"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  variant?: "primary" | "secondary" | "accent" | "info" | "success" | "warning" | "error";
  size?: "xs" | "sm" | "md" | "lg";
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, variant, size = "md", ...props }, ref) => {
    return (
      <input
        type="radio"
        className={cn(
          "radio",
          variant && `radio-${variant}`,
          size && `radio-${size}`,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Radio.displayName = "Radio";

export { Radio };
