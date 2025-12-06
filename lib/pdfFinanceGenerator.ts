import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import type { Plano, Adicional } from "../types"

interface FinanceReportData {
  planos: (Plano & { sistemaNome: string })[]
  adicionais: (Adicional & { sistemaNome: string })[]
}

export const generateFinancePdf = (data: FinanceReportData) => {
  const doc = new jsPDF()

  // Header
  doc.setFontSize(18)
  doc.text("Relatório de Lucratividade", 14, 20)
  doc.setFontSize(10)
  doc.text(`Gerado em: ${new Date().toLocaleDateString()} às ${new Date().toLocaleTimeString()}`, 14, 28)
  doc.text("Click Sistemas", 14, 34)

  let yPos = 45

  // Table 1: Planos
  doc.setFontSize(14)
  doc.text("Lucratividade - Planos", 14, yPos)

  const planosRows = data.planos.map((p) => {
    const lucro = p.precoVenda - p.precoCusto
    const margem = p.precoVenda > 0 ? ((lucro / p.precoVenda) * 100).toFixed(1) + "%" : "0%"
    return [
      p.sistemaNome,
      p.nome,
      `R$ ${p.precoCusto.toFixed(2)}`,
      `R$ ${p.precoVenda.toFixed(2)}`,
      `R$ ${lucro.toFixed(2)}`,
      margem,
    ]
  })

  autoTable(doc, {
    startY: yPos + 5,
    head: [["Sistema", "Plano", "Custo", "Venda", "Lucro", "Margem"]],
    body: planosRows,
    headStyles: { fillColor: [204, 255, 0], textColor: [0, 0, 0], fontStyle: "bold" },
    styles: { fontSize: 10 },
    columnStyles: {
      4: { fontStyle: "bold" },
      5: { fontStyle: "bold" },
    },
    didParseCell: (data: any) => {
      if (data.section === "body" && data.column.index === 4) {
        const val = Number.parseFloat(data.cell.raw.replace("R$ ", ""))
        if (val < 0) data.cell.styles.textColor = [220, 38, 38]
        else data.cell.styles.textColor = [22, 163, 74]
      }
    },
  })

  yPos = (doc as any).lastAutoTable.finalY + 20

  // Table 2: Adicionais
  doc.setFontSize(14)
  doc.text("Lucratividade - Serviços Adicionais", 14, yPos)

  const adicRows = data.adicionais.map((a) => {
    const lucro = a.precoVenda - a.precoCusto
    const margem = a.precoVenda > 0 ? ((lucro / a.precoVenda) * 100).toFixed(1) + "%" : "0%"
    const sysLabel = a.sistemasVinculados.length > 1 ? "Vários" : a.sistemaNome || "N/A"
    return [
      sysLabel,
      a.nome,
      `R$ ${a.precoCusto.toFixed(2)}`,
      `R$ ${a.precoVenda.toFixed(2)}`,
      `R$ ${lucro.toFixed(2)}`,
      margem,
    ]
  })

  autoTable(doc, {
    startY: yPos + 5,
    head: [["Sistema", "Adicional", "Custo", "Venda", "Lucro", "Margem"]],
    body: adicRows,
    headStyles: { fillColor: [20, 20, 20], textColor: [255, 255, 255] },
    styles: { fontSize: 10 },
    didParseCell: (data: any) => {
      if (data.section === "body" && data.column.index === 4) {
        const val = Number.parseFloat(data.cell.raw.replace("R$ ", ""))
        if (val < 0) data.cell.styles.textColor = [220, 38, 38]
        else data.cell.styles.textColor = [22, 163, 74]
      }
    },
  })

  doc.save(`Lucratividade_ClickSistemas_${new Date().toISOString().slice(0, 10)}.pdf`)
}
