// DOCS: https://daisyui.com/components/button/

import { tv } from 'tailwind-variants';

const border = tv({
    variants: {
        radius: {
            box: 'rounded-box',
            field: 'rounded-field',
            selector: 'rounded-selector',
        },
    },
});

export default border;