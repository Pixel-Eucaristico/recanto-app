"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface FieldsetProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  size?: "xs" | "sm" | "md" | "lg";
}

export const Fieldset = React.forwardRef<HTMLFieldSetElement, FieldsetProps>(
  ({ className, size = "md", ...props }, ref) => {
    return (
      <fieldset
        ref={ref}
        className={cn("fieldset", size && `fieldset-${size}`, "gap-1", className)}
        {...props}
      />
    );
  }
);
Fieldset.displayName = "Fieldset";

interface FieldsetLegendProps extends React.HTMLAttributes<HTMLLegendElement> {
  size?: "xs" | "sm" | "md" | "lg";
}

export const FieldsetLegend = React.forwardRef<HTMLLegendElement, FieldsetLegendProps>(
  ({ className, size = "md", ...props }, ref) => {
    return (
      <legend
        ref={ref}
        className={cn(
          "fieldset-legend", 
          size && `fieldset-legend-${size}`, 
          "!text-base-content font-medium", // Reforçando a cor com !
          className
        )}
        {...props}
      />
    );
  }
);
FieldsetLegend.displayName = "FieldsetLegend";

interface FieldsetLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  size?: "xs" | "sm" | "md" | "lg";
}

export const FieldsetLabel = React.forwardRef<HTMLLabelElement, FieldsetLabelProps>(
  ({ className, size = "md", ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "fieldset-label", 
          size && `fieldset-label-${size}`, 
          "!text-base-content/60 italic", // Reforçando a cor secundária com !
          className
        )}
        {...props}
      />
    );
  }
);
FieldsetLabel.displayName = "FieldsetLabel";
