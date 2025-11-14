"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Lock } from "lucide-react"
import { type Rifa, reservarNumeros, gerarPagamentoPix } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useState } from "react"

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

      // Log payload sent to reservarNumeros (não inclui token)
      console.debug('[v0] reservarNumeros payload:', payload)

  const compra = await reservarNumeros(token, payload)
  // Log response from reservarNumeros
  console.debug('[v0] reservarNumeros response:', compra)
      // Decide next step based on rifa type
      switch (rifa.tipo) {
        case "PAGA_AUTOMATICA": {
          // Generate PIX payment and go to checkout with payment info
          // Log attempt to generate PIX for this compra
          console.debug('[v0] gerarPagamentoPix request for compraId:', compra.id)
          const pagamentoResp = await gerarPagamentoPix(token, compra.id)
          // pagamentoResp pode ser PagamentoPixResponse ou FallbackPagamentoResponse
          const nextId = (pagamentoResp as any).compraId || compra.id

          // If backend returned a fallback (service unavailable) with manual payment data,
          // persist it to localStorage so the checkout page can show instructions.
          try {
            const maybeFallback = pagamentoResp as any
            console.debug('[v0] gerarPagamentoPix response:', maybeFallback)
            if (maybeFallback && maybeFallback.erro) {
              try {
                localStorage.setItem(`pagamento_fallback_${compra.id}`, JSON.stringify(maybeFallback))
                console.debug('[v0] fallback stored for compraId=', compra.id)
              } catch (e) {
                console.debug('[v0] failed to store fallback in localStorage', e)
              }
            }
          } catch (e) {
            console.debug('[v0] error inspecting pagamentoResp', e)
          }

          router.push(`/checkout/${nextId}`)
          break
        }
        case "PAGA_MANUAL": {
          // For manual payments, backend expects user to follow manual instructions in checkout
          router.push(`/checkout/${compra.id}`)
          break
        }
        case "GRATUITA":
        default: {
          // Free participation: redirect to checkout (should show confirmed numbers)
          router.push(`/checkout/${compra.id}`)
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
