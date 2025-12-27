//DOC: https://daisyui.com/components/navbar/
import { tv } from "tailwind-variants";

const navbar = tv({
    slots: {
        base: "navbar",
        start: "navbar-start",
        center: "navbar-center",
        end: "navbar-end",
    },
});

export default navbar;
