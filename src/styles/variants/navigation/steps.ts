//DOC: https://daisyui.com/components/steps/
import { tv } from "tailwind-variants";

const steps = tv({
  slots: {
    base: "steps",
    step: "step",
    icon: "step-icon",
  },
  variants: {
    color: {
        neutral: {
            base: "step-neutral",
        },
        primary: {
            base: "step-primary",
        },
        secondary: {
            base: "step-secondary",
        },
        accent: {
            base: "step-accent",
        },
        info: {
            base: "step-info",
        },
        success: {
            base: "step-success",
        },
        warning: {
            base: "step-warning",
        },
        error: {
            base: "step-error",
        },
    },
    direction: {
        horizontal: {
            base: "steps-horizontal",
        },
        vertical: {
            base: "steps-vertical",
        }
    }
  },
});

export default steps;
