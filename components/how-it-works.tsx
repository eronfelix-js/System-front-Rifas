import { Card } from "@/components/ui/card"
import { Search, CreditCard, Trophy, Shield } from "lucide-react"

const steps = [
  {
    icon: Search,
    title: "Escolha sua Rifa",
    description: "Navegue pelas rifas disponíveis e escolha o prêmio dos seus sonhos",
  },
  {
    icon: CreditCard,
    title: "Selecione os Números",
    description: "Escolha seus números da sorte ou deixe o sistema escolher automaticamente",
  },
  {
    icon: Trophy,
    title: "Aguarde o Sorteio",
    description: "Acompanhe o sorteio ao vivo e torça para ser o grande vencedor",
  },
  {
    icon: Shield,
    title: "Receba seu Prêmio",
    description: "Ganhou? Seu prêmio será entregue com total segurança e rapidez",
  },
]

export function HowItWorks() {
  return (
    <section className="bg-muted/50 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Como Funciona</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Participar é simples, rápido e seguro. Veja como funciona em 4 passos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <Card key={index} className="p-6 text-center relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 mt-2">
                <step.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground text-pretty">{step.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
