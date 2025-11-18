"use client"

import { useState } from "react"
import { CompraResponse } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react"

interface ComprovantesListProps {
  compras: CompraResponse[]
  observacoes: Record<string, string>
  onObservacaoChange: (compraId: string, valor: string) => void
  onAprovar: (compraId: string) => void
  onRejeitar: (compraId: string) => void
}

export function ComprovantesList({
  compras,
  observacoes,
  onObservacaoChange,
  onAprovar,
  onRejeitar,
}: ComprovantesListProps) {
  const [erros, setErros] = useState<Record<string, string>>({})

  const validarObservacao = (compraId: string): boolean => {
    const observacao = observacoes[compraId]?.trim() || ""
    
    if (observacao.length === 0) {
      setErros((prev) => ({
        ...prev,
        [compraId]: "Observação é obrigatória",
      }))
      return false
    }

    if (observacao.length < 10) {
      setErros((prev) => ({
        ...prev,
        [compraId]: "Observação deve ter no mínimo 10 caracteres",
      }))
      return false
    }

    setErros((prev) => {
      const novoErros = { ...prev }
      delete novoErros[compraId]
      return novoErros
    })
    return true
  }

  const handleAprovar = (compraId: string) => {
    if (validarObservacao(compraId)) {
      onAprovar(compraId)
    }
  }

  const handleRejeitar = (compraId: string) => {
    if (validarObservacao(compraId)) {
      onRejeitar(compraId)
    }
  }

  if (compras.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Nenhum comprovante pendente</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {compras.map((compra) => (
        <Card key={compra.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{compra.tituloRifa}</CardTitle>
                <CardDescription>
                  {compra.nomeComprador} • {compra.compradorId}
                </CardDescription>
              </div>
              <Badge variant="secondary">
                <Clock className="h-3 w-3 mr-1" />
                {compra.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Comprovante:</p>
                  <div className="border rounded-lg overflow-hidden bg-muted min-h-64 flex items-center justify-center">
                    {compra.comprovanteUrl ? (
                      <Image
                        src={compra.comprovanteUrl}
                        alt="Comprovante"
                        width={400}
                        height={500}
                        className="w-full h-auto"
                      />
                    ) : (
                      <div className="text-center">
                        <AlertCircle className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Comprovante não disponível</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Valor Total:</p>
                  <p className="text-2xl font-bold text-primary">
                    R$ {compra.valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Números:</p>
                  <div className="flex flex-wrap gap-2">
                    {compra.numeros.map((num: number) => (
                      <Badge key={num} variant="outline">
                        {num.toString().padStart(4, "0")}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Data da Compra:</p>
                  <p className="text-sm">{new Date(compra.dataCriacao).toLocaleString("pt-BR")}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Data Upload do Comprovante:</p>
                  <p className="text-sm">
                    {compra.dataUploadComprovante
                      ? new Date(compra.dataUploadComprovante).toLocaleString("pt-BR")
                      : "-"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Observação <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={observacoes[compra.id] || ""}
                    onChange={(e) => onObservacaoChange(compra.id, e.target.value)}
                    placeholder="Adicione uma observação para o comprador... (mínimo 10 caracteres)"
                    className={`w-full px-3 py-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 ${
                      erros[compra.id]
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-primary"
                    }`}
                    rows={3}
                  />
                  {erros[compra.id] && (
                    <p className="text-sm text-red-500 mt-1">{erros[compra.id]}</p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={() => handleAprovar(compra.id)} className="flex-1">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aprovar
                  </Button>
                  <Button onClick={() => handleRejeitar(compra.id)} variant="destructive" className="flex-1">
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeitar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
