// DOCS: https://daisyui.com/components/tooltip/
import { tv } from "tailwind-variants";

const tooltip = tv({
    slots: {
        base: "tooltip",
        content: "tooltip-content",
    },
    variants: {
        placement: {
            top:{
                base: "tooltip-top",
            },
            bottom: {
                base: "tooltip-bottom",
            },
            left: {
                base: "tooltip-left",
            },
            right: {
                base: "tooltip-right",
            },
        },
        open: {
            true: {
                base: "tooltip-open",
            }
        },
        color: {
            neutral: {
                content: "tooltip-neutral",
            },
            primary: {
                content: "tooltip-primary",
            },
            secondary: {
                content: "tooltip-secondary",
            },
            accent: {
                content: "tooltip-accent",
            },
            info: {
                content: "tooltip-info",
            },
            success: {
                content: "tooltip-success",
            },
            warning: {
                content: "tooltip-warning",
            },
            error: {
                content: "tooltip-error",
            },
        }       
    }
});

export default tooltip;