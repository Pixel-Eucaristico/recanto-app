//DOC: https://daisyui.com/components/status/
import { tv } from "tailwind-variants";

const status = tv({
    base: "status",
    variants: {
        color: {
            neutral: "status-neutral",
            primary: "status-primary",
            secondary: "status-secondary",
            accent: "status-accent",
            info: "status-info",
            success: "status-success",
            warning: "status-warning",
            error: "status-error",
        },
        size: {
            xs: "status-xs",
            sm: "status-sm",
            md: "status-md",
            lg: "status-lg",
            xl: "status-xl",
        },
    },
});

export default status;