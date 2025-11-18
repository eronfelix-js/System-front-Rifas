// app/checkout/pagamento-manual/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Header } from '@/components/header';
import { Card } from '@/components/ui/card';
import { PagamentoManual } from '@/app/checkout/pagamento-manual';
import { type ReservaResponse } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Skeleton } from '@/components/ui/skeleton';

export default function PagamentoManualPage({ params }: { params: { id: string } }) {
  const [reserva, setReserva] = useState<ReservaResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const { token } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Unwrap params se for Promise
  // @ts-ignore
  const resolvedParams = typeof (React as any).use === 'function' ? (React as any).use(params) : params;
  const compraId = resolvedParams?.id || (pathname ? pathname.split('/').filter(Boolean).pop() : undefined);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    if (!compraId) {
      setLoading(false);
      return;
    }

    try {
      const key = `reserva_manual_${compraId}`;
      const raw = localStorage.getItem(key);

      if (raw) {
        const reservaData = JSON.parse(raw) as ReservaResponse;
        console.debug('[v0] Reserva PAGA_MANUAL recuperada do localStorage:', reservaData);
        setReserva(reservaData);
        // Remove do localStorage após uso
        localStorage.removeItem(key);
      } else {
        console.warn('[v0] Reserva PAGA_MANUAL não encontrada no localStorage');
      }
    } catch (error) {
      console.error('[v0] Erro ao recuperar reserva manual:', error);
    } finally {
      setLoading(false);
    }
  }, [token, router, compraId]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (!reserva) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Dados de pagamento não encontrados</h1>
            <p className="text-muted-foreground mb-6">
              Não conseguimos localizar os dados da sua compra. Tente novamente.
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Voltar para Início
            </button>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Pagamento Manual</h1>
            <p className="text-muted-foreground">{reserva.tituloRifa}</p>
          </div>

          <PagamentoManual reserva={reserva} />
        </div>
      </main>
    </div>
  );
}
