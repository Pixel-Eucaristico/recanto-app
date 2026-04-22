'use client';

import { RichContent } from '@/shared/components/RichContent';
import { FlipCard } from '@/shared/components/FlipCard';

interface FlashcardViewProps {
  front: string;
  back: string;
  imageUrl?: string;
  imageUrlBack?: string;
  resetKey?: string;
}

/**
 * Face de flashcard de estudo — embala `FlipCard` com `RichContent` (markdown).
 * Toda a lógica de flip/3D/aspect vive em `@/shared/components/FlipCard`.
 */
export function FlashcardView({ front, back, imageUrl, imageUrlBack, resetKey }: FlashcardViewProps) {
  return (
    <FlipCard
      frontTitle="Frente"
      backTitle="Verso"
      frontContent={front?.trim() ? <RichContent markdown={front} /> : undefined}
      backContent={back?.trim() ? <RichContent markdown={back} /> : undefined}
      frontImageUrl={imageUrl}
      backImageUrl={imageUrlBack}
      resetKey={resetKey}
    />
  );
}
