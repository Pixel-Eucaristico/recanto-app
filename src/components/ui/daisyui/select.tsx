"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  variant?: "primary" | "secondary" | "accent" | "info" | "success" | "warning" | "error" | "ghost";
  size?: "xs" | "sm" | "md" | "lg";
  bordered?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, variant, size = "md", bordered = true, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "select",
          bordered && "select-bordered",
          variant && `select-${variant}`,
          size && `select-${size}`,
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";

export { Select };
