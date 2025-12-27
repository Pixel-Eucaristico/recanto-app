import ThemeController from '@/components/ui/daisyui/theme-controller/theme';

export function SidebarThemeToggle() {
  return (
    <li className="relative z-50">
      <button
        className="is-drawer-close:tooltip is-drawer-close:tooltip-right"
        data-tip="Alterar tema"
      >
        <ThemeController />
        <span className="is-drawer-close:hidden">Alterar Tema</span>
      </button>
    </li>
  );
}
