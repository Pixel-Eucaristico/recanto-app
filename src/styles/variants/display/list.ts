//DOC: https://daisyui.com/components/list/
import { tv } from "tailwind-variants";

const list = tv({
    slots: {
        base: "list",
        row: "list-row",
        colWrap: "list-col-wrap",
        colGrow: "list-col-grow",
    },
});


export default list;
