const API_BASE_URL = "http://localhost:8080/api/v1"

// Tipos baseados na API
export type RoleUsuario = "CLIENTE" | "VENDEDOR" | "ADMIN"
export type TipoRifa = "GRATUITA" | "PAGA_MANUAL" | "PAGA_AUTOMATICA"

export interface Usuario {
  id: string
  nome: string
  email: string
  telefone?: string
  cpf?: string
  role: RoleUsuario
}

export interface RegistrarUsuarioRequest {
  nome: string
  email: string
  cpf?: string
  telefone?: string
  senha: string
  role?: RoleUsuario
}

export interface Rifa {
  id: string
  usuarioId: string
  nomeVendedor: string
  emailVendedor: string
  titulo: string
  descricao: string
  imagemUrl?: string
  quantidadeNumeros: number
  precoPorNumero: number
  valorTotal: number
  status: "ATIVA" | "COMPLETA" | "CANCELADA" | "SORTEADA"
  dataInicio: string
  dataLimite: string
  dataSorteio?: string
  numeroVencedor?: number
  compradorVencedorId?: string
  nomeVencedor?: string
  sorteioAutomatico: boolean
  sortearAoVenderTudo: boolean
  dataCriacao: string
  dataAtualizacao: string
  tipo?: TipoRifa
  repassarTaxaCliente: boolean
  // Campos calculados/derivados (para compatibilidade com UI) - SEMPRE PRESENTES
  numerosVendidos: number
  vendedor?: {
    id: string
    nome: string
    email: string
    role: RoleUsuario
  }
}

export interface Compra {
  id: string
  rifa: Rifa
  comprador: Usuario
  numeros: number[]
  valorTotal: number
  status: "PENDENTE" | "PAGO" | "CANCELADO" | "EXPIRADO"
  dataCriacao: string
  comprovante_url?: string
  pagamento?: {
    id: string
    qrCode: string
    qrCodeBase64: string
    txid: string
    valor: number
    status: string
  }
}

/**
 * Response de compra do backend - usado para comprovantes
 */
export interface CompraResponse {
  id: string
  rifaId: string
  tituloRifa: string
  compradorId: string
  nomeComprador: string
  status: "PENDENTE" | "PAGO" | "CANCELADO" | "EXPIRADO"
  valorTotal: number
  quantidadeNumeros: number
  numeros: number[]
  dataExpiracao: string
  dataCriacao: string
  dataAtualizacao: string
  comprovanteUrl: string | null
  dataUploadComprovante: string | null
  dataConfirmacao: string | null
  observacaoVendedor: string | null
}

/**
 * Response paginado de compras
 */
export interface PagedResponse<T> {
  content: T[]
  pageable: {
    pageNumber: number
    pageSize: number
    sort: any
    offset: number
    paged: boolean
    unpaged: boolean
  }
  totalPages: number
  totalElements: number
  last: boolean
  size: number
  number: number
  first: boolean
  numberOfElements: number
  empty: boolean
}

export interface ReservaResponse {
  compraId: string;
  rifaId: string;
  tituloRifa: string;
  tipoRifa: TipoRifa;
  quantidadeNumeros: number;
  numeros: number[];
  valorTotal: number;
  status: 'PENDENTE' | 'CONFIRMADO' | 'PAGO' | 'EXPIRADO' | 'CANCELADO';
  dataExpiracao?: string;
  minutosParaExpirar?: number;

  // Para rifas PAGA_MANUAL
  pagamentoManual?: {
    chavePix: string;
    nomeVendedor: string;
    emailVendedor: string;
    valor: number;
    mensagem: string;
  };

  // Para rifas PAGA_AUTOMATICA
  pagamento?: {
    id: string;
    qrCode: string;
    qrCodePayload: string;
    status: 'AGUARDANDO' | 'APROVADO' | 'RECUSADO' | 'EXPIRADO';
    dataExpiracao: string;
  };
}

export interface PagamentoPixResponse {
  id: string
  compraId?: string
  qrCode?: string
  qrCodePayload?: string
  qrCodeBase64?: string
  status?: string
  dataExpiracao?: string
}

export interface FallbackPagamentoResponse {
  erro: string
  mensagem: string
  chavePix?: string
  nomeVendedor?: string
  valorPagar?: number
  compraId?: string
  urlUploadComprovante?: string
}

export interface ComprovanteUploadResponse {
  compraId: string;
  comprovanteUrl: string;
  dataUpload: string;
  mensagem: string;
}

