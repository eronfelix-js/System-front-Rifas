// components/checkout/pagamento-automatico.tsx
'use client';

import { useState, useEffect } from 'react';
import { Clock, Copy, RefreshCw, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useTimer } from '@/hooks/use-timer';
import { consultarPagamentoPix, type ReservaResponse } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Props {
  reserva: ReservaResponse;
}

export function PagamentoAutomatico({ reserva: initialReserva }: Props) {
  const { token } = useAuth();
  const router = useRouter();
  const [pagamento, setPagamento] = useState(initialReserva.pagamento);
  const [verificando, setVerificando] = useState(false);
  
  const { tempoRestante, expirado } = useTimer(initialReserva.minutosParaExpirar);

  // Single initial check for payment status. Do NOT poll repeatedly when payment not found.
  useEffect(() => {
    if (!token) return;
    if (pagamento?.status === 'APROVADO') return;

    let mounted = true;

    (async () => {
      try {
        console.debug('[v0] consultarPagamentoPix (initial check) compraId=', initialReserva.compraId)
        const response = await consultarPagamentoPix(token, initialReserva.compraId);
        if (!mounted) return;
        console.debug('[v0] consultarPagamentoPix response (initial):', response)
        setPagamento(response);
        if (response?.status === 'APROVADO') {
          toast.success('🎉 Pagamento confirmado!');
        }
      } catch (error) {
        // If payment not found or other error, stop here. The user can click "Verificar Pagamento" to retry.
        // Avoid automatic retries to prevent excessive requests.
        console.debug('[v0] consultarPagamentoPix initial check failed for compraId=', initialReserva.compraId, 'error=', error)
      }
    })();

    return () => { mounted = false };
  }, [initialReserva.compraId, token]);

  const copiarCodigoPix = () => {
    if (!pagamento?.qrCodePayload) return;
    navigator.clipboard.writeText(pagamento.qrCodePayload);
    toast.success('Código PIX copiado!');
  };

  const verificarPagamento = async () => {
    if (!token) return;

    setVerificando(true);
    try {
      console.debug('[v0] Manual verificarPagamento called for compraId=', initialReserva.compraId)
      const response = await consultarPagamentoPix(token, initialReserva.compraId);
      console.debug('[v0] consultarPagamentoPix response (manual):', response)
      setPagamento(response);

      if (response?.status === 'APROVADO') {
        toast.success('✅ Pagamento confirmado!');
      } else {
        toast.info('Ainda aguardando pagamento...');
      }
    } catch (error) {
      toast.error('Erro ao verificar pagamento');
    } finally {
      setVerificando(false);
    }
  };

  // Pagamento aprovado
  if (pagamento?.status === 'APROVADO') {
    return (
      <Card className="p-6">
        <div className="text-center space-y-6">
          <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-full inline-block">
            <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-500" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-2">
              Pagamento Confirmado!
            </h2>
            <p className="text-muted-foreground">
              Seus números foram confirmados. Boa sorte! 🍀
            </p>
          </div>

          {/* Números */}
          <div className="bg-muted/50 rounded-lg p-6">
            <h3 className="font-semibold mb-4">Seus números:</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {initialReserva.numeros.map((num) => (
                <Badge
                  key={num}
                  variant="secondary"
                  className="text-lg px-4 py-2 bg-green-100 dark:bg-green-900/30"
                >
                  {num.toString().padStart(4, '0')}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push('/minhas-compras')}
            >
              Minhas Compras
            </Button>
            <Button
              className="flex-1"
              onClick={() => router.push('/')}
            >
              Ver Outras Rifas
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Pagamento expirado
  if (expirado || pagamento?.status === 'EXPIRADO') {
    return (
      <Card className="p-6">
        <Alert variant="destructive">
          <AlertDescription>
            <strong>⏰ Pagamento Expirado</strong>
            <p className="mt-1">
              Os números foram liberados. Faça uma nova reserva.
            </p>
          </AlertDescription>
        </Alert>
      </Card>
    );
  }

  // Aguardando pagamento
  return (
    <div className="space-y-4">
      {/* Timer */}
      <Alert className="border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-900/10">
        <Clock className="h-4 w-4 text-yellow-600" />
        <AlertDescription>
          <strong>Complete o pagamento em: {tempoRestante}</strong>
          <p className="text-sm mt-1">PIX expira automaticamente após esse prazo</p>
        </AlertDescription>
      </Alert>

      {/* QR Code */}
      <Card className="p-6">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-bold">📲 Pague com PIX</h3>

          <div>
            <p className="text-3xl font-bold text-green-600 dark:text-green-500 mb-2">
              R$ {initialReserva.valorTotal.toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground">
              {initialReserva.quantidadeNumeros} número(s)
            </p>
          </div>

          {/* QR Code Image */}
          {pagamento?.qrCode && (
            <div className="bg-white p-4 rounded-lg inline-block">
              <Image
                src={`data:image/png;base64,${pagamento.qrCode}`}
                alt="QR Code PIX"
                width={250}
                height={250}
                className="mx-auto"
              />
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            Escaneie o QR Code com o app do seu banco
          </p>

          {/* PIX Copia e Cola */}
          <div className="space-y-3">
            <p className="text-sm font-semibold">Ou copie o código PIX:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={pagamento?.qrCodePayload || ''}
                readOnly
                className="flex-1 px-3 py-2 border rounded-lg bg-muted text-sm font-mono overflow-x-auto"
              />
              <Button
                onClick={copiarCodigoPix}
                variant="outline"
                size="icon"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Status */}
      <Card className="p-4">
        <div className="space-y-3">
          <p className="text-sm text-center text-muted-foreground">
            ⏳ Aguardando confirmação do pagamento... Clique em "Verificar Pagamento" para checar novamente.
          </p>
          <Button
            onClick={verificarPagamento}
            disabled={verificando}
            variant="outline"
            className="w-full"
          >
            {verificando ? (
              <>Verificando...</>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Verificar Pagamento
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Seus Números */}
      <Card className="p-6">
        <h4 className="font-semibold mb-3">Seus números reservados:</h4>
        <div className="flex flex-wrap gap-2">
          {initialReserva.numeros.map((num) => (
            <Badge
              key={num}
              variant="secondary"
              className="text-base px-3 py-1"
            >
              {num.toString().padStart(4, '0')}
            </Badge>
          ))}
        </div>
      </Card>
    </div>
  );
}