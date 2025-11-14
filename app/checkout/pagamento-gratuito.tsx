// components/checkout/pagamento-gratuito.tsx
'use client';

import { CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import type { ReservaResponse } from '@/lib/api';

interface Props {
  reserva: ReservaResponse;
}

export function PagamentoGratuito({ reserva }: Props) {
  const router = useRouter();

  return (
    <Card className="p-6">
      <div className="text-center space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-full">
            <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-500" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-2">
              Participação Confirmada!
            </h2>
            <p className="text-muted-foreground">
              Seus números foram confirmados automaticamente. Boa sorte! 🍀
            </p>
          </div>
        </div>

        {/* Números */}
        <div className="bg-muted/50 rounded-lg p-6">
          <h3 className="font-semibold mb-4 text-lg">Seus Números da Sorte:</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {reserva.numeros.map((num) => (
              <Badge
                key={num}
                variant="secondary"
                className="text-lg px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
              >
                {num.toString().padStart(4, '0')}
              </Badge>
            ))}
          </div>
        </div>

        {/* Detalhes */}
        <div className="bg-card border rounded-lg p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Rifa:</span>
            <span className="font-medium">{reserva.tituloRifa}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Números:</span>
            <span className="font-medium">{reserva.quantidadeNumeros}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status:</span>
            <Badge variant="default" className="bg-green-600">
              {reserva.status}
            </Badge>
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push('/minhas-compras')}
          >
            Minhas Participações
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