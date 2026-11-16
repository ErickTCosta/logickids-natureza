import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  CLIMATE_CATEGORIES,
  ClimateCategory,
  ClimateChallenge,
  getFallbackChallenge,
} from '@/data/fallbackChallenges'

const DEFAULT_MODEL = 'Qwen/Qwen2.5-72B-Instruct'
const HF_URL = 'https://router.huggingface.co/v1/chat/completions'

function isClimateCategory(value: unknown): value is ClimateCategory {
  return typeof value === 'string' && CLIMATE_CATEGORIES.includes(value as ClimateCategory)
}

function cleanJsonResponse(value: string): string {
  return value
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
}

function isValidChallenge(value: unknown, category: ClimateCategory): value is ClimateChallenge {
  if (!value || typeof value !== 'object') return false
  const challenge = value as Partial<ClimateChallenge>
  return (
    challenge.category === category &&
    typeof challenge.title === 'string' &&
    typeof challenge.question === 'string' &&
    typeof challenge.logicHint === 'string' &&
    Array.isArray(challenge.options) &&
    challenge.options.length === 4 &&
    challenge.options.every((option) => typeof option === 'string') &&
    Number.isInteger(challenge.correctIndex) &&
    challenge.correctIndex >= 0 &&
    challenge.correctIndex < 4 &&
    typeof challenge.ecoFact === 'string'
  )
}

async function generateWithHuggingFace(category: ClimateCategory): Promise<ClimateChallenge> {
  const token = process.env.HF_TOKEN
  if (!token) throw new Error('HF_TOKEN não configurado')
  const model = process.env.HF_MODEL?.trim() || DEFAULT_MODEL

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8_000)

  try {
    const response = await fetch(HF_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.8,
        max_tokens: 500,
        messages: [
          {
            role: 'system',
            content:
              'Você cria desafios educativos para crianças brasileiras de 8 a 12 anos. Responda somente com JSON válido, sem markdown.',
          },
          {
            role: 'user',
            content: `Crie um desafio inédito de ${category}. Use exatamente este formato:
{"category":"${category}","title":"...","question":"...","logicHint":"...","options":["...","...","...","..."],"correctIndex":0,"ecoFact":"..."}
O índice correto deve ser de 0 a 3. O ecoFact deve ser uma curiosidade climática real e simples, relacionada à ODS 13.`,
          },
        ],
      }),
      signal: controller.signal,
    })

    if (!response.ok) throw new Error(`Hugging Face respondeu ${response.status}`)
    const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> }
    const content = payload.choices?.[0]?.message?.content
    if (!content) throw new Error('Resposta da Hugging Face sem conteúdo')

    const parsed: unknown = JSON.parse(cleanJsonResponse(content))
    if (!isValidChallenge(parsed, category)) throw new Error('Desafio gerado fora do formato esperado')
    return parsed
  } finally {
    clearTimeout(timeout)
  }
}

async function saveChallenge(challenge: ClimateChallenge, source: 'huggingface' | 'fallback') {
  try {
    await prisma.generatedClimateChallenge.create({
      data: {
        category: challenge.category,
        title: challenge.title,
        question: challenge.question,
        logicHint: challenge.logicHint,
        options: challenge.options,
        correctIndex: challenge.correctIndex,
        ecoFact: challenge.ecoFact,
        source,
        model: source === 'huggingface' ? process.env.HF_MODEL?.trim() || DEFAULT_MODEL : null,
      },
    })
    return true
  } catch (error) {
    console.error('Não foi possível salvar o desafio no Supabase.', error)
    return false
  }
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  const category = body && typeof body === 'object' && 'category' in body ? body.category : undefined
  if (!isClimateCategory(category)) {
    return NextResponse.json(
      { error: 'Categoria inválida.', categories: CLIMATE_CATEGORIES },
      { status: 400 },
    )
  }

  let challenge: ClimateChallenge
  let source: 'huggingface' | 'fallback'

  try {
    challenge = await generateWithHuggingFace(category)
    source = 'huggingface'
  } catch (error) {
    console.error('Falha ao gerar desafio com Hugging Face; usando fallback local.', error)
    challenge = getFallbackChallenge(category)
    source = 'fallback'
  }

  const saved = await saveChallenge(challenge, source)
  return NextResponse.json({
    ...challenge,
    source,
    saved,
    storage: saved ? 'supabase' : 'unavailable',
  })
}
