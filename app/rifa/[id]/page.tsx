"use client"

import { Header } from "@/components/header"
import { RaffleDetails } from "@/components/raffle-details"
import { NumberSelector } from "@/components/number-selector"
import { OrderSummary } from "@/components/order-summary"
import { useState, useEffect } from "react"
import { getRifa, getNumerosDisponiveis, type Rifa } from "@/lib/api"
import { useParams } from "next/navigation"

export default function RafflePage() {

  const params = useParams()
  const id = Array.isArray(params?.id) ? params.id[0] : params.id!

  const [rifa, setRifa] = useState<Rifa | null>(null)
  const [numerosDisponiveis, setNumerosDisponiveis] = useState<number[]>([])
  const [numerosSelecionados, setNumerosSelecionados] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    if (!id) return

    Promise.all([getRifa(id), getNumerosDisponiveis(id)])
      .then(([rifaData, numerosData]) => {
        setRifa(rifaData)
        setNumerosDisponiveis(numerosData)
      })
      .catch((error) => console.error("[v0] Erro ao carregar rifa:", error))
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-muted rounded-xl" />
            <div className="h-96 bg-muted rounded-xl" />
          </div>
        </main>
      </div>
    )
  }

  if (!rifa) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Rifa não encontrada</h1>
            <p className="text-muted-foreground">A rifa que você procura não existe ou foi removida.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <RaffleDetails rifa={rifa} />
            <NumberSelector
              rifa={rifa}
              numerosDisponiveis={numerosDisponiveis}
              numerosSelecionados={numerosSelecionados}
              onNumerosSelecionados={setNumerosSelecionados}
            />
          </div>
          <div className="lg:col-span-1">
            <OrderSummary
              rifa={rifa}
              numerosSelecionados={numerosSelecionados}
              onClearNumeros={() => setNumerosSelecionados([])}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
