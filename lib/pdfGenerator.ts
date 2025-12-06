import { jsPDF } from "jspdf"
import type { Sistema, Plano, Adicional, Recurso } from "../types"
import { getConfiguracoes } from "./supabase/data-service"

interface QuotationData {
  system: Sistema
  plan: Plano
  addons: Adicional[]
  resources: Recurso[]
  clientName: string
  subTotal: number
  discount: number
  finalTotal: number
}

const extractImageData = (src: string): { data: string; format: "JPEG" | "PNG" | "WEBP" } => {
  let format: "JPEG" | "PNG" | "WEBP" = "JPEG" // Default to JPEG for smaller size
  let data = src

  if (src.startsWith("data:image/")) {
    // Extract format from data URI
    if (src.includes("data:image/jpeg") || src.includes("data:image/jpg")) {
      format = "JPEG"
    } else if (src.includes("data:image/png")) {
      format = "PNG"
    } else if (src.includes("data:image/webp")) {
      format = "WEBP"
    }
    // Keep the full data URI - jsPDF can handle it directly
    data = src
  } else if (src.match(/\.(jpeg|jpg)$/i)) {
    format = "JPEG"
  } else if (src.match(/\.png$/i)) {
    format = "PNG"
  }

  return { data, format }
}

// --- Vector Icon Helpers (Smaller & Thinner) ---

// Draw a green checkmark at (center x, center y)
const drawCheck = (doc: jsPDF, x: number, y: number, size = 1.0) => {
  doc.setDrawColor(34, 197, 94) // Green-500 (#22c55e)
  doc.setLineWidth(0.3) // Thinner line
  doc.line(x - size, y, x - size / 3, y + size)
  doc.line(x - size / 3, y + size, x + size, y - size)
}

// Draw a red cross at (center x, center y)
const drawCross = (doc: jsPDF, x: number, y: number, size = 0.8) => {
  doc.setDrawColor(239, 68, 68) // Red-500 (#ef4444)
  doc.setLineWidth(0.3) // Thinner line
  doc.line(x - size, y - size, x + size, y + size)
  doc.line(x + size, y - size, x - size, y + size)
}

