//DOC: https://daisyui.com/components/link/
import { tv } from "tailwind-variants";

const menu = tv({
    slots: {
        base: "menu",
        label: "menu-title",
        dropdown: "menu-dropdown",
        toggle: "menu-dropdown-toggle",
    },
    variants: {
        status:{
            disable: {
                base: "menu-disabled",
            },
            active: {
                base: "menu-active",
            },
            focus: {
                base: "menu-focus",
            },
            show: {
                dropdown: "menu-dropdown-show",
            }
        },
        size: {
            xs: "menu-xs",
            sm: "menu-sm",
            md: "menu-md",
            lg: "menu-lg",
            xl: "menu-xl",
        },
        direction: {
            horizontal: "menu-horizontal",
            vertical: "menu-vertical",
        },
    }
});

export default menu;
