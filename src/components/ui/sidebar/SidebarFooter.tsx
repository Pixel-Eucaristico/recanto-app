import { ReactNode } from 'react';

interface SidebarFooterProps {
  children: ReactNode;
}

export function SidebarFooter({ children }: SidebarFooterProps) {
  return (
    <div className="w-full border-t border-base-300">
      {children}
    </div>
  );
}

interface SidebarQuoteProps {
  quote: string;
  author: string;
}

export function SidebarQuote({ quote, author }: SidebarQuoteProps) {
  return (
    <div className="text-center p-3 m-2 bg-base-300 rounded-lg is-drawer-close:hidden">
      <p className="text-xs text-base-content/60 italic">{quote}</p>
      <p className="text-xs text-base-content/40 font-semibold mt-1">{author}</p>
    </div>
  );
}

interface SidebarMenuProps {
  children: ReactNode;
}

export function SidebarMenu({ children }: SidebarMenuProps) {
  return <ul className="menu p-2">{children}</ul>;
}
