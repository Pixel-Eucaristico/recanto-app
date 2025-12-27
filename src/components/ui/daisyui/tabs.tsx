"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  variant?: "bordered" | "lifted" | "boxed";
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

const TabsContext = React.createContext<{
  currentValue: string;
  onChange: (value: string) => void;
  variant?: string;
  size?: string;
}>({ currentValue: "", onChange: () => {} });

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  variant = "bordered",
  size = "md",
  className,
}: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "");

  const currentValue = value !== undefined ? value : internalValue;
  const onChange = (newValue: string) => {
    setInternalValue(newValue);
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ currentValue, onChange, variant, size }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }: TabsListProps) {
  const { variant, size } = React.useContext(TabsContext);

  const variantClass = {
    bordered: "tabs-bordered",
    lifted: "tabs-lifted",
    boxed: "tabs-boxed",
  }[variant || "bordered"];

  const sizeClass = {
    xs: "tabs-xs",
    sm: "tabs-sm",
    md: "tabs-md",
    lg: "tabs-lg",
  }[size || "md"];

  // DaisyUI tabs usually need 'tabs' class. 
  // If 'tabs-boxed', background is needed.
  
  return (
    <div
      role="tablist"
      className={cn("tabs", variantClass, sizeClass, className)}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className,
  disabled,
  onClick,
}: TabsTriggerProps) {
  const { currentValue, onChange } = React.useContext(TabsContext);
  const isActive = currentValue === value;

  return (
    <a
      role="tab"
      className={cn(
        "tab",
        isActive && "tab-active",
        disabled && "tab-disabled cursor-not-allowed opacity-50",
        className
      )}
      onClick={() => {
        if (!disabled) {
          onChange(value);
          onClick?.();
        }
      }}
      aria-selected={isActive}
    >
      {children}
    </a>
  );
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const { currentValue, variant } = React.useContext(TabsContext); // Added variant to context usage if needed later

  if (currentValue !== value) return null;

  // For 'lifted' tabs in DaisyUI, the content is sometimes integrated differently in HTML,
  // but for a React component, keeping it separate is fine.
  // We add a subtle border or padding if desired, but shadcn usually leaves this bare.
  // Let's add some default padding or base style if typical for DaisyUI panels.
  // Usually DaisyUI tab content is just a div below the tabs.

  return (
    <div
      role="tabpanel"
      className={cn(
        "mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
    >
      {children}
    </div>
  );
}
