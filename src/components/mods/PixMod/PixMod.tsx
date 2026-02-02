
'use client';

import PixDisplay from '@/components/shared/PixDisplay';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';

interface PixModProps {
  pixKey: string;
  name: string;
  city: string;
  amount?: string;
  description?: string;
  title?: string;
}

export default function PixMod({ pixKey, name, city, amount, description, title }: PixModProps) {
  // Fallback for visual editor or empty state
  if (!pixKey) {
    return (
      <div className="p-8 text-center bg-base-200 rounded-lg border border-dashed border-base-content/20">
        <p className="opacity-60">Configure o Bloco Pix no editor</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto py-8">
      {title && (
        <h2 className="text-2xl font-bold text-center mb-6">
          <MarkdownRenderer content={title} />
        </h2>
      )}
      <PixDisplay 
        pixKey={pixKey}
        merchantName={name}
        merchantCity={city}
        amount={amount}
        description={description}
      />
    </div>
  );
}
