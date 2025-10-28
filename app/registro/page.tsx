"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Ticket } from "lucide-react"
import { register, type RegistrarUsuarioRequest } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

export default function RegistroPage() {
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [telefone, setTelefone] = useState("")
  const [cpf, setCpf] = useState("")
  const [senha, setSenha] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { login } = useAuth()

  const validateForm = (): string | null => {
    // Validação do nome (3-100 caracteres)
    if (nome.length < 3 || nome.length > 100) {
      return "Nome deve ter entre 3 e 100 caracteres"
    }

    // Validação do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return "Email inválido"
    }

    // Validação do CPF (11 dígitos)
    if (cpf && !/^\d{11}$/.test(cpf.replace(/\D/g, ""))) {
      return "CPF deve conter 11 dígitos"
    }

    // Validação do telefone (10-11 dígitos)
    if (telefone && !/^\d{10,11}$/.test(telefone.replace(/\D/g, ""))) {
      return "Telefone deve conter 10 ou 11 dígitos"
    }

    // Validação da senha (6-50 caracteres)
    if (senha.length < 6 || senha.length > 50) {
      return "Senha deve ter entre 6 e 50 caracteres"
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    try {
      const registerData: RegistrarUsuarioRequest = {
        nome,
        email,
        senha,
        telefone: telefone || undefined,
        cpf: cpf || undefined,
        role: "CLIENTE",
      }
      
      const { token, usuario } = await register(registerData)
      login(token, usuario)
      router.push("/")
    } catch (err) {
      setError("Erro ao criar conta. Verifique os dados e tente novamente.")
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
          <h1 className="text-2xl font-bold">Criar Conta</h1>
          <p className="text-muted-foreground text-sm mt-2">Cadastre-se para participar das rifas</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">{error}</div>}

          <div className="space-y-2">
            <label htmlFor="nome" className="text-sm font-medium">
              Nome Completo
            </label>
            <Input
              id="nome"
              type="text"
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              minLength={3}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="telefone" className="text-sm font-medium">
              Telefone (opcional)
            </label>
            <Input
              id="telefone"
              type="tel"
              placeholder="(00) 00000-0000"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="cpf" className="text-sm font-medium">
              CPF (opcional)
            </label>
            <Input
              id="cpf"
              type="text"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="senha" className="text-sm font-medium">
              Senha
            </label>
            <Input
              id="senha"
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              minLength={6}
              maxLength={50}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Criando conta..." : "Criar conta"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">Já tem uma conta? </span>
          <Link href="/login" className="text-primary font-medium hover:underline">
            Entrar
          </Link>
        </div>
      </Card>
    </div>
  )
}
