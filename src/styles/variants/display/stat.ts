//DOC: https://daisyui.com/components/stat/
import { tv } from "tailwind-variants";

const stat = tv({
    slots: {
        base: "stats",
        stat: "stat",
        title: "stat-title",
        value: "stat-value",
        desc: "stat-desc",
        figure: "stat-figure",
        actions: "stat-actions",
    },
    variants: {
        layout: {
            horizontal: {
                base: "stats-horizontal",
            },
            vertical: {
                base: "stats-vertical",
            },
        },
    },
});

export default stat;