import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy } from "lucide-react"

const winners = [
  {
    name: "João Silva",
    prize: "iPhone 14 Pro",
    date: "15/11/2024",
    avatar: "/diverse-group.png",
    ticket: "0847",
  },
  {
    name: "Maria Santos",
    prize: "Notebook Gamer",
    date: "10/11/2024",
    avatar: "/diverse-woman-portrait.png",
    ticket: "0312",
  },
  {
    name: "Pedro Costa",
    prize: "PlayStation 5",
    date: "05/11/2024",
    avatar: "/man.jpg",
    ticket: "0654",
  },
]

export function Winners() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full mb-4">
            <Trophy className="h-4 w-4" />
            <span className="text-sm font-semibold">Ganhadores Recentes</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Eles Já Ganharam!</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Confira quem levou os prêmios mais recentes e seja o próximo vencedor
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {winners.map((winner, index) => (
            <Card key={index} className="p-6 text-center">
              <Avatar className="w-20 h-20 mx-auto mb-4 ring-4 ring-primary/20">
                <AvatarImage src={winner.avatar || "/placeholder.svg"} alt={winner.name} />
                <AvatarFallback>
                  {winner.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-bold mb-1">{winner.name}</h3>
              <p className="text-sm text-primary font-semibold mb-2">{winner.prize}</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Número: {winner.ticket}</p>
                <p>{winner.date}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
