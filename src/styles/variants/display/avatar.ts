// DOCS: https://daisyui.com/components/dropdown/
import { tv } from "tailwind-variants";

const avatar = tv({
    base: "avatar",
    variants: {
        states: {
            none: "", // No specific state
            online: "avatar-online", // shows a green dot as online indicator
            offline: "avatar-offline", // shows a gray dot as offline indicator
            placeholder: "avatar-placeholder", // To show letters as avatar placeholder
        }
    },
});

export default avatar;