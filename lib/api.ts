const API_BASE_URL =  "http://localhost:8080/api/v1"

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
  titulo: string
  descricao: string
  tipo?: TipoRifa
  imagemUrl?: string
  precoPorNumero: number
  quantidadeNumeros: number
  numerosVendidos: number
  dataInicio: string
  dataFim: string
  status: "ATIVA" | "COMPLETA" | "CANCELADA" | "SORTEADA"
  vendedor: Usuario
}

export interface Compra {
  id: string
  rifa: Rifa
  comprador: Usuario
  numeros: number[]
  valorTotal: number
  status: "PENDENTE" | "PAGO" | "CANCELADO" | "EXPIRADO"
  dataCriacao: string
  pagamento?: {
    id: string
    qrCode: string
    qrCodeBase64: string
    txid: string
    valor: number
    status: string
  }
}

export interface ReservaResponse{
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
  rifa: Rifa
  numeroSorteado: number
  ganhador: Usuario
  dataSorteio: string
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

    // Normaliza campos para compatibilidade (imagem, preço, status)
    const normalized: Rifa[] = items.map((item: any) => {
      const imagemUrl: string | undefined =
        item.imagemUrl || item.imagem || item.image || item.imageUrl || undefined

      const precoPorNumero: number =
        typeof item.precoPorNumero === "number"
          ? item.precoPorNumero
          : typeof item.valorNumero === "number"
          ? item.valorNumero
          : 0

      // Mapeia possíveis status do backend para os esperados pelo front
      const statusMap: Record<string, Rifa["status"]> = {
        ATIVA: "ATIVA",
        COMPLETA: "COMPLETA",
        CANCELADA: "CANCELADA",
        SORTEADA: "SORTEADA",
        ENCERRADA: "COMPLETA", // compatibilidade
      }

      let status: Rifa["status"] = statusMap[String(item.status || "ATIVA").toUpperCase()] || "ATIVA"

      return {
        id: String(item.id),
        titulo: String(item.titulo || item.nome || "Rifa"),
        descricao: String(item.descricao || item.description || ""),
        imagemUrl,
        precoPorNumero,
        quantidadeNumeros: Number(item.quantidadeNumeros || item.qtdNumeros || 0),
        numerosVendidos: Number(item.numerosVendidos || item.vendidos || 0),
        dataInicio: String(item.dataInicio || item.inicio || new Date().toISOString()),
        dataFim: String(item.dataFim || item.fim || new Date().toISOString()),
        status,
        vendedor: item.vendedor || item.seller || {
          id: "0",
          nome: "",
          email: "",
          role: "VENDEDOR",
        },
      } as Rifa
    })

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
      
      xhr.onload = function() {
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
      
      xhr.onerror = function() {
        console.error("[v0] Erro de rede:", xhr.statusText)
        reject(new Error("Erro de rede"))
      }
      
      xhr.ontimeout = function() {
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
    return handleResponse(response)
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
): Promise<Compra> {
  try {
    const url = `${API_BASE_URL}/compras/reservar`
    const bodyString = JSON.stringify(data)
    // Log request details (without token)
    console.debug('[v0] POST %s body: %s', url, bodyString)

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: bodyString,
    })
    // Captura o Location antes de ler o corpo
    const locationHeader = response.headers.get("Location") || response.headers.get("location")

    // Usa o handler padrão para tratar erros e parsear JSON quando houver
    const parsed = await (async () => {
      try {
        return await handleResponse<Compra | any>(response)
      } catch (e) {
        throw e
      }
    })()

    // Garante que teremos um ID válido da compra: tenta body.id/body.compraId e, se faltar, extrai do Location
    let compraId: string | undefined = parsed?.id || parsed?.compraId || parsed?.data?.id
    if (!compraId && locationHeader) {
      const match = locationHeader.match(/[0-9a-fA-F-]{36}$/)
      if (match) compraId = match[0]
    }

    if (compraId) {
      return { ...(parsed || {}), id: String(compraId) } as Compra
    }

    return parsed as Compra
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
