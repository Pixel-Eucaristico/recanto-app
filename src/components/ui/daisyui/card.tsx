"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "bordered" | "compact" | "side";
  bg?: "base-100" | "base-200" | "base-300";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, bg = "base-100", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "card shadow-sm transition-all duration-200",
          variant === "bordered" && "card-bordered",
          variant === "compact" && "card-compact",
          variant === "side" && "card-side",
          bg && `bg-${bg}`,
          "text-base-content",
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

export const CardBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("card-body p-6", className)} {...props} />
);

export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className={cn("card-title text-xl font-bold", className)} {...props} />
);

export const CardActions = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("card-actions justify-end", className)} {...props} />
);
