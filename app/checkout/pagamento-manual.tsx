// components/checkout/pagamento-manual.tsx
'use client';

import { useState } from 'react';
import { Clock, Copy, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTimer } from '@/hooks/use-timer';
import { uploadComprovante, type ReservaResponse } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

interface Props {
  reserva: ReservaResponse;
}

export function PagamentoManual({ reserva }: Props) {
  const { token } = useAuth();
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  
  const { tempoRestante, expirado } = useTimer(reserva.minutosParaExpirar);

  if (!reserva.pagamentoManual) {
    return (
      <Card className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Erro de Configuração</strong>
            <p className="mt-1">
              Dados de pagamento manual não disponíveis. Entre em contato com o suporte.
            </p>
          </AlertDescription>
        </Alert>
      </Card>
    );
  }

  const { chavePix, nomeVendedor, emailVendedor, valor } = reserva.pagamentoManual;

  const copiarChavePix = () => {
    if (!chavePix) {
      toast.error('Chave PIX não disponível');
      return;
    }
    navigator.clipboard.writeText(chavePix);
    toast.success('Chave PIX copiada!');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validações
    if (!file.type.startsWith('image/')) {
      toast.error('Apenas imagens são permitidas');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo deve ter no máximo 5MB');
      return;
    }

    setArquivo(file);
  };

  const handleUpload = async () => {
    if (!arquivo || !token) return;

    try {
      setUploading(true);
      await uploadComprovante(token, reserva.compraId, arquivo);
      setEnviado(true);
      toast.success('✅ Comprovante enviado! Aguarde aprovação do vendedor.');
    } catch (error) {
      toast.error('Erro ao enviar comprovante. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  if (expirado) {
    return (
      <Card className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Reserva Expirada</strong>
            <p className="mt-1">
              O tempo para pagamento expirou. Faça uma nova reserva.
            </p>
          </AlertDescription>
        </Alert>
      </Card>
    );
  }

  if (enviado) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <div className="bg-blue-100 dark:bg-blue-900/20 p-4 rounded-full inline-block">
            <CheckCircle className="w-12 h-12 text-blue-600 dark:text-blue-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">Comprovante Enviado!</h3>
            <p className="text-muted-foreground">
              Aguarde a aprovação do vendedor. Você receberá uma notificação.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Timer */}
      <Alert className="border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-900/10">
        <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
        <AlertDescription>
          <strong className="text-yellow-900 dark:text-yellow-100">
            Complete o pagamento em: {tempoRestante}
          </strong>
          <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
            Após esse prazo, os números serão liberados
          </p>
        </AlertDescription>
      </Alert>

      {/* Instruções de Pagamento */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">📲 Instruções de Pagamento</h3>

        <div className="space-y-4">
          {/* Valor */}
          <div>
            <label className="text-sm text-muted-foreground">Valor a pagar:</label>
            <p className="text-3xl font-bold text-green-600 dark:text-green-500">
              R$ {reserva.valorTotal.toFixed(2)}
            </p>
          </div>

          {/* Chave PIX */}
          <div>
            <label className="text-sm text-muted-foreground block mb-2">
              Chave PIX:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={reserva.pagamentoManual?.chavePix || ''}
                readOnly
                className="flex-1 px-4 py-2 border rounded-lg bg-muted font-mono text-sm"
              />
              <Button
                onClick={copiarChavePix}
                variant="outline"
                size="icon"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Vendedor */}
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Beneficiário:</p>
            <p className="font-semibold text-lg">
              {reserva.pagamentoManual?.nomeVendedor}
            </p>
            <p className="text-sm text-muted-foreground">
              {reserva.pagamentoManual?.emailVendedor}
            </p>
          </div>
        </div>
      </Card>

      {/* Upload de Comprovante */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">📤 Enviar Comprovante</h3>

        <div className="space-y-4">
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-muted-foreground
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:bg-primary file:text-primary-foreground
                hover:file:bg-primary/90 cursor-pointer"
            />
          </div>

          {arquivo && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>{arquivo.name}</span>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={!arquivo || uploading}
            className="w-full"
          >
            {uploading ? (
              <>Enviando...</>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Enviar Comprovante
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Seus Números */}
      <Card className="p-6">
        <h4 className="font-semibold mb-3">Seus números reservados:</h4>
        <div className="flex flex-wrap gap-2">
          {reserva.numeros.map((num) => (
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