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
            Cancelar Rifa
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div>
              Tem certeza que deseja cancelar a rifa <strong>"{rifa.titulo}"</strong>?
            </div>
            <div className="text-sm text-muted-foreground">
              Esta ação não pode ser desfeita. Todos os números vendidos serão reembolsados 
              e a rifa será marcada como cancelada.
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
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Não, Manter Rifa
          </AlertDialogCancel>
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
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
