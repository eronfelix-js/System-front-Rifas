"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { getMinhasRifas, type Rifa } from "@/lib/api"
import { Plus, TrendingUp, Users, DollarSign} from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const router = useRouter()
  const { user, token } = useAuth()
  const [rifas, setRifas] = useState<Rifa[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.role !== "VENDEDOR") {
      router.push("/")
      return
    }

    if (token) {
      loadRifas()
    }
  }, [user, token, router])

  const loadRifas = async () => {
    if (!token) return

    try {
      const data = await getMinhasRifas(token)
      setRifas(data)
    } catch (error) {
      console.error("Erro ao carregar rifas:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!user || user.role !== "VENDEDOR") {
    return null
  }

  const totalVendas = rifas.reduce((acc, rifa) => acc + rifa.numerosVendidos * rifa.precoPorNumero, 0)
  const totalRifas = rifas.length
  const rifasAtivas = rifas.filter((r) => r.status === "ATIVA").length

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Gerencie suas rifas</p>
          </div>
          <Button asChild>
            <Link href={"/dashboard/rifas"}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Rifa
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Rifas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRifas}</div>
              <p className="text-xs text-muted-foreground">{rifasAtivas} ativas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Números Vendidos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rifas.reduce((acc, rifa) => acc + rifa.numerosVendidos, 0)}</div>
              <p className="text-xs text-muted-foreground">em todas as rifas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Arrecadado</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {totalVendas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">receita total</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Minhas Rifas</CardTitle>
            <CardDescription>Gerencie e acompanhe suas rifas</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
              </div>
            ) : rifas.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Você ainda não criou nenhuma rifa</p>
                <Button asChild>
                  <Link href="/dashboard/rifas">
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Primeira Rifa
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {rifas.map((rifa) => (
                  <div
                    key={rifa.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{rifa.titulo}</h3>
                      <p className="text-sm text-muted-foreground">
                        {rifa.numerosVendidos} / {rifa.quantidadeNumeros} números vendidos
                      </p>
                    </div>
                    <div className="text-right mr-4">
                      <p className="font-semibold">
                        R${" "}
                        {(rifa.numerosVendidos * rifa.precoPorNumero).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">{rifa.status}</p>
                    </div>
                    <Button variant="outline" asChild>
                      <Link href={`/rifa/${rifa.id}`}>Ver Detalhes</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
