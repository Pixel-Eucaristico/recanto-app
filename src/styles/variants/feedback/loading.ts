// DOCS: https://daisyui.com/components/alert/
import { tv } from "tailwind-variants";

const loading = tv({
    base: "loading",
    variants: {
        style: {
            spinner: "alert-spinner",
            dots: "alert-dots",
            ring: "alert-ring",
            ball: "alert-ball",
            bars: "alert-bars",
            infinity: "alert-infinity",
        },
        size: {
            xs: "loading-xs",
            sm: "loading-sm",
            md: "loading-md",
            lg: "loading-lg",
            xl: "loading-xl",
        },
    },
});

export default loading;