// DOCS: https://daisyui.com/components/alert/
import { tv } from "tailwind-variants";

const alert = tv({
    base: "alert",
    variants: {
        style: {
            outline: "alert-outline",
            dash: "alert-dash",
            soft: "alert-soft",
        },
        color: {
            info: "alert-info",
            success: "alert-success",
            warning: "alert-warning",
            error: "alert-error",
        },
        direction: {
            horizontal: "alert-horizontal", // Aligns the alert content horizontally
            vertical: "alert-vertical", // Aligns the alert content vertically
        },
    },
});

export default alert;