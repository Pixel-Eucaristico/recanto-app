'use client';

import type { ICommand, ExecuteState, TextAreaTextApi } from '@uiw/react-md-editor';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

/**
 * Helper que envolve a seleção (ou cria placeholder) num <div style="text-align:X">.
 */
function makeAlignCommand(align: 'left' | 'center' | 'right'): ICommand {
  const label = align === 'left' ? 'Alinhar à esquerda' : align === 'center' ? 'Centralizar' : 'Alinhar à direita';
  const Icon = align === 'left' ? AlignLeft : align === 'center' ? AlignCenter : AlignRight;

  return {
    name: `align-${align}`,
    keyCommand: `align-${align}`,
    buttonProps: { 'aria-label': label, title: label },
    icon: <Icon size={12} />,
    execute(state: ExecuteState, api: TextAreaTextApi) {
      const open = `\n\n<div style="text-align: ${align}">\n\n`;
      const close = `\n\n</div>\n\n`;
      const selected = state.selectedText || 'Texto alinhado';
      const replacement = `${open}${selected}${close}`;
      api.replaceSelection(replacement);
    },
  };
}

export const alignLeftCommand = makeAlignCommand('left');
export const alignCenterCommand = makeAlignCommand('center');
export const alignRightCommand = makeAlignCommand('right');
