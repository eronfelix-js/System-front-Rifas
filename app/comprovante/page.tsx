"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { getComprovantesPendentes, getMinhasRifas, aprovarCompra, rejeitarCompra, type CompraResponse } from "@/lib/api"
import { CheckCircle, Clock, XCircle } from "lucide-react"
import { ComprovantesList } from "@/components/comprovantes-list"

export default function ComprovantesPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [compras, setCompras] = useState<CompraResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pendentes")
  const [observacoes, setObservacoes] = useState<Record<string, string>>({})
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)

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
      const rifas = await getMinhasRifas(token)
      
      // Busca comprovantes pendentes de todas as rifas
      let todasAsCompras: CompraResponse[] = []
      let totalPaginas = 0
      
      for (const rifa of rifas) {
        try {
          const response = await getComprovantesPendentes(token, rifa.id, currentPage, 20)
          todasAsCompras = [...todasAsCompras, ...response.content]
          totalPaginas = response.totalPages
        } catch (error) {
          console.error(`Erro ao buscar comprovantes da rifa ${rifa.id}:`, error)
        }
      }
      
      setCompras(todasAsCompras)
      setTotalPages(totalPaginas)
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
            {loading ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Carregando comprovantes...</p>
                </CardContent>
              </Card>
            ) : (
              <ComprovantesList
                compras={compras}
                observacoes={observacoes}
                onObservacaoChange={(compraId, valor) =>
                  setObservacoes((prev) => ({
                    ...prev,
                    [compraId]: valor,
                  }))
                }
                onAprovar={handleAprovar}
                onRejeitar={handleRejeitar}
              />
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