export interface Sorteio {
  id: string
  rifaId: string
  tituloRifa: string
  numeroSorteado: number
  compradorVencedorId: string
  nomeVencedor: string
  emailVencedor: string
  metodo: string
  hashVerificacao: string
  dataSorteio: string
  observacoes?: string
}

export interface ImagemUploadResponse {
  url: string
  publicId: string
  secureUrl: string
}

import { mockRifas, getMockNumerosDisponiveis, getMockEstatisticas } from "./mock-data"

let useMockData = false

function shouldUseMock(): boolean {
  return useMockData
}

export function enableMockMode() {
  useMockData = true
  console.log("[v0] Modo mock ativado - usando dados de desenvolvimento")
}

export function isMockMode(): boolean {
  return useMockData
}

// Função para normalizar resposta de Rifa do backend
function normalizarRifa(item: any): Rifa {
  const imagemUrl: string | undefined =
    item.imagemUrl || item.imagem || item.image || item.imageUrl || undefined

  const precoPorNumero: number =
    typeof item.precoPorNumero === "number"
      ? item.precoPorNumero
      : typeof item.valorNumero === "number"
        ? item.valorNumero
        : 0

  const statusMap: Record<string, Rifa["status"]> = {
    ATIVA: "ATIVA",
    COMPLETA: "COMPLETA",
    CANCELADA: "CANCELADA",
    SORTEADA: "SORTEADA",
    ENCERRADA: "COMPLETA",
  }

  const status: Rifa["status"] = statusMap[String(item.status || "ATIVA").toUpperCase()] || "ATIVA"

  // Calcula numerosVendidos se não existir (compatibilidade com novo response)
  const numerosVendidos = item.numerosVendidos !== undefined
    ? Number(item.numerosVendidos)
    : (item.quantidadeNumeros && item.valorTotal && item.precoPorNumero)
      ? Math.round(item.valorTotal / item.precoPorNumero)
      : 0

  return {
    id: String(item.id),
    usuarioId: String(item.usuarioId || ""),
    nomeVendedor: String(item.nomeVendedor || ""),
    emailVendedor: String(item.emailVendedor || ""),
    titulo: String(item.titulo || item.nome || "Rifa"),
    descricao: String(item.descricao || item.description || ""),
    imagemUrl,
    quantidadeNumeros: Number(item.quantidadeNumeros || item.qtdNumeros || 0),
    precoPorNumero,
    valorTotal: Number(item.valorTotal || 0),
    status,
    dataInicio: String(item.dataInicio || item.inicio || new Date().toISOString()),
    dataLimite: String(item.dataLimite || item.dataFim || item.fim || new Date().toISOString()),
    dataSorteio: item.dataSorteio ? String(item.dataSorteio) : undefined,
    numeroVencedor: item.numeroVencedor ? Number(item.numeroVencedor) : undefined,
    compradorVencedorId: item.compradorVencedorId ? String(item.compradorVencedorId) : undefined,
    nomeVencedor: item.nomeVencedor ? String(item.nomeVencedor) : undefined,
    sorteioAutomatico: Boolean(item.sorteioAutomatico),
    sortearAoVenderTudo: Boolean(item.sortearAoVenderTudo),
    dataCriacao: String(item.dataCriacao || new Date().toISOString()),
    dataAtualizacao: String(item.dataAtualizacao || new Date().toISOString()),
    tipo: item.tipo || item.tipoRifa || "PAGA_AUTOMATICA",
    repassarTaxaCliente: Boolean(item.repassarTaxaCliente),
    numerosVendidos,
    vendedor: item.vendedor || item.seller || {
      id: item.usuarioId || "0",
      nome: item.nomeVendedor || "",
      email: item.emailVendedor || "",
      role: "VENDEDOR",
    },
  }
}

// Funções de autenticação
export async function login(email: string, senha: string): Promise<{ token: string; usuario: Usuario }> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    })
    return handleResponse(response)
  } catch (error) {
    console.error("[v0] Erro no login:", error)
    throw error
  }
}

export async function register(data: RegistrarUsuarioRequest): Promise<{ token: string; usuario: Usuario }> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    return handleResponse(response)
  } catch (error) {
    console.error("[v0] Erro no registro:", error)
    throw error
  }
}

export async function getMe(token: string): Promise<Usuario> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return handleResponse(response)
  } catch (error) {
    console.error("[v0] Erro ao buscar usuário:", error)
    throw error
  }
}

