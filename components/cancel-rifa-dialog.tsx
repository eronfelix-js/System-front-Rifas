"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { AlertTriangle, Loader2 } from "lucide-react"
import { cancelarRifa, type Rifa } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

interface CancelRifaDialogProps {
  rifa: Rifa
  onCancelSuccess: () => void
  children: React.ReactNode
}

export function CancelRifaDialog({ rifa, onCancelSuccess, children }: CancelRifaDialogProps) {
  const { token } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Verifica se a rifa tem números vendidos
  const temNumerosVendidos = rifa.numerosVendidos > 0

  const handleCancel = async () => {
    if (!token) {
      setError("Token de autenticação não encontrado")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      await cancelarRifa(token, rifa.id)
      setIsOpen(false)
      onCancelSuccess()
    } catch (err) {
      console.error("Erro ao cancelar rifa:", err)
      setError(err instanceof Error ? err.message : "Erro ao cancelar rifa")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setError("")
    }
    setIsOpen(open)
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {temNumerosVendidos ? "Não é possível cancelar" : "Cancelar Rifa"}
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-4">
          {temNumerosVendidos ? (
            // Estado: Rifa com números vendidos
            <>
              <div className="space-y-2">
                <div className="text-sm">
                  A rifa <strong>"{rifa.titulo}"</strong> não pode ser cancelada porque já possui números vendidos.
                </div>
                <div className="text-sm text-muted-foreground">
                  Rifas com números vendidos devem ser mantidas até o final do sorteio ou até que o vendedor entre em contato com o suporte para resolução.
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Números vendidos:</strong> {rifa.numerosVendidos} de {rifa.quantidadeNumeros}
                  </div>
                </div>
                <div className="text-xs text-yellow-700 dark:text-yellow-300">
                  Valor arrecadado: R$ {(rifa.numerosVendidos * rifa.precoPorNumero).toFixed(2)}
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Entre em contato com o suporte se precisar cancelar esta rifa.
              </div>
            </>
          ) : (
            // Estado: Rifa sem números vendidos (pode cancelar)
            <>
              <div className="space-y-2">
                <div>
                  Tem certeza que deseja cancelar a rifa <strong>"{rifa.titulo}"</strong>?
                </div>
                <div className="text-sm text-muted-foreground">
                  Esta ação não pode ser desfeita e a rifa será marcada como cancelada.
                </div>
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                  {error}
                </div>
              )}

              <div className="bg-muted/50 p-3 rounded-lg space-y-1">
                <div className="text-sm font-medium">Detalhes da rifa:</div>
                <div className="text-xs text-muted-foreground">
                  • {rifa.numerosVendidos} números vendidos de {rifa.quantidadeNumeros}
                </div>
                <div className="text-xs text-muted-foreground">
                  • Valor arrecadado: R$ {(rifa.numerosVendidos * rifa.precoPorNumero).toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  • Status atual: {rifa.status}
                </div>
              </div>
            </>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {temNumerosVendidos ? "Fechar" : "Não, Manter Rifa"}
          </AlertDialogCancel>
          {!temNumerosVendidos && (
            <AlertDialogAction
              onClick={handleCancel}
              disabled={isLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelando...
                </>
              ) : (
                "Sim, Cancelar Rifa"
              )}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
