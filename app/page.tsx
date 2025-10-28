import { Header } from "@/components/header"
import { RaffleGrid } from "@/components/raffle-grid"
import { HowItWorks } from "@/components/how-it-works"
import { Winners } from "@/components/winners"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-balance">Participe das Melhores Rifas Online</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Concorra a prêmios incríveis com total segurança e transparência. Escolha seus números da sorte agora!
            </p>
          </div>
          <RaffleGrid />
        </section>
        <HowItWorks />
        <Winners />
      </main>
    </div>
  )
}