// Funções de rifas
export async function getRifas(): Promise<Rifa[]> {
  if (shouldUseMock()) {
    return Promise.resolve(mockRifas)
  }

  try {
    console.log("Buscando rifas em:", `${API_BASE_URL}/rifas`)
    const response = await fetch(`${API_BASE_URL}/rifas`)
    const data = (await handleResponse(response)) as { content?: any[] } | any[]
    const items = Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : []

    // Normaliza usando a função auxiliar
    const normalized: Rifa[] = items.map((item: any) => normalizarRifa(item))

    return normalized
  } catch (error) {
    console.error("[v0] Erro ao buscar rifas:", error)
    console.log("[v0] API não disponível, ativando modo mock")
    enableMockMode()
    return mockRifas
  }
}

export async function getRifa(id: string): Promise<Rifa> {
  if (shouldUseMock()) {
    const rifa = mockRifas.find((r) => r.id === id)
    if (!rifa) throw new Error("Rifa não encontrada")
    return Promise.resolve(rifa)
  }

  try {
    const response = await fetch(`${API_BASE_URL}/rifas/${id}`)
    return handleResponse(response)
  } catch (error) {
    console.error("[v0] Erro ao buscar rifa:", error)
    enableMockMode()
    const rifa = mockRifas.find((r) => r.id === id)
    if (!rifa) throw new Error("Rifa não encontrada")
    return rifa
  }
}

