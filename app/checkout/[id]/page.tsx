// app/checkout/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Header } from '@/components/header';
import { Card } from '@/components/ui/card';
import { PagamentoHandler } from '../pagamento-handler';
import { getCompra, type ReservaResponse } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Skeleton } from '@/components/ui/skeleton';

export default function CheckoutPage({ params }: { params: { id: string } }) {
  const [reserva, setReserva] = useState<ReservaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [fallback, setFallback] = useState<any | null>(null); // 👈 moveu pra cima

  const { token } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const compraIdFromPath = pathname ? pathname.split('/').filter(Boolean).pop() : undefined;

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    const compraId = compraIdFromPath || params?.id;

    const fetchCompra = async () => {
      try {
        if (!compraId) return;
        const compraData = await getCompra(token, compraId);
        const compra: any = compraData;
        const reservaObj: any = {
          compraId: compra.id || compra.compraId,
          rifaId: compra.rifa?.id || compra.rifaId,
          tituloRifa: compra.rifa?.titulo || compra.tituloRifa || compra.rifa?.nome || "",
          tipoRifa: compra.rifa?.tipo || compra.tipoRifa || compra.tipo || "PAGA_AUTOMATICA",
          quantidadeNumeros: compra.quantidadeNumeros || (compra.numeros ? compra.numeros.length : 0),
          numeros: compra.numeros || [],
          valorTotal: compra.valorTotal || compra.total || 0,
          status: compra.status || "PENDENTE",
          dataExpiracao: compra.pagamento?.dataExpiracao || compra.dataExpiracao,
          minutosParaExpirar: compra.minutosParaExpirar,
          pagamentoManual: compra.pagamentoManual || compra.pagamento_manual,
        };

        if (compra.pagamento) {
          reservaObj.pagamento = {
            id: compra.pagamento.id,
            qrCode: compra.pagamento.qrCode || compra.pagamento.qrCodePayload || compra.pagamento.txid,
            qrCodeBase64: compra.pagamento.qrCodeBase64 || compra.pagamento.qrCode64,
            qrCodePayload: compra.pagamento.qrCodePayload || compra.pagamento.txid || compra.pagamento.qrCode,
            status: compra.pagamento.status || 'AGUARDANDO',
            dataExpiracao: compra.pagamento.dataExpiracao || compra.dataExpiracao,
          };
        }

        setReserva(reservaObj);
      } catch (error) {
        console.error('Erro ao carregar compra:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompra();
  }, [token, router, pathname]);

  // 👇 pode deixar aqui
  useEffect(() => {
    if (!reserva) return;
    try {
      const key = `pagamento_fallback_${reserva.compraId}`;
      const raw = localStorage.getItem(key);
      if (raw) {
        setFallback(JSON.parse(raw));
        localStorage.removeItem(key);
      }
    } catch {}
  }, [reserva]);

  // 👇 retornos só depois de declarar todos os hooks
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
            <h1 className="text-2xl font-bold mb-4">Compra não encontrada</h1>
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
            <h1 className="text-3xl font-bold mb-2">
              {reserva.tipoRifa === 'GRATUITA'
                ? 'Participação Confirmada!'
                : 'Finalize seu Pagamento'}
            </h1>
            <p className="text-muted-foreground">{reserva.tituloRifa}</p>
          </div>

          <PagamentoHandler reserva={{ ...reserva, pagamentoManual: reserva.pagamentoManual || fallback }} />
        </div>
      </main>
    </div>
  );
}
