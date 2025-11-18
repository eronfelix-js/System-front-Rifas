// app/checkout/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Header } from '@/components/header';
import { Card } from '@/components/ui/card';
import { PagamentoHandler } from '../pagamento-handler';
import { getCompra, type ReservaResponse, FallbackPagamentoResponse } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Skeleton } from '@/components/ui/skeleton';


export default function CheckoutPage({ params }: { params: { id: string } }) {
  const [reserva, setReserva] = useState<ReservaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [fallback, setFallback] = useState<FallbackPagamentoResponse | null>(null);

  const { token } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const compraIdFromPath = pathname ? pathname.split('/').filter(Boolean).pop() : undefined;
  // Next.js may provide `params` as a Promise — unwrap with React.use()
  // React.use is used by Next to unwrap async values passed into client components
  // Fallback to the raw params object if React.use is not available.
  // @ts-ignore
  const resolvedParams = typeof (React as any).use === 'function' ? (React as any).use(params) : params;

  // ✅ Busca dados da compra
  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    const compraId = compraIdFromPath || resolvedParams?.id;
    if (!compraId) return;

    const fetchCompra = async () => {
      try {
        console.debug('[v0] Buscando compra:', compraId)
        const compraData = await getCompra(token, compraId);
        console.debug('[v0] Dados da compra recebidos:', compraData)

        // Defensive normalization: backend may return different shapes
        const raw: any = compraData

        const rifaId = raw?.rifa?.id || raw?.rifaId || raw?.rifa_id || ''
        const tituloRifa = raw?.rifa?.titulo || raw?.tituloRifa || raw?.rifaTitulo || ''
        // Determine tipoRifa: prefer explicit fields, otherwise infer GRATUITA when valorTotal is 0
        const tipoRifa = raw?.rifa?.tipo || raw?.tipoRifa || raw?.tipo || (Number(raw?.valorTotal) === 0 ? 'GRATUITA' : 'PAGA_AUTOMATICA')
        const numerosArr: number[] = Array.isArray(raw?.numeros) ? raw.numeros : Array.isArray(raw?.itens) ? raw.itens : []

        const reservaObj: ReservaResponse = {
          compraId: String(raw?.id || raw?.compraId || ''),
          rifaId: String(rifaId || ''),
          tituloRifa: String(tituloRifa || ''),
          tipoRifa: tipoRifa as ReservaResponse['tipoRifa'],
          quantidadeNumeros: numerosArr.length || Number(raw?.quantidadeNumeros) || 0,
          numeros: numerosArr || [],
          valorTotal: Number(raw?.valorTotal ?? raw?.valor ?? 0),
          status: raw?.status || 'PENDENTE',

          pagamento: raw?.pagamento ? {
            id: raw.pagamento.id || raw.pagamento.txid || '',
            qrCode: raw.pagamento.qrCodeBase64 || raw.pagamento.qrCode || '',
            qrCodePayload: raw.pagamento.txid || raw.pagamento.qrCode || '',
            status: raw.pagamento.status || 'AGUARDANDO',
            dataExpiracao: raw.pagamento.dataExpiracao || raw.dataExpiracao || ''
          } : undefined,
        }

        if (!raw?.rifa) {
          console.warn('[v0] compraData.rifa está indefinido — usando fallbacks. compraData:', raw)
        }

        setReserva(reservaObj);
      } catch (error) {
        console.error('[v0] Erro ao carregar compra:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompra();
  }, [token, router, pathname, resolvedParams?.id]);

  // ✅ Carrega fallback do localStorage
  useEffect(() => {
    if (!reserva) return;
    
    try {
      const key = `pagamento_fallback_${reserva.compraId}`;
      const raw = localStorage.getItem(key);
      
      if (raw) {
        const fallbackData = JSON.parse(raw) as FallbackPagamentoResponse;
        console.debug('[v0] Fallback carregado:', fallbackData);
        
        setFallback(fallbackData);
        
        // ✅ Atualiza reserva com dados do fallback
        setReserva(prev => prev ? {
          ...prev,
          pagamentoManual: {
            chavePix: fallbackData.chavePix || '',
            nomeVendedor: fallbackData.nomeVendedor || '',
            emailVendedor: '',
            valor: fallbackData.valorPagar || prev.valorTotal,
            mensagem: fallbackData.mensagem || 'Envie o comprovante após realizar o pagamento'
          }
        } : null);
        
        // Remove do localStorage após uso
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('[v0] Erro ao processar fallback:', error);
    }
  }, [reserva?.compraId]);

  // ✅ Loading e erro permanecem iguais
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

          {/* ✅ Passa reserva limpa, sem fallback misturado */}
          <PagamentoHandler reserva={reserva} />
        </div>
      </main>
    </div>
  );
}