export async function getMinhasRifas(token: string): Promise<Rifa[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/rifas/minhas`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return handleResponse(response)
  } catch (error) {
    console.error("[v0] Erro ao buscar minhas rifas:", error)
    throw error
  }
}

export async function criarRifa(
  token: string,
  data: {
    titulo: string
    descricao: string
    precoPorNumero: number
    quantidadeNumeros: number
    dataLimite: string
    sortearAoVenderTudo: boolean
    tipo: TipoRifa
  },
  imagem?: File
): Promise<Rifa> {
  try {
    console.log(`[v0] Criando rifa com endpoint unificado...`)

    const formData = new FormData()

    // Adiciona os dados da rifa como JSON
    const rifaData = new Blob([JSON.stringify(data)], { type: 'application/json' });
    formData.append("rifa", rifaData)
    console.log(`[v0] Dados da rifa:`, rifaData)

    // Adiciona a imagem se fornecida
    if (imagem) {
      formData.append("imagem", imagem)
      console.log(`[v0] Imagem incluída: ${imagem.name} (${imagem.size} bytes, tipo: ${imagem.type})`)
    } else {
      console.log(`[v0] Nenhuma imagem fornecida`)
    }

    // Debug: verificar o que está sendo enviado
    console.log(`[v0] FormData entries:`)
    for (const [key, value] of formData.entries()) {
      console.log(`[v0] - ${key}:`, value)
    }

    // Usar XMLHttpRequest para melhor controle do FormData
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.open('POST', `${API_BASE_URL}/rifas`, true)
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      // NÃO definir Content-Type - deixar o navegador definir automaticamente

      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText)
            console.log("[v0] Rifa criada com sucesso:", result)
            resolve(result)
          } catch (parseError) {
            console.error("[v0] Erro ao fazer parse da resposta:", parseError)
            reject(new Error("Resposta inválida do servidor"))
          }
        } else {
          console.error(`[v0] Erro HTTP ${xhr.status}:`, xhr.responseText)
          let errorMessage = `Erro ${xhr.status}: ${xhr.statusText}`
          try {
            const errorData = JSON.parse(xhr.responseText)
            errorMessage = errorData.message || errorData.error || errorMessage
          } catch {
            // Se não conseguir fazer parse do JSON, usa a mensagem padrão
          }
          reject(new Error(errorMessage))
        }
      }

      xhr.onerror = function () {
        console.error("[v0] Erro de rede:", xhr.statusText)
        reject(new Error("Erro de rede"))
      }

      xhr.ontimeout = function () {
        console.error("[v0] Timeout da requisição")
        reject(new Error("Timeout da requisição"))
      }

      // Definir timeout de 30 segundos
      xhr.timeout = 30000

      // Enviar o FormData
      xhr.send(formData)
    })

  } catch (error) {
    console.error("[v0] Erro ao criar rifa:", error)
    throw error
  }
}

export async function getNumerosDisponiveis(rifaId: string): Promise<number[]> {
  if (shouldUseMock()) {
    return Promise.resolve(getMockNumerosDisponiveis(rifaId))
  }

  try {
    const response = await fetch(`${API_BASE_URL}/rifas/${rifaId}/numeros/disponiveis`)
    return handleResponse(response)
  } catch (error) {
    console.error("[v0] Erro ao buscar números disponíveis:", error)
    enableMockMode()
    return getMockNumerosDisponiveis(rifaId)
  }
}

export async function getEstatisticas(rifaId: string): Promise<{
  totalNumeros: number
  numerosVendidos: number
  numerosDisponiveis: number
  valorArrecadado: number
  percentualVendido: number
}> {
  if (shouldUseMock()) {
    return Promise.resolve(getMockEstatisticas(rifaId))
  }

  try {
    const response = await fetch(`${API_BASE_URL}/rifas/${rifaId}/estatisticas`)
    const data = (await handleResponse(response)) as any

    // Normaliza para garantir que numerosVendidos sempre é um número
    return {
      totalNumeros: Number(data?.totalNumeros ?? 0),
      numerosVendidos: Number(data?.numerosVendidos ?? 0),
      numerosDisponiveis: Number(data?.numerosDisponiveis ?? 0),
      valorArrecadado: Number(data?.valorArrecadado ?? 0),
      percentualVendido: Number(data?.percentualVendido ?? 0),
    }
  } catch (error) {
    console.error("[v0] Erro ao buscar estatísticas:", error)
    enableMockMode()
    return getMockEstatisticas(rifaId)
  }
}

// Funções de compras
export async function reservarNumeros(
  token: string,
  data: {
    rifaId: string
    quantidade: number
    numeros?: number[]
  },
): Promise<ReservaResponse> {  // ✅ Mudou de Compra para ReservaResponse
  try {
    const url = `${API_BASE_URL}/compras/reservar`
    const bodyString = JSON.stringify(data)
    console.debug('[v0] POST %s body: %s', url, bodyString)

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: bodyString,
    })

    const locationHeader = response.headers.get("Location") || response.headers.get("location")
    const parsed = await handleResponse<any>(response)

    // ✅ Extrai compraId de forma mais robusta
    let compraId: string =
      parsed?.compraId ||
      parsed?.id ||
      parsed?.data?.compraId ||
      parsed?.data?.id ||
      (locationHeader?.match(/[0-9a-fA-F-]{36}$/)?.[0]) ||
      ''

    if (!compraId) {
      console.error('[v0] Não foi possível extrair compraId da resposta:', parsed)
      throw new Error('Resposta inválida do servidor: compraId não encontrado')
    }

    // ✅ Normaliza a resposta para o formato ReservaResponse
    const reserva: ReservaResponse = {
      compraId: compraId,
      rifaId: parsed.rifaId || data.rifaId,
      tituloRifa: parsed.tituloRifa || parsed.rifa?.titulo || '',
      tipoRifa: parsed.tipoRifa || parsed.tipo || 'PAGA_AUTOMATICA',
      quantidadeNumeros: parsed.quantidadeNumeros || data.quantidade,
      numeros: parsed.numeros || [],
      valorTotal: parsed.valorTotal || 0,
      status: parsed.status || 'PENDENTE',
      dataExpiracao: parsed.dataExpiracao,
      minutosParaExpirar: parsed.minutosParaExpirar,

      // ✅ Garante que pagamentoManual existe se for PAGA_MANUAL
      pagamentoManual: parsed.pagamentoManual ? {
        chavePix: parsed.pagamentoManual.chavePix || '',
        nomeVendedor: parsed.pagamentoManual.nomeVendedor || '',
        emailVendedor: parsed.pagamentoManual.emailVendedor || '',
        valor: parsed.pagamentoManual.valor || parsed.valorTotal || 0,
        mensagem: parsed.pagamentoManual.mensagem || 'Envie o comprovante após realizar o pagamento'
      } : undefined,

      // ✅ Garante que pagamento existe se houver
      pagamento: parsed.pagamento ? {
        id: parsed.pagamento.id,
        qrCode: parsed.pagamento.qrCode || parsed.pagamento.qrCodeBase64 || '',
        qrCodePayload: parsed.pagamento.qrCodePayload || parsed.pagamento.txid || '',
        status: parsed.pagamento.status || 'AGUARDANDO',
        dataExpiracao: parsed.pagamento.dataExpiracao || parsed.dataExpiracao || ''
      } : undefined
    }

    console.debug('[v0] ReservaResponse normalizada:', reserva)
    return reserva

  } catch (error) {
    console.error("[v0] Erro ao reservar números:", error)
    throw error
  }
}

export async function uploadComprovante(
  token: string,
  compraId: string,
  arquivo: File
): Promise<ComprovanteUploadResponse> {
  try {
    const formData = new FormData();
    formData.append('comprovante', arquivo);

    const response = await fetch(`${API_BASE_URL}/compras/${compraId}/comprovante`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    return handleResponse(response);
  } catch (error) {
    console.error('[v0] Erro ao enviar comprovante:', error);
    throw error;
  }
}

/**
 * Consultar status de pagamento PIX
 */
export async function consultarPagamentoPix(
  token: string,
  compraId: string
): Promise<ReservaResponse['pagamento']> {
  try {
    const url = `${API_BASE_URL}/compras/${compraId}/pagamento`
    console.debug('[v0] GET %s', url)
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return handleResponse(response);
  } catch (error) {
    console.error('[v0] Erro ao consultar pagamento:', error);
    throw error;
  }
}

export async function gerarPagamentoPix(token: string, compraId: string): Promise<PagamentoPixResponse | FallbackPagamentoResponse> {
  try {
    const url = `${API_BASE_URL}/compras/${compraId}/pagamento/pix`
    console.debug('[v0] POST %s (no body)', url)
    const response = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
    const handled = await handleResponse<PagamentoPixResponse | FallbackPagamentoResponse>(response)
    // Log response body
    console.debug('[v0] POST %s response: %o', url, handled)
    return handled
  } catch (error) {
    console.error("[v0] Erro ao gerar pagamento:", error)
    throw error
  }
}

export async function getCompra(token: string, compraId: string): Promise<Compra> {
  try {
    const response = await fetch(`${API_BASE_URL}/compras/${compraId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return handleResponse(response)
  } catch (error) {
    console.error("[v0] Erro ao buscar compra:", error)
    throw error
  }
}

