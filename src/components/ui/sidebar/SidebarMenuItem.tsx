import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface SidebarMenuItemProps {
  icon: LucideIcon;
  label: string;
  href?: string;
  onClick?: () => void;
  tooltip?: string;
}

export function SidebarMenuItem({
  icon: Icon,
  label,
  href,
  onClick,
  tooltip
}: SidebarMenuItemProps) {
  const content = (
    <>
      <Icon className="w-5 h-5 shrink-0" />
      <span className="is-drawer-close:hidden whitespace-nowrap">{label}</span>
    </>
  );

  const className = "is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center gap-3 w-full text-left";
  const dataTip = tooltip || label;

  if (href) {
    return (
      <li className="w-full">
        <Link href={href} className={className} data-tip={dataTip}>
          {content}
        </Link>
      </li>
    );
  }

  return (
    <li className="w-full">
      <button type="button" onClick={onClick} className={className} data-tip={dataTip}>
        {content}
      </button>
    </li>
  );
}
