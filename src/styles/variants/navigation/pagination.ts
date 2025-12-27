//DOC: https://daisyui.com/components/pagination/
import { tv } from "tailwind-variants";

const pagination = tv({
  slots: {
    base: "join",
    item: "join-item",
  },
  variants: {
    direction: {
      horizontal: "join-horizontal",
      vertical: "join-vertical",
    },
  },
});

export default pagination;
