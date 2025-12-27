//DOC: https://daisyui.com/components/collapse/
import { tv } from "tailwind-variants";

const collapse = tv({
    slots: {
        base: "collapse",
        title: "collapse-title",
        content: "collapse-content",
    },
    variants:{
        decoration: {
            arrow: {
                base: "collapse-arrow",
            },
            plus: {
                base: "collapse-plus",
            },
        },
        open: {
            true: {
                base: "collapse-open",
            },
            false: {
                base: "collapse-closed",
            },
        },
    },
});

export default collapse;