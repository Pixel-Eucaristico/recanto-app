//DOC: https://daisyui.com/components/kbd/
import { tv } from "tailwind-variants";

const kbd = tv({
    base: "kbd",
    variants: {
        size: {
            xs: "kbd-xs",
            sm: "kbd-sm",
            md: "kbd-md",
            lg: "kbd-lg",
            xl: "kbd-xl",
        },
    },
});

export default kbd;
