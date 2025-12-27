//DOC: https://daisyui.com/components/accordion/
import { tv } from "tailwind-variants";

const accordion = tv({
  slots: {
    base: "collapse",
    title: "collapse-title",
    content: "collapse-content",
  },
  variants: {
    modifiers: {
      none: {
        base: "",
      },
      arrow: {
        base: "collapse-arrow",
      },
      plus: {
        base: "collapse-plus",
      },
      open: {
        base: "collapse-open",
      },
      close: {
        base: "collapse-close",
      },
    },
  },
});

export default accordion;