export const generateQuotationPdf = async (data: QuotationData) => {
  const doc = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: "a4",
    compress: true, // Ativa compressão interna do PDF
  })

  const config = await getConfiguracoes()

  // 1. Load Background (Papel Timbrado)
  if (config.papelTimbradoPdf) {
    try {
      const { data: imageData, format } = extractImageData(config.papelTimbradoPdf)
      doc.addImage(imageData, format, 0, 0, 210, 297)
    } catch (e) {
      console.warn("Erro ao carregar papel timbrado. Gerando sem fundo.", e)
    }
  }

  // --- Layout Constants ---
  const marginX = 20
  let cursorY = 40 // Start below header area

  // Column definitions
  const col1X = marginX
  const col1Width = 85
  const col2X = 115
  const col2Width = 75

  // 2. Header Content (Dynamic Text Overlay)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(18)
  doc.setTextColor(50, 50, 50)
  doc.text(`Orçamento: ${data.system.nome}`, marginX, cursorY)

  cursorY += 8
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.setTextColor(80, 80, 80)
  const dateStr = new Date().toLocaleDateString("pt-BR")
  doc.text(`Data: ${dateStr}`, marginX, cursorY)

  if (data.clientName) {
    cursorY += 5
    doc.text(`Cliente: ${data.clientName}`, marginX, cursorY)
  }

  // Draw separator line
  cursorY += 10
  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.2)
  doc.line(marginX, cursorY, 210 - marginX, cursorY)
  cursorY += 10

  const startContentY = cursorY

  // --- COLUMN 1: RESOURCES TABLE ---

  // Calculate row heights first
  doc.setFontSize(8.5)
  doc.setFont("helvetica", "normal")

  const sortedResources = [...data.resources].sort((a, b) => a.ordemExibicao - b.ordemExibicao)

  // Calculate total table height for rounded container
  let totalTableHeight = 8 // Header height
  const rowHeights: number[] = []

  sortedResources.forEach((res) => {
    const textWidth = col1Width - 22
    const textLines = doc.splitTextToSize(res.nome, textWidth)
    const rowHeight = textLines.length * 3.5 + 3
    rowHeights.push(rowHeight)
    totalTableHeight += rowHeight
  })

  // Draw rounded container background
  const borderRadius = 3
  doc.setFillColor(255, 255, 255)
  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.3)
  doc.roundedRect(col1X, cursorY, col1Width, totalTableHeight, borderRadius, borderRadius, "FD")

  // Table Header with rounded top corners
  doc.setFillColor(245, 245, 245)
  doc.roundedRect(col1X, cursorY, col1Width, 8, borderRadius, borderRadius, "F")
  doc.setFillColor(245, 245, 245)
  doc.rect(col1X, cursorY + 5, col1Width, 3, "F")

  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(60, 60, 60)

  // Header Text (único)
  doc.text("Recursos do Sistema", col1X + 4, cursorY + 5.5)
  doc.text("Incluso", col1X + col1Width - 12, cursorY + 5.5, { align: "center" })

  // Header bottom border
  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.2)
  doc.line(col1X + 1, cursorY + 8, col1X + col1Width - 1, cursorY + 8)

  cursorY += 8

  // Table Body
  doc.setFontSize(8.5)
  doc.setFont("helvetica", "normal")

  sortedResources.forEach((res, index) => {
    const activePlans = res.planosAtivos || []
    const hasFeature = activePlans.includes(data.plan.id)
    const rowHeight = rowHeights[index]

    // Page Break check
    if (cursorY + rowHeight > 275) {
      doc.addPage()
      cursorY = 20
    }

    // Draw row separator (except for last row)
    if (index < sortedResources.length - 1) {
      doc.setDrawColor(235, 235, 235)
      doc.setLineWidth(0.1)
      doc.line(col1X + 3, cursorY + rowHeight, col1X + col1Width - 3, cursorY + rowHeight)
    }

    // Draw Text
    const textWidth = col1Width - 22
    const textLines = doc.splitTextToSize(res.nome, textWidth)
    doc.setTextColor(70, 70, 70)
    const textY = cursorY + rowHeight / 2 + (textLines.length > 1 ? -1.5 : 1)
    doc.text(textLines, col1X + 4, textY)

    // Draw Icon (Centered)
    const iconCenterX = col1X + col1Width - 12
    const iconCenterY = cursorY + rowHeight / 2

    if (hasFeature) {
      drawCheck(doc, iconCenterX, iconCenterY, 1.0) // Ícone um pouco menor
    } else {
      drawCross(doc, iconCenterX, iconCenterY, 0.8)
    }

    cursorY += rowHeight
  })

  // --- COLUMN 2: FINANCIAL ---
  cursorY = startContentY // Reset Y for second column

  // Plan Block
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(0, 0, 0)
  doc.text(`Plano Selecionado`, col2X, cursorY + 5)

  cursorY += 10

  // Plan Card Box
  doc.setDrawColor(200, 200, 200)
  doc.setFillColor(250, 250, 250)
  doc.roundedRect(col2X, cursorY, col2Width, 25, 2, 2, "FD")

  doc.setFontSize(11)
  doc.text(data.plan.nome, col2X + 4, cursorY + 8)

  // Price and Periodicity
  doc.setFontSize(14)
  doc.setTextColor(34, 197, 94) // Green
  const priceStr = `R$ ${data.plan.precoVenda.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
  const priceWidth = doc.getTextWidth(priceStr)
  doc.text(priceStr, col2X + 4, cursorY + 18)

  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.text(data.plan.periodicidade, col2X + 4 + priceWidth + 2, cursorY + 18)

  cursorY += 35

  // Addons Block
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(0, 0, 0)
  doc.text("Adicionais:", col2X, cursorY)
  cursorY += 6

  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)

  if (data.addons.length > 0) {
    data.addons.forEach((addon) => {
      // Name
      doc.setTextColor(50, 50, 50)
      doc.text(addon.nome, col2X, cursorY)
      // Price (Right aligned in col2)
      const priceStr = `+ R$ ${addon.precoVenda.toFixed(2)}`
      doc.text(priceStr, col2X + col2Width, cursorY, { align: "right" })
      cursorY += 5
    })
  } else {
    doc.setTextColor(150, 150, 150)
    doc.text("Nenhum adicional.", col2X, cursorY)
    cursorY += 5
  }

  // Separator
  cursorY += 5
  doc.setDrawColor(220, 220, 220)
  doc.line(col2X, cursorY, col2X + col2Width, cursorY)
  cursorY += 8

  // Subtotal
  doc.setFontSize(9)
  doc.setTextColor(80, 80, 80)
  doc.text("Subtotal:", col2X, cursorY)
  doc.text(`R$ ${data.subTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, col2X + col2Width, cursorY, {
    align: "right",
  })
  cursorY += 6

  // Discount
  if (data.discount > 0) {
    doc.setTextColor(34, 197, 94) // Green
    doc.text("Desconto:", col2X, cursorY)
    doc.text(
      `- R$ ${data.discount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      col2X + col2Width,
      cursorY,
      { align: "right" },
    )
    cursorY += 8
  } else {
    cursorY += 2
  }

  // Final Total Box
  doc.setFillColor(30, 30, 30) // Dark
  doc.rect(col2X, cursorY, col2Width, 18, "F")

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.text("Total Final", col2X + 4, cursorY + 7)

  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text(
    `R$ ${data.finalTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    col2X + col2Width - 4,
    cursorY + 12,
    { align: "right" },
  )

  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.text(data.plan.periodicidade, col2X + 4, cursorY + 12)

  // --- FOOTER ---
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text("Orçamento válido por 7 dias a partir da data descrita no cabeçalho.", marginX, 285)
  doc.text("Gerado via Click Sistemas", 210 - marginX, 285, { align: "right" })

  const fileName = `Orcamento_${data.system.nome.replace(/\s+/g, "_")}_${dateStr.replace(/\//g, "-")}.pdf`
  doc.save(fileName)
}
