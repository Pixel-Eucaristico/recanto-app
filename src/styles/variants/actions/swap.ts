// DOCS: https://daisyui.com/components/dropdown/

import { tv } from 'tailwind-variants';

const swap = tv({
  slots: {
    base: 'swap',
    themeController: 'theme-controller',
    on: 'swap-on',
    off: 'swap-off',
    indeterminate: 'swap-indeterminate',
  },
  variants: {
    style: {
      default: {
        base: '',
      },
      rotate: {
        base: 'swap-rotate',
      },
      flip: {
        base: 'swap-flip',
      }
    },
    active: {
      true: {
        base: 'swap-active',
      },
    }
  },
});

export default swap;