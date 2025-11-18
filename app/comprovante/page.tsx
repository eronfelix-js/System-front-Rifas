"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { getComprovantesPendentes, getMinhasRifas, aprovarCompra, rejeitarCompra, type Compra, type Rifa } from "@/lib/api"
import { CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react"

export default function ComprovantesPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [compras, setCompras] = useState<Compra[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pendentes")
  const [observacoes, setObservacoes] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!user || user.role !== "VENDEDOR") {
      router.push("/")
      return
    }

    if (token) {
      loadComprovantes()
    }
  }, [user, token, router])

  const loadComprovantes = async () => {
    if (!token) return

    try {
      // Primeiro busca todas as rifas do vendedor
      const rifas = await getMinhasRifas(token)
      
      // Depois busca comprovantes pendentes para cada rifa
      let todasAsCompras: Compra[] = []
      
      for (const rifa of rifas) {
        try {
          const compras = await getComprovantesPendentes(token, rifa.id)
          todasAsCompras = [...todasAsCompras, ...compras]
        } catch (error) {
          console.error(`Erro ao buscar comprovantes da rifa ${rifa.id}:`, error)
        }
      }
      
      setCompras(todasAsCompras)
    } catch (error) {
      console.error("Erro ao carregar comprovantes:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os comprovantes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAprovar = async (compraId: string) => {
    if (!token) return

    try {
      await aprovarCompra(token, compraId, observacoes[compraId])
      setCompras((prev) => prev.filter((c) => c.id !== compraId))
      setObservacoes((prev) => {
        const newObs = { ...prev }
        delete newObs[compraId]
        return newObs
      })
      toast({
        title: "Compra Aprovada!",
        description: "O comprador foi notificado e os números foram confirmados.",
      })
    } catch (error) {
      console.error("Erro ao aprovar:", error)
      toast({
        title: "Erro",
        description: "Não foi possível aprovar a compra",
        variant: "destructive",
      })
    }
  }

  const handleRejeitar = async (compraId: string) => {
    if (!token) return

    try {
      await rejeitarCompra(token, compraId, observacoes[compraId])
      setCompras((prev) => prev.filter((c) => c.id !== compraId))
      setObservacoes((prev) => {
        const newObs = { ...prev }
        delete newObs[compraId]
        return newObs
      })
      toast({
        title: "Compra Rejeitada",
        description: "O comprador foi notificado e os números foram liberados.",
      })
    } catch (error) {
      console.error("Erro ao rejeitar:", error)
      toast({
        title: "Erro",
        description: "Não foi possível rejeitar a compra",
        variant: "destructive",
      })
    }
  }

  if (!user || user.role !== "VENDEDOR") {
    return null
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/dashboard">
            <span className="mr-2">←</span>
            Voltar ao Dashboard
          </Link>
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Gerenciar Comprovantes</h1>
          <p className="text-muted-foreground">Aprove ou rejeite os comprovantes de pagamento enviados</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="pendentes">
              Pendentes
              {compras.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {compras.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="processadas">Processadas</TabsTrigger>
          </TabsList>

          <TabsContent value="pendentes" className="space-y-4">
            {compras.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  {loading ? (
                    <>
                      <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary mx-auto mb-4" />
                      <p className="text-muted-foreground">Carregando comprovantes...</p>
                    </>
                  ) : (
                    <>
                      <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Nenhum comprovante pendente</p>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
              compras.map((compra) => (
                <Card key={compra.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{compra.rifa?.titulo ?? "Sem Titulo"}</CardTitle>
                        <CardDescription>
                          {compra.comprador?.nome ?? "Comprador Desconhecido"} • {compra.comprador?.email ?? "sem-email@example.com"}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        {compra.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Comprovante:</p>
                          <div className="border rounded-lg overflow-hidden bg-muted min-h-64 flex items-center justify-center">
                            {compra.comprovante_url ? (
                              <Image
                                src={compra.comprovante_url}
                                alt="Comprovante"
                                width={400}
                                height={500}
                                className="w-full h-auto"
                              />
                            ) : (
                              <div className="text-center">
                                <AlertCircle className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">Comprovante não disponível</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Valor Total:</p>
                          <p className="text-2xl font-bold text-primary">R$ {compra.valorTotal.toFixed(2)}</p>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Números:</p>
                          <div className="flex flex-wrap gap-2">
                            {compra.numeros.map((num: number) => (
                              <Badge key={num} variant="outline">
                                {num.toString().padStart(4, "0")}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground">Data da Compra:</p>
                          <p className="text-sm">{new Date(compra.dataCriacao).toLocaleString("pt-BR")}</p>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Observação (opcional):</p>
                          <textarea
                            value={observacoes[compra.id] || ""}
                            onChange={(e) =>
                              setObservacoes((prev) => ({
                                ...prev,
                                [compra.id]: e.target.value,
                              }))
                            }
                            placeholder="Adicione uma observação para o comprador..."
                            className="w-full px-3 py-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                            rows={3}
                          />
                        </div>

                        <div className="flex gap-3 pt-4">
                          <Button onClick={() => handleAprovar(compra.id)} className="flex-1">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Aprovar
                          </Button>
                          <Button
                            onClick={() => handleRejeitar(compra.id)}
                            variant="destructive"
                            className="flex-1"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Rejeitar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="processadas" className="space-y-4">
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Funcionalidade em desenvolvimento. Aqui aparecerão os comprovantes já processados.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
