//DOC: https://daisyui.com/components/timeline/
import { tv } from "tailwind-variants";

const timeline = tv({
    slots: {
        base: "timeline",
        start: "timeline-start",
        startBox: "timeline-start timeline-box",
        middle: "timeline-middle",
        middleBox: "timeline-middle timeline-box",
        end: "timeline-end",
        endBox: "timeline-end timeline-box",
    },
    variants: {        
        size: {
            xs: { 
                base: "timeline-xs",
            },
            sm: { 
                base: "timeline-sm",
            },
            md: {
                base: "timeline-md",
            },
            lg: { 
                base: "timeline-lg",
            },
            xl: {
                base: "timeline-xl",
            },
        },
        position: {
            horizontal: {
                base: "timeline-horizontal",
            },
            vertical: {
                base: "timeline-vertical",
            },
        },
        type: {
            snapIcon: {
                base: "timeline-snap-icon",
            },
            compact: {
                base: "timeline-compact",
            },
        },
    }

});

export default timeline;