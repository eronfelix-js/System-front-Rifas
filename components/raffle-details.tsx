import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, Users, Ticket, TrendingUp } from "lucide-react"
import Image from "next/image"
import type { Rifa } from "@/lib/api"

interface RaffleDetailsProps {
  rifa: Rifa
}

export function RaffleDetails({ rifa }: RaffleDetailsProps) {
  const progress = (rifa.numerosVendidos / rifa.quantidadeNumeros) * 100
  const disponveis = rifa.quantidadeNumeros - rifa.numerosVendidos

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video bg-muted">
        {progress > 70 && (
          <Badge className="absolute top-4 left-4 z-10 bg-accent text-accent-foreground">
            <TrendingUp className="h-3 w-3 mr-1" />
            Em Alta
          </Badge>
        )}
        <Image
          src={normalizeImageSrc(rifa.imagemUrl, rifa.titulo)}
          alt={rifa.titulo}
          fill
          className="object-cover"
        />
      </div>

      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{rifa.titulo}</h1>
          <p className="text-muted-foreground">{rifa.descricao}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Ticket className="h-4 w-4" />
              <span className="text-sm">Preço</span>
            </div>
            <p className="text-2xl font-bold text-primary">R$ {rifa.precoPorNumero.toFixed(2)}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-sm">Vendidos</span>
            </div>
            <p className="text-2xl font-bold">{rifa.numerosVendidos}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Ticket className="h-4 w-4" />
              <span className="text-sm">Disponíveis</span>
            </div>
            <p className="text-2xl font-bold">{disponveis}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Sorteio</span>
            </div>
            <p className="text-lg font-bold">{new Date(rifa.dataFim).toLocaleDateString("pt-BR")}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso da Rifa</span>
            <span className="font-semibold">{progress.toFixed(1)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>
      </div>
    </Card>
  )
}

function normalizeImageSrc(src?: string, fallbackQuery?: string): string {
  if (!src) {
    return `/placeholder.svg?height=600&width=1200&query=${encodeURIComponent(fallbackQuery || "Rifa")}`
  }
  if (/^https?:\/\//i.test(src)) return src
  if (!src.startsWith("/")) return `/${src}`
  return src
}
