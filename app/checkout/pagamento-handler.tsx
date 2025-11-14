// components/checkout/pagamento-handler.tsx
'use client';

import type { ReservaResponse } from '@/lib/api';
import { PagamentoGratuito } from './pagamento-gratuito';
import { PagamentoManual } from './pagamento-manual';
import { PagamentoAutomatico } from './pagamento-automatico';

interface Props {
  reserva: ReservaResponse;
}

export function PagamentoHandler({ reserva }: Props) {
  // Roteamento baseado no tipo de rifa
  switch (reserva.tipoRifa) {
    case 'GRATUITA':
      return <PagamentoGratuito reserva={reserva} />;

    case 'PAGA_MANUAL':
      return <PagamentoManual reserva={reserva} />;

    case 'PAGA_AUTOMATICA':
      return <PagamentoAutomatico reserva={reserva} />;

    default:
      return (
        <div className="text-center text-destructive p-6">
          Tipo de pagamento desconhecido: {reserva.tipoRifa}
        </div>
      );
  }
}