import * as XLSX from "xlsx"
import {
  getSistemas,
  getPlanos,
  getAdicionais,
  getRecursos,
  upsertSistema,
  upsertPlano,
  upsertAdicional,
  upsertRecurso,
} from "./supabase/data-service"
import { createClient } from "./supabase/client"

// --- Validation Helpers ---

const validateNumber = (value: any, context: string): number => {
  const num = Number(value)
  if (value === "" || value === null || isNaN(num)) {
    throw new Error(`Erro de validação: O campo '${context}' deve ser um número válido. Valor recebido: ${value}`)
  }
  return num
}

const validateExists = (id: string, dbIds: string[], sheetIds: string[], context: string) => {
  if (!id) return
  const allValidIds = [...new Set([...dbIds, ...sheetIds])]
  if (!allValidIds.includes(id)) {
    throw new Error(
      `Erro de integridade: O ID '${id}' referenciado em '${context}' não foi encontrado no sistema nem na planilha.`,
    )
  }
}

export const downloadExcelTemplate = async () => {
  const wb = XLSX.utils.book_new()

  const sistemas = await getSistemas()
  const planos = await getPlanos()
  const adicionais = await getAdicionais()
  const recursos = await getRecursos()

  // 1. Sistemas
  const dataSistemas = sistemas.map((s) => ({
    id: s.id,
    nome: s.nome,
    descricao_curta: s.descricaoCurta,
    descricao_detalhada: s.descricaoDetalhada,
    ordem_exibicao: s.ordemExibicao,
    ativo: s.ativo,
  }))
  const wsSistemas = XLSX.utils.json_to_sheet(
    dataSistemas.length
      ? dataSistemas
      : [
          {
            id: "",
            nome: "Exemplo",
            descricao_curta: "",
            descricao_detalhada: "",
            ordem_exibicao: 1,
            ativo: true,
          },
        ],
  )
  XLSX.utils.book_append_sheet(wb, wsSistemas, "Sistemas")

  // 2. Planos
  const dataPlanos = planos.map((p) => ({
    id: p.id,
    sistema_id: p.sistemaId,
    nome: p.nome,
    preco_custo: p.precoCusto,
    preco_venda: p.precoVenda,
    periodicidade: p.periodicidade,
    lista_beneficios: p.listaBeneficios.join(";"),
    destaque_popular: p.destaquePopular,
    ordem_exibicao: p.ordemExibicao,
    ativo: p.ativo,
  }))
  const wsPlanos = XLSX.utils.json_to_sheet(
    dataPlanos.length
      ? dataPlanos
      : [
          {
            id: "",
            sistema_id: "",
            nome: "Básico",
            preco_custo: 0,
            preco_venda: 0,
            periodicidade: "/mês",
            lista_beneficios: "Item 1; Item 2",
            destaque_popular: false,
            ordem_exibicao: 1,
            ativo: true,
          },
        ],
  )
  XLSX.utils.book_append_sheet(wb, wsPlanos, "Planos")

  // 3. Adicionais
  const dataAdicionais = adicionais.map((a) => ({
    id: a.id,
    nome: a.nome,
    descricao: a.descricao,
    tipo_cobranca: a.tipoCobranca,
    preco_custo: a.precoCusto,
    preco_venda: a.precoVenda,
    ordem_exibicao: a.ordemExibicao,
    ativo: a.ativo,
  }))
  const wsAdicionais = XLSX.utils.json_to_sheet(
    dataAdicionais.length
      ? dataAdicionais
      : [
          {
            id: "",
            nome: "Serviço Extra",
            descricao: "",
            tipo_cobranca: "Mensal",
            preco_custo: 0,
            preco_venda: 0,
            ordem_exibicao: 1,
            ativo: true,
          },
        ],
  )
  XLSX.utils.book_append_sheet(wb, wsAdicionais, "Adicionais")

  // 4. Recursos
  const dataRecursos = recursos.map((r) => ({
    id: r.id,
    nome: r.nome,
    categoria: r.categoria,
    sistema_id: r.sistemaId,
    ordem_exibicao: r.ordemExibicao,
  }))
  const wsRecursos = XLSX.utils.json_to_sheet(
    dataRecursos.length
      ? dataRecursos
      : [
          {
            id: "",
            nome: "Feature",
            categoria: "Geral",
            sistema_id: "",
            ordem_exibicao: 1,
          },
        ],
  )
  XLSX.utils.book_append_sheet(wb, wsRecursos, "Recursos")

  // 5. Vinculos_Recursos_Planos
  const dataVinculosRP: { recurso_id: string; plano_id: string }[] = []
  recursos.forEach((r) => {
    r.planosAtivos.forEach((pid) => {
      dataVinculosRP.push({ recurso_id: r.id, plano_id: pid })
    })
  })
  const wsVinculosRP = XLSX.utils.json_to_sheet(
    dataVinculosRP.length ? dataVinculosRP : [{ recurso_id: "", plano_id: "" }],
  )
  XLSX.utils.book_append_sheet(wb, wsVinculosRP, "Vinculos_Recursos_Planos")

  // 6. Vinculos_Adicionais_Sistemas
  const dataVinculosAS: { adicional_id: string; sistema_id: string }[] = []
  adicionais.forEach((a) => {
    a.sistemasVinculados.forEach((sid) => {
      dataVinculosAS.push({ adicional_id: a.id, sistema_id: sid })
    })
  })
  const wsVinculosAS = XLSX.utils.json_to_sheet(
    dataVinculosAS.length ? dataVinculosAS : [{ adicional_id: "", sistema_id: "" }],
  )
  XLSX.utils.book_append_sheet(wb, wsVinculosAS, "Vinculos_Adicionais_Sistemas")

  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" })
  const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "ClickSistemas_Template.xlsx"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const processExcelImport = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })

        // Required sheets
        const requiredSheets = [
          "Sistemas",
          "Planos",
          "Adicionais",
          "Recursos",
          "Vinculos_Recursos_Planos",
          "Vinculos_Adicionais_Sistemas",
        ]
        const missingSheets = requiredSheets.filter((sheet) => !workbook.SheetNames.includes(sheet))

        if (missingSheets.length > 0) {
          throw new Error(`Planilha inválida. Abas faltando: ${missingSheets.join(", ")}`)
        }

        const supabase = createClient()

        const sistemasRaw = XLSX.utils.sheet_to_json(workbook.Sheets["Sistemas"]) as any[]
        const planosRaw = XLSX.utils.sheet_to_json(workbook.Sheets["Planos"]) as any[]
        const adicionaisRaw = XLSX.utils.sheet_to_json(workbook.Sheets["Adicionais"]) as any[]
        const recursosRaw = XLSX.utils.sheet_to_json(workbook.Sheets["Recursos"]) as any[]
        const vinculosRPRaw = XLSX.utils.sheet_to_json(workbook.Sheets["Vinculos_Recursos_Planos"]) as any[]
        const vinculosASRaw = XLSX.utils.sheet_to_json(workbook.Sheets["Vinculos_Adicionais_Sistemas"]) as any[]

        // IDs da planilha (para validação cruzada)
        const sheetSistemaIds = sistemasRaw.map((r) => r.id).filter(Boolean)
        const sheetPlanoIds = planosRaw.map((r) => r.id).filter(Boolean)
        const sheetAdicionalIds = adicionaisRaw.map((r) => r.id).filter(Boolean)
        const sheetRecursoIds = recursosRaw.map((r) => r.id).filter(Boolean)

        // IDs do banco de dados existentes
        const dbSistemas = await getSistemas()
        const dbPlanos = await getPlanos()
        const dbAdicionais = await getAdicionais()
        const dbRecursos = await getRecursos()

        const dbSistemaIds = dbSistemas.map((s) => s.id)
        const dbPlanoIds = dbPlanos.map((p) => p.id)
        const dbAdicionalIds = dbAdicionais.map((a) => a.id)
        const dbRecursoIds = dbRecursos.map((r) => r.id)

        // This maps custom IDs like "SI001" to actual UUIDs
        const sistemaIdMap: Record<string, string> = {}
        const planoIdMap: Record<string, string> = {}
        const adicionalIdMap: Record<string, string> = {}
        const recursoIdMap: Record<string, string> = {}

        // Pre-populate maps with existing DB IDs (they map to themselves)
        dbSistemas.forEach((s) => {
          sistemaIdMap[s.id] = s.id
        })
        dbPlanos.forEach((p) => {
          planoIdMap[p.id] = p.id
        })
        dbAdicionais.forEach((a) => {
          adicionalIdMap[a.id] = a.id
        })
        dbRecursos.forEach((r) => {
          recursoIdMap[r.id] = r.id
        })

        // --- 1. Sistemas Upsert ---
        for (const row of sistemasRaw) {
          if (!row.nome) throw new Error(`Sistemas: Nome é obrigatório.`)

          const excelId = row.id ? String(row.id).trim() : ""

          const result = await upsertSistema({
            id: excelId || undefined, // Se vazio, deixa undefined para gerar automaticamente
            nome: row.nome,
            descricaoCurta: row.descricao_curta || "",
            descricaoDetalhada: row.descricao_detalhada || "",
            imagemLogoSistema: row.imagem_logo_sistema || "",
            imagemLogoQuadrada: row.imagem_logo_quadrada || "",
            imagemBannerDesktop: row.imagem_banner_desktop || "",
            imagemBannerMobile: row.imagem_banner_mobile || "",
            ordemExibicao: validateNumber(row.ordem_exibicao ?? 0, `Sistema ${row.nome} - Ordem`),
            ativo: row.ativo === true || row.ativo === "true" || row.ativo === "TRUE",
          })

          if (result) {
            // Mapeia o ID do Excel para o ID final (pode ser o mesmo ou gerado)
            const keyId = excelId || result.id
            sistemaIdMap[keyId] = result.id
            if (excelId && excelId !== result.id) {
              sistemaIdMap[excelId] = result.id
            }
          }
        }

        // --- 2. Planos Upsert ---
        for (const row of planosRaw) {
          if (!row.nome) throw new Error(`Planos: Nome é obrigatório.`)

          const excelId = row.id ? String(row.id).trim() : ""
          const excelSistemaId = row.sistema_id ? String(row.sistema_id).trim() : ""

          const resolvedSistemaId = excelSistemaId ? sistemaIdMap[excelSistemaId] : undefined

          if (excelSistemaId && !resolvedSistemaId) {
            throw new Error(`Plano ${row.nome}: Sistema ID '${excelSistemaId}' não encontrado.`)
          }

          const result = await upsertPlano({
            id: excelId || undefined,
            sistemaId: resolvedSistemaId,
            nome: row.nome,
            precoCusto: validateNumber(row.preco_custo ?? 0, `Plano ${row.nome} - Preço Custo`),
            precoVenda: validateNumber(row.preco_venda ?? 0, `Plano ${row.nome} - Preço Venda`),
            periodicidade: row.periodicidade || "/mês",
            listaBeneficios: row.lista_beneficios
              ? String(row.lista_beneficios)
                  .split(";")
                  .map((s) => s.trim())
              : [],
            destaquePopular:
              row.destaque_popular === true || row.destaque_popular === "true" || row.destaque_popular === "TRUE",
            ordemExibicao: validateNumber(row.ordem_exibicao ?? 0, `Plano ${row.nome} - Ordem`),
            ativo: row.ativo === true || row.ativo === "true" || row.ativo === "TRUE",
          })

          if (result) {
            const keyId = excelId || result.id
            planoIdMap[keyId] = result.id
            if (excelId && excelId !== result.id) {
              planoIdMap[excelId] = result.id
            }
          }
        }

        // --- 3. Adicionais Upsert ---
        for (const row of adicionaisRaw) {
          if (!row.nome) throw new Error(`Adicionais: Nome é obrigatório.`)

          const excelId = row.id ? String(row.id).trim() : ""

          const result = await upsertAdicional({
            id: excelId || undefined,
            nome: row.nome,
            descricao: row.descricao || "",
            tipoCobranca: row.tipo_cobranca || "Mensal",
            precoCusto: validateNumber(row.preco_custo ?? 0, `Adicional ${row.nome} - Preço Custo`),
            precoVenda: validateNumber(row.preco_venda ?? 0, `Adicional ${row.nome} - Preço Venda`),
            icone: row.icone || "",
            sistemasVinculados: [],
            ordemExibicao: validateNumber(row.ordem_exibicao ?? 0, `Adicional ${row.nome} - Ordem`),
            ativo: row.ativo === true || row.ativo === "true" || row.ativo === "TRUE",
          })

          if (result) {
            const keyId = excelId || result.id
            adicionalIdMap[keyId] = result.id
            if (excelId && excelId !== result.id) {
              adicionalIdMap[excelId] = result.id
            }
          }
        }

        // --- 4. Recursos Upsert ---
        for (const row of recursosRaw) {
          if (!row.nome) throw new Error(`Recursos: Nome é obrigatório.`)

          const excelId = row.id ? String(row.id).trim() : ""
          const excelSistemaId = row.sistema_id ? String(row.sistema_id).trim() : ""

          const resolvedSistemaId = excelSistemaId ? sistemaIdMap[excelSistemaId] : undefined

          if (excelSistemaId && !resolvedSistemaId) {
            throw new Error(`Recurso ${row.nome}: Sistema ID '${excelSistemaId}' não encontrado.`)
          }

          const result = await upsertRecurso({
            id: excelId || undefined,
            nome: row.nome,
            categoria: row.categoria || "Geral",
            sistemaId: resolvedSistemaId,
            planosAtivos: [],
            ordemExibicao: validateNumber(row.ordem_exibicao ?? 0, `Recurso ${row.nome} - Ordem`),
          })

          if (result) {
            const keyId = excelId || result.id
            recursoIdMap[keyId] = result.id
            if (excelId && excelId !== result.id) {
              recursoIdMap[excelId] = result.id
            }
          }
        }

        // --- 5. Links: Recursos -> Planos ---
        const recursoPlanoMap: Record<string, string[]> = {}

        for (const row of vinculosRPRaw) {
          if (!row.recurso_id || !row.plano_id) continue

          const excelRecursoId = String(row.recurso_id).trim()
          const excelPlanoId = String(row.plano_id).trim()

          const resolvedRecursoId = recursoIdMap[excelRecursoId]
          const resolvedPlanoId = planoIdMap[excelPlanoId]

          if (!resolvedRecursoId) {
            throw new Error(`Vínculo RP: Recurso ID '${excelRecursoId}' não encontrado.`)
          }
          if (!resolvedPlanoId) {
            throw new Error(`Vínculo RP: Plano ID '${excelPlanoId}' não encontrado.`)
          }

          if (!recursoPlanoMap[resolvedRecursoId]) {
            recursoPlanoMap[resolvedRecursoId] = []
          }
          recursoPlanoMap[resolvedRecursoId].push(resolvedPlanoId)
        }

        // Update recursos with their planos
        for (const [recursoId, planoIds] of Object.entries(recursoPlanoMap)) {
          await supabase.from("recursos").update({ planos_ativos: planoIds }).eq("id", recursoId)
        }

        // --- 6. Links: Adicionais -> Sistemas ---
        const adicionalSistemaMap: Record<string, string[]> = {}

        for (const row of vinculosASRaw) {
          if (!row.adicional_id || !row.sistema_id) continue

          const excelAdicionalId = String(row.adicional_id).trim()
          const excelSistemaId = String(row.sistema_id).trim()

          const resolvedAdicionalId = adicionalIdMap[excelAdicionalId]
          const resolvedSistemaId = sistemaIdMap[excelSistemaId]

          if (!resolvedAdicionalId) {
            throw new Error(`Vínculo AS: Adicional ID '${excelAdicionalId}' não encontrado.`)
          }
          if (!resolvedSistemaId) {
            throw new Error(`Vínculo AS: Sistema ID '${excelSistemaId}' não encontrado.`)
          }

          if (!adicionalSistemaMap[resolvedAdicionalId]) {
            adicionalSistemaMap[resolvedAdicionalId] = []
          }
          adicionalSistemaMap[resolvedAdicionalId].push(resolvedSistemaId)
        }

        // Update adicionais with their sistemas
        for (const [adicionalId, sistemaIds] of Object.entries(adicionalSistemaMap)) {
          await supabase.from("adicionais").update({ sistemas_vinculados: sistemaIds }).eq("id", adicionalId)
        }

        resolve(
          `Importação concluída com sucesso! ${sistemasRaw.length} sistemas, ${planosRaw.length} planos, ${adicionaisRaw.length} adicionais e ${recursosRaw.length} recursos importados.`,
        )
      } catch (error: any) {
        reject(new Error(error.message || "Erro desconhecido ao processar planilha."))
      }
    }
    reader.readAsArrayBuffer(file)
  })
}
