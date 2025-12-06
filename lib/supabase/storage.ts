import { createClient } from "./client"

const BUCKET_NAME = "images"

export async function uploadImage(file: File, folder = "general"): Promise<string | null> {
  const supabase = createClient()

  // Gerar nome único
  const fileExt = file.name.split(".").pop()
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

  const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, file, {
    cacheControl: "3600",
    upsert: false,
  })

  if (error) {
    console.error("Upload error:", error)
    return null
  }

  // Retornar URL pública
  const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path)

  return urlData.publicUrl
}

export async function deleteImage(url: string): Promise<boolean> {
  const supabase = createClient()

  // Extrair path do URL
  const urlObj = new URL(url)
  const pathParts = urlObj.pathname.split("/storage/v1/object/public/images/")
  if (pathParts.length < 2) return false

  const filePath = pathParts[1]

  const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath])

  if (error) {
    console.error("Delete error:", error)
    return false
  }

  return true
}

export async function uploadBase64Image(base64: string, folder = "general"): Promise<string | null> {
  // Converter base64 para File
  const response = await fetch(base64)
  const blob = await response.blob()

  // Detectar tipo de imagem
  const mimeType = blob.type || "image/png"
  const extension = mimeType.split("/")[1] || "png"

  const file = new File([blob], `image.${extension}`, { type: mimeType })

  return uploadImage(file, folder)
}
