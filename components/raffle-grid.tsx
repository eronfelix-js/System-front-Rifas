"use client"

import { RaffleCard } from "@/components/raffle-card"
import { useEffect, useState } from "react"
import { getRifas, type Rifa, isMockMode } from "@/lib/api"
import { AlertCircle, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function RaffleGrid() {
  const [rifas, setRifas] = useState<Rifa[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showMockBanner, setShowMockBanner] = useState(false)

  useEffect(() => {
    getRifas()
      .then((data) => {
        setRifas(data)
        if (isMockMode()) {
          setShowMockBanner(true)
        }
      })
      .catch((error) => {
        console.error("[v0] Erro ao carregar rifas:", error)
        setError(error.message || "Erro ao carregar rifas")
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-96 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro ao carregar rifas</AlertTitle>
        <AlertDescription>
          {error}
          <br />
          <span className="text-sm mt-2 block">
            Verifique se a variável de ambiente NEXT_PUBLIC_API_URL está configurada corretamente e se a API está
            rodando.
          </span>
        </AlertDescription>
      </Alert>
    )
  }

  if (rifas.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhuma rifa disponível no momento</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {showMockBanner && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Modo de Desenvolvimento</AlertTitle>
          <AlertDescription>
            A API não está disponível. Exibindo dados de exemplo para visualização. Configure a variável
            NEXT_PUBLIC_API_URL para conectar à API real.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rifas.map((rifa) => (
          <RaffleCard key={rifa.id} rifa={rifa} />
        ))}
      </div>
    </div>
  )
}
