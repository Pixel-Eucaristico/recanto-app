//DOC: https://daisyui.com/components/chat/
import { tv } from "tailwind-variants";

const chat = tv({
    slots: {
        base: "chat",
        image: "chat-image",
        header: "chat-header",
        footer: "chat-footer",
        buble: "chat-bubble",
    },
    variants: {
        position: {
            start: {
                base: "chat-start",
            },
            end: {
                base: "chat-end",
            },
        },
        color: {
            primary: {
                buble: "chat-primary",
            },
            secondary: {
                buble: "chat-secondary",
            },
            accent: {
                buble: "chat-accent",
            },
            info: {
                buble: "chat-info",
            },
            success: {
                buble: "chat-success",
            },
            warning: {
                buble: "chat-warning",
            },
            error: {
                buble: "chat-error",
            },
        },
    },

});

export default chat;