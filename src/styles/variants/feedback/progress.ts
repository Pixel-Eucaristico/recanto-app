// DOCS: https://daisyui.com/components/progress/
import { tv } from "tailwind-variants";

const progress = tv({
    base: "progress",
    variants: {
        color: {
            neutral: "progress-neutral",
            primary: "progress-primary",
            secondary: "progress-secondary",
            accent: "progress-accent",
            info: "progress-info",
            success: "progress-success",
            warning: "progress-warning",
            error: "progress-error",
        },
    },
});

export default progress;