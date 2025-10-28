"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, CheckCircle2, Clock, QrCode } from "lucide-react"
import { getCompra, type Compra } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import Image from "next/image"

export default function CheckoutPage({ params }: { params: { id: string } }) {
  const [compra, setCompra] = useState<Compra | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const { token } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!token) {
      router.push("/login")
      return
    }

    getCompra(token, params.id)
      .then(setCompra)
      .catch((error) => {
        console.error("[v0] Erro ao carregar compra:", error)
        router.push("/")
      })
      .finally(() => setLoading(false))
  }, [params.id, token, router])

  const copyPixCode = () => {
    if (compra?.pagamento?.qrCode) {
      navigator.clipboard.writeText(compra.pagamento.qrCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto animate-pulse">
            <div className="h-96 bg-muted rounded-xl" />
          </div>
        </main>
      </div>
    )
  }

  if (!compra) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Compra não encontrada</h1>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <Badge className="mb-4" variant={compra.status === "PAGA" ? "default" : "secondary"}>
              {compra.status === "PAGA" ? (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Pagamento Confirmado
                </>
              ) : (
                <>
                  <Clock className="h-3 w-3 mr-1" />
                  Aguardando Pagamento
                </>
              )}
            </Badge>
            <h1 className="text-3xl font-bold mb-2">
              {compra.status === "PAGA" ? "Pagamento Confirmado!" : "Finalize seu Pagamento"}
            </h1>
            <p className="text-muted-foreground">
              {compra.status === "PAGA"
                ? "Seus números foram confirmados. Boa sorte!"
                : "Escaneie o QR Code ou copie o código PIX para pagar"}
            </p>
          </div>

          <Card className="p-6 space-y-6">
            <div>
              <h2 className="font-bold text-lg mb-4">Detalhes da Compra</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rifa</span>
                  <span className="font-semibold">{compra.rifa.titulo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Números</span>
                  <span className="font-semibold">{compra.numeros.length} números</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor Total</span>
                  <span className="font-bold text-primary text-xl">R$ {compra.valorTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {compra.status === "RESERVADA" && compra.pagamento && (
              <>
                <div className="border-t pt-6">
                  <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    Pagamento via PIX
                  </h2>

                  <div className="flex justify-center mb-4">
                    <div className="bg-white p-4 rounded-lg">
                      <Image
                        src={`data:image/png;base64,${compra.pagamento.qrCodeBase64}`}
                        alt="QR Code PIX"
                        width={250}
                        height={250}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground text-center">Ou copie o código PIX abaixo:</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={compra.pagamento.qrCode}
                        readOnly
                        className="flex-1 px-3 py-2 bg-muted rounded-lg text-sm font-mono"
                      />
                      <Button onClick={copyPixCode} variant="outline">
                        {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                  <p className="font-semibold mb-2">Instruções:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Abra o app do seu banco</li>
                    <li>Escolha pagar via PIX</li>
                    <li>Escaneie o QR Code ou cole o código</li>
                    <li>Confirme o pagamento</li>
                  </ol>
                </div>
              </>
            )}

            {compra.status === "PAGA" && (
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3">Seus Números da Sorte:</h3>
                <div className="flex flex-wrap gap-2">
                  {compra.numeros.map((num) => (
                    <Badge key={num} variant="secondary" className="text-base px-3 py-1">
                      {num.toString().padStart(4, "0")}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => router.push("/minhas-compras")}>
              Ver Minhas Compras
            </Button>
            <Button className="flex-1" onClick={() => router.push("/")}>
              Ver Outras Rifas
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
