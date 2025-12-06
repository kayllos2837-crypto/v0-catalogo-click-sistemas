"use client"

import type React from "react"
import { useRef, useState } from "react"
import { Upload, X, Loader2 } from "lucide-react"
import { uploadImage, deleteImage } from "@/lib/supabase/storage"

interface ImageUploadInputProps {
  label: string
  currentImage?: string
  onImageChange: (url: string) => void
  helpText?: string
  aspectRatio?: "video" | "square" | "auto"
  folder?: string
}

export const ImageUploadInput: React.FC<ImageUploadInputProps> = ({
  label,
  currentImage,
  onImageChange,
  helpText,
  aspectRatio = "auto",
  folder = "general",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Apenas imagens são permitidas")
      return
    }

    // Limite de 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError("Imagem deve ter no máximo 5MB")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const url = await uploadImage(file, folder)
      if (url) {
        onImageChange(url)
      } else {
        setError("Erro ao fazer upload da imagem")
      }
    } catch (err) {
      setError("Erro ao fazer upload da imagem")
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsHovering(true)
  }

  const handleDragLeave = () => {
    setIsHovering(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsHovering(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleRemoveImage = async () => {
    if (currentImage) {
      // Tentar deletar do storage se for URL do Supabase
      if (currentImage.includes("supabase")) {
        await deleteImage(currentImage)
      }
      onImageChange("")
    }
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-muted-foreground mb-2">{label}</label>

      <div className="flex items-start gap-4">
        {/* Preview Area */}
        {currentImage && (
          <div
            className={`relative group shrink-0 bg-muted border border-border rounded-lg overflow-hidden ${aspectRatio === "square" ? "w-24 h-24" : "w-48 h-24"}`}
          >
            <img src={currentImage || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={handleRemoveImage}
                className="p-1 bg-red-500/80 text-white rounded-full hover:bg-red-500"
                title="Remover imagem"
                disabled={isUploading}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Upload Area */}
        <div
          className={`flex-1 border-2 border-dashed rounded-lg transition-all cursor-pointer flex flex-col items-center justify-center p-4 text-center
            ${isUploading ? "opacity-50 cursor-not-allowed" : ""}
            ${
              isHovering
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary/50 hover:bg-muted/50"
            }
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />

          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mb-2 text-muted-foreground">
            {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
          </div>
          <p className="text-sm text-foreground font-medium">{isUploading ? "Enviando..." : "Clique ou arraste"}</p>
          <p className="text-xs text-muted-foreground mt-1">PNG, JPG ou WEBP (max 5MB)</p>
        </div>
      </div>

      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

      {helpText && !error && <p className="text-xs text-muted-foreground mt-2">{helpText}</p>}
    </div>
  )
}
