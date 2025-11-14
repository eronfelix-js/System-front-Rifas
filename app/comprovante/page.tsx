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
import {CheckCircle, Clock, XCircle } from "lucide-react"

interface CompraPendente {
  id: string
  rifaTitulo: string
  compradorNome: string
  compradorEmail: string
  numeros: number[]
  valorTotal: number
  comprovanteUrl: string
  dataUpload: string
  status: "PENDENTE" | "CONFIRMADO" | "CANCELADO"
}

export default function ComprovantesPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [compras, setCompras] = useState<CompraPendente[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pendentes")

  useEffect(() => {
    if (!user || user.role !== "VENDEDOR") {
      router.push("/")
      return
    }

    // Mock data para demonstração
    setCompras([
      {
        id: "1",
        rifaTitulo: "iPhone 15 Pro Max 256GB",
        compradorNome: "Maria Santos",
        compradorEmail: "maria@example.com",
        numeros: [123, 456, 789],
        valorTotal: 30.0,
        comprovanteUrl: "/comprovante-pix.jpg",
        dataUpload: new Date().toISOString(),
        status: "PENDENTE",
      },
      {
        id: "2",
        rifaTitulo: "PlayStation 5 + 2 Controles",
        compradorNome: "Carlos Silva",
        compradorEmail: "carlos@example.com",
        numeros: [45, 67, 89, 101],
        valorTotal: 20.0,
        comprovanteUrl: "/comprovante-transferencia.jpg",
        dataUpload: new Date(Date.now() - 3600000).toISOString(),
        status: "PENDENTE",
      },
    ])
    setLoading(false)
  }, [user, router])

  const handleAprovar = async (compraId: string) => {
    try {
      // Simular aprovação
      setCompras((prev) => prev.map((c) => (c.id === compraId ? { ...c, status: "CONFIRMADO" as const } : c)))
      toast({
        title: "Compra Aprovada!",
        description: "O comprador foi notificado e os números foram confirmados.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível aprovar a compra",
        variant: "destructive",
      })
    }
  }

  const handleRejeitar = async (compraId: string) => {
    try {
      // Simular rejeição
      setCompras((prev) => prev.map((c) => (c.id === compraId ? { ...c, status: "CANCELADO" as const } : c)))
      toast({
        title: "Compra Rejeitada",
        description: "O comprador foi notificado e os números foram liberados.",
      })
    } catch (error) {
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

  const comprasPendentes = compras.filter((c) => c.status === "PENDENTE")
  const comprasProcessadas = compras.filter((c) => c.status !== "PENDENTE")

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
              {comprasPendentes.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {comprasPendentes.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="processadas">Processadas</TabsTrigger>
          </TabsList>

          <TabsContent value="pendentes" className="space-y-4">
            {comprasPendentes.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhum comprovante pendente</p>
                </CardContent>
              </Card>
            ) : (
              comprasPendentes.map((compra) => (
                <Card key={compra.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{compra.rifaTitulo}</CardTitle>
                        <CardDescription>
                          {compra.compradorNome} • {compra.compradorEmail}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        Pendente
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Comprovante:</p>
                          <div className="border rounded-lg overflow-hidden bg-muted">
                            <Image
                              src={compra.comprovanteUrl || "/placeholder.svg"}
                              alt="Comprovante"
                              width={400}
                              height={500}
                              className="w-full"
                            />
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
                            {compra.numeros.map((num) => (
                              <Badge key={num} variant="outline">
                                {num.toString().padStart(4, "0")}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground">Enviado em:</p>
                          <p className="text-sm">{new Date(compra.dataUpload).toLocaleString("pt-BR")}</p>
                        </div>

                        <div className="flex gap-3 pt-4">
                          <Button onClick={() => handleAprovar(compra.id)} className="flex-1">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Aprovar
                          </Button>
                          <Button
                            onClick={() => handleRejeitar(compra.id)}
                            variant="destructive"
                            className="flex-1 bg-transparent"
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
            {comprasProcessadas.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Nenhuma compra processada ainda</p>
                </CardContent>
              </Card>
            ) : (
              comprasProcessadas.map((compra) => (
                <Card key={compra.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{compra.rifaTitulo}</CardTitle>
                        <CardDescription>{compra.compradorNome}</CardDescription>
                      </div>
                      <Badge variant={compra.status === "CONFIRMADO" ? "default" : "destructive"}>
                        {compra.status === "CONFIRMADO" ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Aprovado
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Rejeitado
                          </>
                        )}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm">
                      <span>Valor: R$ {compra.valorTotal.toFixed(2)}</span>
                      <span>{compra.numeros.length} números</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
