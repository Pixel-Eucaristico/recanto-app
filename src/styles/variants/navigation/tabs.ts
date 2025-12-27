//DOC: https://daisyui.com/components/tabs/
import { tv } from "tailwind-variants";

const tabs = tv({
  slots: {
    base: "tabs",
    tab: "tab",
    active: "tab tab-active",
    disable: "tab tab-disabled",
    content: "tab-content",
  },
  variants: {
    style: {
        box: {
            base: "tabs-box",
        },
        border: {
            base: "tabs-border",
        },
        lift: {
            base: "tabs-lift",
        }
    },
    placement: {
      top: {
        base: "tabs-top",
      },
      bottom: {
        base: "tabs-bottom",
      },
    },
    size: {
        xs: {
            base: "tabs-xs",
        },
        sm: {
            base: "tabs-sm",
        },
        md: {
            base: "tabs-md",
        },
        lg: {
            base: "tabs-lg",
        },
        xl: {
            base: "tabs-xl",
        },
    }
  },
});

export default tabs;
