//DOC: https://daisyui.com/components/table/
import { tv } from "tailwind-variants";

const table = tv({
    slots: {
        base: "table",
        zebra: "table-zebra",
        pinRows: "table-pin-rows",
        pinCols: "table-pin-cols",
    },
    variants: {
        size: {
            xs: { 
                base: "table-xs",
            },
            sm: { 
                base: "table-sm",
            },
            md: {
                base: "table-md",
            },
            lg: { 
                base: "table-lg",
            },
            xl: {
                base: "table-xl",
            },
        },
    },
});

export default table;