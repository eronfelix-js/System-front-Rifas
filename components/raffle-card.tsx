import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, Ticket, TrendingUp } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { Rifa } from "@/lib/api"

interface RaffleCardProps {
  rifa: Rifa
}

export function RaffleCard({ rifa }: RaffleCardProps) {
  const progress = (rifa.numerosVendidos / rifa.quantidadeNumeros) * 100
  const remaining = rifa.quantidadeNumeros - rifa.numerosVendidos
  const isFeatured = progress > 70

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {isFeatured && (
          <Badge className="absolute top-3 left-3 z-10 bg-accent text-accent-foreground">
            <TrendingUp className="h-3 w-3 mr-1" />
            Em Alta
          </Badge>
        )}
        <Image
          src={normalizeImageSrc(rifa.imagemUrl, rifa.titulo)}
          alt={rifa.titulo}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="p-5 space-y-4">
        <div>
          <h3 className="font-bold text-lg mb-2 text-balance">{rifa.titulo}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Sorteio: {new Date(rifa.dataFim).toLocaleDateString("pt-BR")}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-semibold">
              {rifa.numerosVendidos} / {rifa.quantidadeNumeros}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">{remaining} números disponíveis</p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Por apenas</p>
            <p className="text-2xl font-bold text-primary">R$ {rifa.precoPorNumero.toFixed(2)}</p>
          </div>
          <Button asChild size="lg" className="gap-2">
            <Link href={`/rifa/${rifa.id}`}>
              <Ticket className="h-4 w-4" />
              Participar
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  )
}

function normalizeImageSrc(src?: string, fallbackQuery?: string): string {
  // Se vier vazio/undefined, usa placeholder local
  if (!src) {
    return `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(fallbackQuery || "Rifa")}`
  }
  // Se já é caminho absoluto (http/https) retorna como está
  if (/^https?:\/\//i.test(src)) return src
  // Garante barra inicial para arquivos do diretório public/
  if (!src.startsWith("/")) return `/${src}`
  return src
}
