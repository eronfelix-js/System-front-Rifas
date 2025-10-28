import type { Rifa, Usuario } from "./api"

// Usuário mock para desenvolvimento
export const mockVendedor: Usuario = {
  id: "1",
  nome: "João Silva",
  email: "joao@example.com",
  telefone: "(11) 98765-4321",
  cpf: "123.456.789-00",
  role: "VENDEDOR",
}

// Rifas mock para desenvolvimento
export const mockRifas: Rifa[] = [
  {
    id: "1",
    titulo: "iPhone 15 Pro Max 256GB",
    descricao: "Concorra a um iPhone 15 Pro Max novinho em folha! Cor Titânio Natural, 256GB de armazenamento.",
    imagemUrl: "/iphone-15-pro-max-titanium.png",
    precoPorNumero: 10.0,
    quantidadeNumeros: 1000,
    numerosVendidos: 847,
    dataInicio: "2024-01-01T00:00:00Z",
    dataFim: "2024-12-31T23:59:59Z",
    status: "ATIVA",
    vendedor: mockVendedor,
  },
  {
    id: "2",
    titulo: "Notebook Gamer RTX 4060",
    descricao: "Notebook Gamer completo com RTX 4060, 16GB RAM, SSD 512GB. Perfeito para jogos e trabalho!",
    imagemUrl: "/gaming-laptop-rtx.jpg",
    precoPorNumero: 15.0,
    quantidadeNumeros: 500,
    numerosVendidos: 312,
    dataInicio: "2024-01-15T00:00:00Z",
    dataFim: "2024-12-31T23:59:59Z",
    status: "ATIVA",
    vendedor: mockVendedor,
  },
  {
    id: "3",
    titulo: "PlayStation 5 + 2 Controles",
    descricao: "PS5 edição padrão com 2 controles DualSense e 3 jogos AAA à sua escolha!",
    imagemUrl: "/playstation-5-console.png",
    precoPorNumero: 5.0,
    quantidadeNumeros: 2000,
    numerosVendidos: 1654,
    dataInicio: "2024-02-01T00:00:00Z",
    dataFim: "2024-12-31T23:59:59Z",
    status: "ATIVA",
    vendedor: mockVendedor,
  },
  {
    id: "4",
    titulo: "Smart TV 65' 4K OLED",
    descricao: "Smart TV LG OLED 65 polegadas, 4K, HDR, 120Hz. A melhor imagem para sua casa!",
    imagemUrl: "/oled-tv-65-inch.jpg",
    precoPorNumero: 8.0,
    quantidadeNumeros: 1500,
    numerosVendidos: 923,
    dataInicio: "2024-01-20T00:00:00Z",
    dataFim: "2024-12-31T23:59:59Z",
    status: "ATIVA",
    vendedor: mockVendedor,
  },
  {
    id: "5",
    titulo: "Apple Watch Ultra 2",
    descricao: "Apple Watch Ultra 2 com GPS + Cellular. O relógio mais avançado da Apple!",
    imagemUrl: "/apple-watch-ultra-2.jpg",
    precoPorNumero: 12.0,
    quantidadeNumeros: 800,
    numerosVendidos: 456,
    dataInicio: "2024-02-10T00:00:00Z",
    dataFim: "2024-12-31T23:59:59Z",
    status: "ATIVA",
    vendedor: mockVendedor,
  },
  {
    id: "6",
    titulo: "Moto Honda CG 160",
    descricao: "Moto Honda CG 160 Start 0km, ano 2024. Documentação inclusa!",
    imagemUrl: "/honda-cg-160-motorcycle.jpg",
    precoPorNumero: 20.0,
    quantidadeNumeros: 3000,
    numerosVendidos: 2145,
    dataInicio: "2024-01-05T00:00:00Z",
    dataFim: "2024-12-31T23:59:59Z",
    status: "ATIVA",
    vendedor: mockVendedor,
  },
]

// Gera números disponíveis mock
export function getMockNumerosDisponiveis(rifaId: string): number[] {
  const rifa = mockRifas.find((r) => r.id === rifaId)
  if (!rifa) return []

  const numerosVendidos = Math.floor(rifa.quantidadeNumeros * 0.6) // 60% vendidos
  const todosNumeros = Array.from({ length: rifa.quantidadeNumeros }, (_, i) => i + 1)

  // Remove alguns números aleatórios para simular vendidos
  const disponiveis = todosNumeros.filter(() => Math.random() > 0.6)

  return disponiveis.slice(0, rifa.quantidadeNumeros - numerosVendidos)
}

// Estatísticas mock
export function getMockEstatisticas(rifaId: string) {
  const rifa = mockRifas.find((r) => r.id === rifaId)
  if (!rifa) {
    return {
      totalNumeros: 0,
      numerosVendidos: 0,
      numerosDisponiveis: 0,
      valorArrecadado: 0,
      percentualVendido: 0,
    }
  }

  return {
    totalNumeros: rifa.quantidadeNumeros,
    numerosVendidos: rifa.numerosVendidos,
    numerosDisponiveis: rifa.quantidadeNumeros - rifa.numerosVendidos,
    valorArrecadado: rifa.numerosVendidos * rifa.precoPorNumero,
    percentualVendido: (rifa.numerosVendidos / rifa.quantidadeNumeros) * 100,
  }
}
