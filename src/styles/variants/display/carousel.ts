// DOC: https://daisyui.com/components/carousel/
import { tv } from "tailwind-variants";

const carousel = tv({
    slots: {
        base: "carousel",
        item: "carousel-item",
    },
    variants: {
        position: {
            start: {
                base: "carousel-start",
            },
            center: {
                base: "carousel-center",
            },
            end: {
                base: "carousel-end",
            },
            horizontal: {
                base: "carousel-horizontal",
            },
            vertical: {
                base: "carousel-vertical",
            },
        },
    },
});

export default carousel;