'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, ArrowRight } from 'lucide-react';

/**
 * Placeholder — implementação real virá com integração Firebase Events.
 * Componente referenciado mas não montado em runtime (uso comentado).
 */
export default function UpcomingEvents() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base-content">
          <Calendar className="w-5 h-5" />
          Próximos Compromissos
        </CardTitle>
        <Link
          href="/app/dashboard/schedule"
          className="text-sm text-info hover:underline flex items-center gap-1"
        >
          Ver agenda <ArrowRight className="w-4 h-4" />
        </Link>
      </CardHeader>
      <CardContent>
        <p className="text-center text-base-content/60 py-4">Em breve.</p>
      </CardContent>
    </Card>
  );
}
