// DOCS: https://daisyui.com/components/toast/
import { tv } from "tailwind-variants";

const toast = tv({
    base: "toast",
    variants: {
        position: {
            start: "toast-start",
            end: "toast-end",
            center: "toast-center",
        },
        alignment: {
            top: "toast-top",
            middle: "toast-middle",
            bottom: "toast-bottom",
        },
    }
});

export default toast;