//DOC: https://daisyui.com/components/dock/
import { tv } from "tailwind-variants";

const dock = tv({
    slots: {
        base: "dock",
        label: "dock-label",
        active: "dock-active",
    },
    variants: {
        size: {
            xs: {
                base: "dock-xs",
            },
            sm: {
                base: "dock-sm",
            },
            md: {
                base: "dock-md",
            },
            lg: {
                base: "dock-lg",
            },
            xl: {
                base: "dock-xl",
            },
        },
    }
});

export default dock;
