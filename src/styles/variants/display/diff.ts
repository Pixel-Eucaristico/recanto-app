//DOC: https://daisyui.com/components/diff/
import { tv } from "tailwind-variants";

const diff = tv({
    slots: {
        base: "diff",
        item1: "diff-item-1",
        item2: "diff-item-2",
        resizer: "diff-resizer",
    },
});

export default diff;