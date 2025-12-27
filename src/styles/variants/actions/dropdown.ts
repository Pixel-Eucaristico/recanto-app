// DOCS: https://daisyui.com/components/dropdown/

import { tv } from 'tailwind-variants';

const dropdown = tv({
    slots: {
        base: 'dropdown',
        content: 'dropdown-content',
    },
    variants: {
        position: {
            top: {
                base: 'dropdown-top',
            },
            bottom: {
                base: 'dropdown-bottom',
            },
            left: {
                base: 'dropdown-left',
            },
            right: {
                base: 'dropdown-right'
            },
        },
        alignment: {
            start: {
                base: 'dropdown-start',
            },
            end: {
                base: 'dropdown-end',
            },
            center: {
                base: '',
            }, 
        },
        trigger: {
            hover: 'dropdown-hover',
            open: 'dropdown-open',
            default: '', // nenhum modificador
        },
    }
});

export default dropdown;
