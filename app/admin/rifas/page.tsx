"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { criarRifa, uploadImagemRifa, type TipoRifa } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Ticket } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ImageUpload } from "@/components/image-upload"

export default function AdminRifasPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  
  // Estados do formulário
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string>("")
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    quantidadeNumeros: "",
    precoPorNumero: "",
    dataLimite: "",
    sortearAoVenderTudo: true,
    tipoRifa: "PAGA_AUTOMATICA" as TipoRifa,
  })

  // Verifica se o usuário é admin
  if (!user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-destructive text-destructive-foreground p-3 rounded-xl mb-4">
              <Ticket className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-destructive">Acesso Negado</h1>
            <p className="text-muted-foreground text-sm mt-2 text-center">
              Você não tem permissão para acessar esta página.
            </p>
          </div>
          <Button 
            onClick={() => router.push("/")} 
            className="w-full"
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Início
          </Button>
        </Card>
      </div>
    )
  }

  const validateForm = (): string | null => {
    if (!formData.titulo.trim()) {
      return "Título é obrigatório"
    }
    if (!formData.descricao.trim()) {
      return "Descrição é obrigatória"
    }
    if (!formData.quantidadeNumeros || parseInt(formData.quantidadeNumeros) <= 0) {
      return "Quantidade de números deve ser maior que zero"
    }
    if (!formData.precoPorNumero || parseFloat(formData.precoPorNumero) <= 0) {
      return "Preço por número deve ser maior que zero"
    }
    if (!formData.dataLimite) {
      return "Data limite é obrigatória"
    }
    
    const dataLimite = new Date(formData.dataLimite)
    const agora = new Date()
    if (dataLimite <= agora) {
      return "Data limite deve ser futura"
    }

    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      sortearAoVenderTudo: checked
    }))
  }

  const handleTipoRifaChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      tipoRifa: value as TipoRifa
    }))
  }

  // Função para criar a rifa com imagem em uma única requisição
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    if (!token) {
      setError("Token de autenticação não encontrado")
      return
    }

    setLoading(true)

    try {
      console.log("Criando rifa com endpoint unificado...")
      const rifaCriada = await criarRifa(token, {
        titulo: formData.titulo.trim(),
        descricao: formData.descricao.trim(),
        quantidadeNumeros: parseInt(formData.quantidadeNumeros),
        precoPorNumero: parseFloat(formData.precoPorNumero),
        dataLimite: formData.dataLimite,
        sortearAoVenderTudo: formData.sortearAoVenderTudo,
        tipo: formData.tipoRifa,
      }, selectedImage || undefined)

      console.log("Rifa criada com sucesso:", rifaCriada)

      // Limpa o formulário
      setFormData({
        titulo: "",
        descricao: "",
        quantidadeNumeros: "",
        precoPorNumero: "",
        dataLimite: "",
        sortearAoVenderTudo: true,
        tipoRifa: "PAGA_AUTOMATICA",
      })
      setSelectedImage(null)
      setImageUrl("")

      // Redireciona para o dashboard admin
      router.push("/admin")

    } catch (err) {
      console.error("Erro ao criar rifa:", err)
      setError(err instanceof Error ? err.message : "Erro ao criar rifa")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-8">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary text-primary-foreground p-3 rounded-xl mb-4">
            <Ticket className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold">Criar Nova Rifa</h1>
          <p className="text-muted-foreground text-sm mt-2">Preencha os dados da rifa</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">{error}</div>}

          <div className="space-y-2">
            <label htmlFor="titulo" className="text-sm font-medium">
              Título da Rifa
            </label>
            <Input
              id="titulo"
              name="titulo"
              type="text"
              placeholder="Ex: iPhone 15 Pro Max 256GB"
              value={formData.titulo}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="descricao" className="text-sm font-medium">
              Descrição
            </label>
            <Textarea
              id="descricao"
              name="descricao"
              placeholder="Descreva o prêmio da rifa..."
              value={formData.descricao}
              onChange={handleInputChange}
              rows={4}
              required
            />
          </div>

          <ImageUpload
            onImageSelect={setSelectedImage}
            onImageUpload={() => {}} // Não usado neste contexto
            onUrlChange={setImageUrl}
            disabled={loading}
            allowUrl={true}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="quantidadeNumeros" className="text-sm font-medium">
                Quantidade de Números
              </label>
              <Input
                id="quantidadeNumeros"
                name="quantidadeNumeros"
                type="number"
                placeholder="500"
                value={formData.quantidadeNumeros}
                onChange={handleInputChange}
                min="1"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="precoPorNumero" className="text-sm font-medium">
                Preço por Número (R$)
              </label>
              <Input
                id="precoPorNumero"
                name="precoPorNumero"
                type="number"
                placeholder="5.00"
                value={formData.precoPorNumero}
                onChange={handleInputChange}
                step="0.01"
                min="0.01"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="dataLimite" className="text-sm font-medium">
              Data Limite
            </label>
            <Input
              id="dataLimite"
              name="dataLimite"
              type="datetime-local"
              value={formData.dataLimite}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="tipoRifa" className="text-sm font-medium">
              Tipo de Rifa
            </label>
            <Select value={formData.tipoRifa} onValueChange={handleTipoRifaChange}>
              <SelectTrigger id="tipoRifa">
                <SelectValue placeholder="Escolha o tipo de rifa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GRATUITA">Gratuita</SelectItem>
                <SelectItem value="PAGA_MANUAL">Paga Manual</SelectItem>
                <SelectItem value="PAGA_AUTOMATICA">Paga Automática</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Gratuita: Sem pagamento | Paga Manual: Análise de pagamento | Paga Automática: Integração com gateway de pagamento
            </p>
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-1">
              <Label htmlFor="sortearAoVenderTudo" className="text-sm font-medium">
                Sortear automaticamente
              </Label>
              <p className="text-xs text-muted-foreground">
                Realizar sorteio quando todos os números forem vendidos
              </p>
            </div>
            <Switch
              id="sortearAoVenderTudo"
              checked={formData.sortearAoVenderTudo}
              onCheckedChange={handleSwitchChange}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Criando rifa..." : "Criar Rifa"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">Voltar para </span>
          <Link href="/admin" className="text-primary font-medium hover:underline">
            Painel Administrativo
          </Link>
        </div>
      </Card>
    </div>
  )
}
