"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, X, Image as ImageIcon, Loader2, Link as LinkIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  onImageSelect: (file: File | null) => void
  onImageUpload: (url: string) => void
  onUrlChange?: (url: string) => void
  currentImageUrl?: string
  disabled?: boolean
  className?: string
  allowUrl?: boolean
}

export function ImageUpload({ 
  onImageSelect, 
  onImageUpload, 
  onUrlChange,
  currentImageUrl, 
  disabled = false,
  className,
  allowUrl = true
}: ImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [urlInput, setUrlInput] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"upload" | "url">("upload")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    // Validação do arquivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione apenas arquivos de imagem')
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      setError('A imagem deve ter no máximo 5MB')
      return
    }

    setError(null)
    setSelectedFile(file)
    
    // Criar preview da imagem
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
    
    onImageSelect(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleUrlChange = (url: string) => {
    setUrlInput(url)
    setError(null)
    
    // Validação básica de URL
    if (url && !url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      setError('URL deve apontar para uma imagem válida')
      return
    }
    
    onUrlChange?.(url)
  }

  const clearImage = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setUrlInput("")
    setError(null)
    onImageSelect(null)
    onUrlChange?.("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const displayUrl = previewUrl || urlInput || currentImageUrl

  return (
    <div className={cn("space-y-4", className)}>
      <Label className="text-sm font-medium">Imagem da Rifa</Label>
      
      {allowUrl ? (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "upload" | "url")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" disabled={disabled}>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="url" disabled={disabled}>
              <LinkIcon className="h-4 w-4 mr-2" />
              URL
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            {/* Área de upload */}
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                disabled 
                  ? "border-muted bg-muted/50 cursor-not-allowed" 
                  : "border-muted-foreground/25 hover:border-muted-foreground/50 cursor-pointer",
                error && "border-destructive"
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => !disabled && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
                disabled={disabled}
              />

              {previewUrl ? (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-48 max-w-full rounded-lg object-cover"
                    />
                    {!disabled && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation()
                          clearImage()
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedFile?.name}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {disabled ? "Upload desabilitado" : "Clique para fazer upload"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ou arraste uma imagem aqui
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG até 5MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Input
                type="url"
                placeholder="https://exemplo.com/imagem.jpg"
                value={urlInput}
                onChange={(e) => handleUrlChange(e.target.value)}
                disabled={disabled}
              />
              <p className="text-xs text-muted-foreground">
                Cole a URL da imagem (JPG, PNG, GIF, WebP)
              </p>
            </div>
            
            {urlInput && (
              <div className="space-y-2">
                <img
                  src={urlInput}
                  alt="Preview"
                  className="max-h-48 max-w-full rounded-lg object-cover"
                  onError={() => setError("Não foi possível carregar a imagem")}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        // Versão sem tabs (apenas upload)
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
            disabled 
              ? "border-muted bg-muted/50 cursor-not-allowed" 
              : "border-muted-foreground/25 hover:border-muted-foreground/50 cursor-pointer",
            error && "border-destructive"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={disabled}
          />

          {displayUrl ? (
            <div className="space-y-4">
              <div className="relative inline-block">
                <img
                  src={displayUrl}
                  alt="Preview"
                  className="max-h-48 max-w-full rounded-lg object-cover"
                />
                {!disabled && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation()
                      clearImage()
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {selectedFile ? selectedFile.name : "Imagem atual"}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {disabled ? "Upload desabilitado" : "Clique para fazer upload"}
                </p>
                <p className="text-xs text-muted-foreground">
                  ou arraste uma imagem aqui
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG até 5MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mensagem de erro */}
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
          {error}
        </div>
      )}

      {/* Botão de upload manual */}
      {selectedFile && !disabled && allowUrl && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4 mr-2" />
          Trocar Imagem
        </Button>
      )}
    </div>
  )
}
