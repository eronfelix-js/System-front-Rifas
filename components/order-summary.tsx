"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Lock } from "lucide-react"
import { type Rifa, type ReservaResponse, reservarNumeros, gerarPagamentoPix } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { SERVER_PROPS_GET_INIT_PROPS_CONFLICT } from "next/dist/lib/constants"

interface OrderSummaryProps {
  rifa: Rifa
  numerosSelecionados: number[]
  onClearNumeros: () => void
}

export function OrderSummary({ rifa, numerosSelecionados, onClearNumeros }: OrderSummaryProps) {
  const { user, token } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const selectedCount = numerosSelecionados.length
  const pricePerTicket = rifa.precoPorNumero
  const subtotal = selectedCount * pricePerTicket
  const discount = 0
  const total = subtotal - discount

  const handleCheckout = async () => {
    if (!user || !token) {
      router.push("/login")
      return
    }

    if (selectedCount === 0) return

    setLoading(true)
    try {
      const payload = {
        rifaId: rifa.id,
        quantidade: selectedCount,
        numeros: numerosSelecionados.length > 0 ? numerosSelecionados : undefined,
      }

      console.debug('[v0] reservarNumeros payload:', payload)

      // ✅ Agora recebe ReservaResponse diretamente
      const reserva = await reservarNumeros(token, payload)
      console.debug('[v0] reservarNumeros response:', reserva)

      // ✅ Lógica simplificada baseada no tipo da rifa
      switch (reserva.tipoRifa) {
        case "PAGA_AUTOMATICA": {
          try {
            console.debug('[v0] Gerando pagamento PIX para compraId:', reserva.compraId)
            const pagamentoResp = await gerarPagamentoPix(token, reserva.compraId)
            console.debug('[v0] gerarPagamentoPix response:', pagamentoResp)

            // ✅ Verifica se é fallback (serviço indisponível)
            if ('erro' in pagamentoResp) {
              // Salva dados de fallback no localStorage
              try {
                localStorage.setItem(
                  `pagamento_fallback_${reserva.compraId}`,
                  JSON.stringify(pagamentoResp)
                )
                console.debug('[v0] Fallback salvo no localStorage')
              } catch (e) {
                console.warn('[v0] Erro ao salvar fallback:', e)
              }
            }
          } catch (error) {
            console.error('[v0] Erro ao gerar pagamento PIX:', error)
            // Continua para o checkout mesmo com erro
          }

          router.push(`/checkout/${reserva.compraId}`)
          break
        }

        case "PAGA_MANUAL": {
          // ✅ Para pagamento manual, salva reserva no localStorage e redireciona
          try {
            localStorage.setItem(
              `reserva_manual_${reserva.compraId}`,
              JSON.stringify(reserva)
            )
            console.debug('[v0] Reserva PAGA_MANUAL salva no localStorage')
          } catch (e) {
            console.warn('[v0] Erro ao salvar reserva manual:', e)
          }
          router.push(`/checkout/pagamento-manual/${reserva.compraId}`)
          break
        }

        case "GRATUITA":
        default: {
          router.push(`/checkout/${reserva.compraId}`)
          break
        }
      }
    } catch (error) {
      console.error("[v0] Erro ao finalizar compra:", error)
      alert("Erro ao processar compra. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6 space-y-6 sticky top-24">
      <div>
        <h2 className="text-xl font-bold mb-2">Resumo do Pedido</h2>
        <p className="text-sm text-muted-foreground">Confira os detalhes da sua compra</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Números selecionados</span>
          <Badge variant="secondary" className="text-base">
            {selectedCount}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Preço unitário</span>
          <span className="font-semibold">R$ {pricePerTicket.toFixed(2)}</span>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-semibold">R$ {subtotal.toFixed(2)}</span>
        </div>

        {discount > 0 && (
          <div className="flex items-center justify-between text-success">
            <span>Desconto</span>
            <span className="font-semibold">- R$ {discount.toFixed(2)}</span>
          </div>
        )}

        <Separator />

        <div className="flex items-center justify-between text-lg">
          <span className="font-bold">Total</span>
          <span className="font-bold text-primary">R$ {total.toFixed(2)}</span>
        </div>
      </div>

      <Button size="lg" className="w-full gap-2" disabled={selectedCount === 0 || loading} onClick={handleCheckout}>
        <ShoppingCart className="h-5 w-5" />
        {loading ? "Processando..." : "Finalizar Compra"}
      </Button>

      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Lock className="h-3 w-3" />
        <span>Pagamento 100% seguro</span>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <h3 className="font-semibold text-sm">Forma de Pagamento</h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• PIX (aprovação instantânea)</li>
        </ul>
      </div>
    </Card>
  )
}
