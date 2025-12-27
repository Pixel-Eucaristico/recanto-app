// DOCS: https://daisyui.com/components/button/

import { tv } from 'tailwind-variants';

const button = tv({
  slots: {
    base: "btn",
    themeController: "theme-controller",
  },
  variants: {
    size: {
      xs: {
        base: "btn-xs",
      },
      sm: {
        base: "btn-sm",
      },
      md: {
        base: "",
      },
      lg: {
        base: "btn-lg",
      },
      xl: {
        base: "btn-xl",
      },
    },
    color: {
      neutral: {
        base: "btn-neutral",
      },
      primary: {
        base: "btn-primary",
      },
      secondary: {
        base: "btn-secondary",
      },
      accent: {
        base: "btn-accent",
      },
      info: {
        base: "btn-info",
      },
      success: {
        base: "btn-success",
      },
      warning: {
        base: "btn-warning",
      },
      error: {
        base: "btn-error",
      },
    },
    style: {
      soft: {
        base: "btn-soft",
      },
      outline: {
        base: "btn-outline",
      },
      dash: {
        base: "btn-dash",
      },
      ghost: {
        base: "btn-ghost",
      },
      link: {
        base: "btn-link",
      },
    },
    behavior: {
      active: {
        base: "btn-active",
      },
      disabled: {
        base: "btn-disabled",
      },
    },
    modifier: {
      wide: {
        base: "btn-wide",
      },
      block: {
        base: "btn-block",
      },
      square: {
        base: "btn-square",
      },
      circle: {
        base: "btn-circle",
      },
    },
  },
});

export default button;