export async function getMinhasCompras(token: string): Promise<Compra[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/compras/minhas`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return handleResponse(response)
  } catch (error) {
    console.error("[v0] Erro ao buscar compras:", error)
    throw error
  }
}

// Função para buscar comprovantes pendentes de uma rifa específica
export async function getComprovantesPendentes(
  token: string,
  rifaId: string,
  page: number = 0,
  size: number = 20
): Promise<PagedResponse<CompraResponse>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/compras/rifa/${rifaId}/pendentes?page=${page}&size=${size}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    return handleResponse<PagedResponse<CompraResponse>>(response)
  } catch (error) {
    console.error("[v0] Erro ao buscar comprovantes pendentes:", error)
    throw error
  }
}

// Função para aprovar compra
export async function aprovarCompra(
  token: string,
  compraId: string,
  observacao?: string,
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/compras/${compraId}/aprovar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ observacao: observacao || "" }),
    })
    console.log("STATUS:", response.status)
    console.log("BODY:", await response.text())
    if (!response.ok) {
      let errorMessage = "Erro ao aprovar compra"
      try {
        const contentType = response.headers.get("content-type")
        if (contentType?.includes("application/json")) {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
        }
      } catch {
        errorMessage = `Erro ${response.status}: ${response.statusText}`
      }
      throw new Error(errorMessage)
    }
  } catch (error) {
    console.error("[v0] Erro ao aprovar compra:", error)
    throw error
  }
}

// Função para rejeitar compra
export async function rejeitarCompra(
  token: string,
  compraId: string,
  observacao?: string,
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/compras/${compraId}/rejeitar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ observacao: observacao || "" }),
    })

    if (!response.ok) {
      let errorMessage = "Erro ao rejeitar compra"
      try {
        const contentType = response.headers.get("content-type")
        if (contentType?.includes("application/json")) {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
        }
      } catch {
        errorMessage = `Erro ${response.status}: ${response.statusText}`
      }
      throw new Error(errorMessage)
    }
  } catch (error) {
    console.error("[v0] Erro ao rejeitar compra:", error)
    throw error
  }
}

// Funções de sorteio
export async function realizarSorteio(token: string, rifaId: string): Promise<Sorteio> {
  try {
    const response = await fetch(`${API_BASE_URL}/sorteios/rifa/${rifaId}/sortear`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
    return handleResponse(response)
  } catch (error) {
    console.error("[v0] Erro ao realizar sorteio:", error)
    throw error
  }
}

export async function getSorteio(rifaId: string): Promise<Sorteio> {
  try {
    const response = await fetch(`${API_BASE_URL}/sorteios/rifa/${rifaId}`)
    return handleResponse(response)
  } catch (error) {
    console.error("[v0] Erro ao buscar sorteio:", error)
    throw error
  }
}

// Funções de upload de imagem
export async function uploadImagemRifa(
  token: string,
  rifaId: string,
  file: File
): Promise<ImagemUploadResponse> {
  try {
    // Validação do arquivo
    if (!file.type.startsWith('image/')) {
      throw new Error('Arquivo deve ser uma imagem válida')
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      throw new Error('Arquivo deve ter no máximo 5MB')
    }

    const formData = new FormData()
    formData.append("imagem", file)

    console.log(`[v0] Fazendo upload da imagem para rifa ${rifaId}...`)

    const response = await fetch(`${API_BASE_URL}/imagens/rifa/${rifaId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[v0] Erro HTTP ${response.status}:`, errorText)

      let errorMessage = `Erro ${response.status}: ${response.statusText}`
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch {
        // Se não conseguir fazer parse do JSON, usa a mensagem padrão
      }

      throw new Error(errorMessage)
    }

    const result = await handleResponse<ImagemUploadResponse>(response)
    console.log("[v0] Upload da imagem realizado com sucesso:", result)
    return result
  } catch (error) {
    console.error("[v0] Erro ao fazer upload da imagem:", error)
    throw error
  }
}

export async function atualizarRifa(
  token: string,
  rifaId: string,
  data: {
    titulo?: string
    descricao?: string
    imagemUrl?: string
    precoPorNumero?: number
    quantidadeNumeros?: number
    dataLimite?: string
    sortearAoVenderTudo?: boolean
  }
): Promise<Rifa> {
  try {
    const response = await fetch(`${API_BASE_URL}/rifas/${rifaId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    return handleResponse(response)
  } catch (error) {
    console.error("[v0] Erro ao atualizar rifa:", error)
    throw error
  }
}

export async function deletarImagem(
  token: string,
  publicId: string
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/imagens/${publicId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Erro ao deletar imagem")
    }
  } catch (error) {
    console.error("[v0] Erro ao deletar imagem:", error)
    throw error
  }
}

