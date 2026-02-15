"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  variant?: "primary" | "secondary" | "accent" | "info" | "success" | "warning" | "error" | "ghost";
  size?: "xs" | "sm" | "md" | "lg";
  bordered?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  variant?: "primary" | "secondary" | "accent" | "info" | "success" | "warning" | "error" | "ghost";
  size?: "xs" | "sm" | "md" | "lg";
  bordered?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size = "md", bordered = true, ...props }, ref) => {
    return (
      <input
        className={cn(
          "input",
          bordered && "input-bordered",
          variant && `input-${variant}`,
          size && `input-${size}`,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
