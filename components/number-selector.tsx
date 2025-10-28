"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Shuffle, Plus, Minus } from "lucide-react"
import type { Rifa } from "@/lib/api"

interface NumberSelectorProps {
  rifa: Rifa
  numerosDisponiveis: number[]
  numerosSelecionados: number[]
  onNumerosSelecionados: (numeros: number[]) => void
}

export function NumberSelector({
  rifa,
  numerosDisponiveis,
  numerosSelecionados,
  onNumerosSelecionados,
}: NumberSelectorProps) {
  const [quantity, setQuantity] = useState(1)

  const generateRandomNumbers = (count: number) => {
    const shuffled = [...numerosDisponiveis].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, Math.min(count, numerosDisponiveis.length))
    onNumerosSelecionados(selected.sort((a, b) => a - b))
  }

  const toggleNumber = (num: number) => {
    if (numerosSelecionados.includes(num)) {
      onNumerosSelecionados(numerosSelecionados.filter((n) => n !== num))
    } else {
      onNumerosSelecionados([...numerosSelecionados, num].sort((a, b) => a - b))
    }
  }

  // Números devem iniciar em 1 para atender a validação do backend (@Min(1))
  const todosNumeros = Array.from({ length: rifa.quantidadeNumeros }, (_, i) => i + 1)

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Escolha seus Números</h2>
        <p className="text-muted-foreground">
          Selecione manualmente ou deixe o sistema escolher números aleatórios para você
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1">
          <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
            className="text-center"
            min={1}
          />
          <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={() => generateRandomNumbers(quantity)} className="gap-2 flex-1" variant="outline">
          <Shuffle className="h-4 w-4" />
          Gerar Aleatórios
        </Button>
      </div>

      {numerosSelecionados.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Números Selecionados ({numerosSelecionados.length})</h3>
            <Button variant="ghost" size="sm" onClick={() => onNumerosSelecionados([])}>
              Limpar
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {numerosSelecionados.map((num) => (
              <Badge
                key={num}
                variant="secondary"
                className="text-base px-3 py-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                onClick={() => toggleNumber(num)}
              >
                {num.toString().padStart(4, "0")}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
          {todosNumeros.map((num) => {
            const isSelected = numerosSelecionados.includes(num)
            const isAvailable = numerosDisponiveis.includes(num)

            return (
              <button
                key={num}
                onClick={() => isAvailable && toggleNumber(num)}
                disabled={!isAvailable}
                className={`
                  aspect-square rounded-md text-sm font-semibold transition-all
                  ${
                    isSelected
                      ? "bg-primary text-primary-foreground scale-105"
                      : !isAvailable
                        ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                        : "bg-secondary hover:bg-secondary/80 hover:scale-105"
                  }
                `}
              >
                {num.toString().padStart(4, "0")}
              </button>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
