"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { getMinhasRifas, type Rifa } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Calendar, DollarSign, Users, Eye, X } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CancelRifaDialog } from "@/components/cancel-rifa-dialog"

export default function AdminDashboardPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [rifas, setRifas] = useState<Rifa[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadRifas = async () => {
    try {
      if (!token) {
        console.error("Token não encontrado")
        return
      }

      const rifasData = await getMinhasRifas(token)
      // Filtra apenas rifas ativas
      const rifasAtivas = rifasData.filter(rifa => rifa.status === "ATIVA")
      setRifas(rifasAtivas)
    } catch (error) {
      console.error("Erro ao carregar rifas:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRifaCanceled = () => {
    // Recarrega as rifas após cancelamento
    loadRifas()
  }

  // Verifica se o usuário é admin
  if (!user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Acesso Negado</CardTitle>
            <CardDescription className="text-center">
              Você não tem permissão para acessar esta página.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push("/")}
              className="w-full"
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  useEffect(() => {
    if (token) {
      loadRifas()
    }
  }, [token])

  const getStatusColor = (status: Rifa["status"]) => {
    switch (status) {
      case "ATIVA":
        return "bg-green-100 text-green-800"
      case "COMPLETA":
        return "bg-blue-100 text-blue-800"
      case "CANCELADA":
        return "bg-red-100 text-red-800"
      case "SORTEADA":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando rifas...</p>
        </div>
      </div>
    )
  }
  console.log(rifas);
  console.log(rifas);
  console.log(rifas.reduce((total: number, rifa: Rifa) => total + (Number(rifa?.numerosVendidos) || 0), 0));
  console.log(rifas.reduce((total: number, rifa: Rifa) => total + (Number(rifa?.numerosVendidos) || 0), 0));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-6">
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Início
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Minhas Rifas</h1>
              <p className="text-gray-600 mt-2">
                Gerencie suas rifas ativas
              </p>
            </div>
            <Button asChild>
              <Link href="/admin/rifas">
                <Plus className="w-4 h-4 mr-2" />
                Nova Rifa
              </Link>
            </Button>
          </div>
        </div>

        {/* Estatísticas gerais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rifas Ativas</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rifas.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Arrecadado</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <div className="text-2xl font-bold">
                  {(rifas || []).reduce((total: number, rifa) => {
                    const vendidos = Number(rifa?.numerosVendidos ?? 0);
                    return total + vendidos;
                  }, 0)}
                </div>

              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Participantes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">

              {(rifas || [])
              .reduce((total: number, rifa) => total + (Number(rifa?.numerosVendidos) || 0), 0)}

              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de rifas */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Suas Rifas Ativas</h2>

          {rifas.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500 mb-4">Você não possui rifas ativas</p>
                <Button asChild>
                  <Link href="/admin/rifas">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Nova Rifa
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {rifas.map((rifa) => (
                <Card key={rifa.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{rifa.titulo}</h3>
                          <Badge className={getStatusColor(rifa.status)}>
                            {rifa.status}
                          </Badge>
                        </div>

                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {rifa.descricao}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Valor por número:</span>
                            <p className="font-medium">{formatCurrency(rifa.precoPorNumero)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Números vendidos:</span>
                            <p className="font-medium">
                              {rifa.numerosVendidos} / {rifa.quantidadeNumeros}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Arrecadado:</span>
                            <p className="font-medium">
                              {formatCurrency(rifa.numerosVendidos * rifa.precoPorNumero)}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Encerra em:</span>
                            <p className="font-medium">{formatDate(rifa.dataLimite)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="ml-4 flex gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/rifa/${rifa.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalhes
                          </Link>
                        </Button>

                        <CancelRifaDialog
                          rifa={rifa}
                          onCancelSuccess={handleRifaCanceled}
                        >
                          <Button variant="destructive" size="sm">
                            <X className="w-4 h-4 mr-2" />
                            Cancelar
                          </Button>
                        </CancelRifaDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
