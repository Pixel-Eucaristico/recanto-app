// DOCS: https://daisyui.com/components/dropdown/

import { tv } from 'tailwind-variants';

const modal = tv({
    slots: {
        base: "modal",
        box: "modal-box",
        action: "modal-action",
        backdrop: "modal-backdrop",
        toggle: "modal-toggle"
    },
    variants: {
        position: {
            top: {
                base: 'modal-top'
            },
            middle: {
                base: 'modal-middle'
            },
            bottom: {
                base: 'modal-bottom'
            },
            start: {
                base: 'modal-start'
            },
            end: {
                base: 'modal-end'
            },
        },
        open: {
            true: {
                base: 'modal-open',
            },

        }
    },
});

export default modal;