// Funções de gerenciamento de rifas
export async function cancelarRifa(
  token: string,
  rifaId: string
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/rifas/${rifaId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      let errorMessage = "Erro ao cancelar rifa"
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch {
        errorMessage = `Erro ${response.status}: ${response.statusText}`
      }
      throw new Error(errorMessage)
    }

    // Não tenta fazer parse de JSON pois o backend retorna 204 No Content
  } catch (error) {
    console.error("[v0] Erro ao cancelar rifa:", error)
    throw error
  }
}

// ==============================================
// FUNÇÕES UTILITÁRIAS (Refatoradas)
// ==============================================

/**
 * Validar arquivo antes de enviar
 */
export function validarArquivo(
  file: File
): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
  if (!allowedTypes.includes(file.type)) {
    errors.push("Apenas arquivos JPG, PNG ou WEBP são permitidos")
  }

  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    errors.push("Arquivo deve ter no máximo 5MB")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Formatar data para exibição
 */
export function formatarData(dataISO: string): string {
  return new Date(dataISO).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Calcular tempo restante até expiração
 */
export function calcularTempoRestante(dataExpiracao: string): string {
  const agora = new Date()
  const expira = new Date(dataExpiracao)
  const diff = expira.getTime() - agora.getTime()

  if (diff <= 0) return "Expirado"

  const minutos = Math.floor(diff / 60000)
  const horas = Math.floor(minutos / 60)
  const mins = minutos % 60

  if (horas > 0) {
    return `${horas}h ${mins}min`
  }
  return `${mins} minutos`
}

// Função auxiliar para tratar respostas da API
async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type")

  // Verifica se a resposta é JSON
  if (!contentType || !contentType.includes("application/json")) {
    console.error("[v0] API retornou conteúdo não-JSON:", contentType)
    throw new Error("API não está disponível ou retornou formato inválido")
  }

  if (!response.ok) {
    let errorMessage = "Erro na requisição"
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorData.error || errorMessage
    } catch {
      errorMessage = `Erro ${response.status}: ${response.statusText}`
    }
    throw new Error(errorMessage)
  }

  return response.json()
}
