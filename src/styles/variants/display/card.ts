//DOC: https://daisyui.com/components/card/

import { tv } from "tailwind-variants";


const card = tv({
    slots: {
        base: "card bg-base-100 w-96 shadow-sm",
        title: "card-title",
        body: "card-body",
        actions: "card-actions",
    },
    variants: {
        style:{
            border: {
                base :"card-border",
            },
            dash: {
                base: "card-dash",
            }
        },
        image: {
            side: {
                base: "card-side",
            },
            full: {
                base: "image-full",
            }
        },
        size: {
            sm: "card-sm",
            md: "card-md",
            lg: "card-lg",
            xl: "card-xl",
        },
    },
});

export default card;