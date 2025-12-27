//DOC: https://daisyui.com/components/link/
import { tv } from "tailwind-variants";

const link = tv({
    base: "link",
    variants: {
        color: {
            info: "link-info",
            primary: "link-primary",
            secondary: "link-secondary",
            accent: "link-accent",
            neutral: "link-neutral",
            success: "link-success",
            warning: "link-warning",
            error: "link-error"
        },
        hover: {
            true: "link-hover",
        }
    }
});

export default link;
