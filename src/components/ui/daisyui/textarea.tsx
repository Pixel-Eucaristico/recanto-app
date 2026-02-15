"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: "primary" | "secondary" | "accent" | "info" | "success" | "warning" | "error" | "ghost";
  size?: "xs" | "sm" | "md" | "lg";
  bordered?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, size = "md", bordered = true, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "textarea",
          bordered && "textarea-bordered",
          variant && `textarea-${variant}`,
          size && `textarea-${size}`,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
