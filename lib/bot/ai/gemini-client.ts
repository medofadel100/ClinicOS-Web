/**
 * Gemini client with multi-key rotation, cooldowns and a global min-interval throttle.
 *
 * Gemini free-tier rate limits (gemini-2.5-flash) are measured PER GOOGLE PROJECT,
 * not per API key. Two keys on the SAME project share one bucket, so rotation only
 * helps when the keys belong to different projects. The min-interval throttle is the
 * real guard: it keeps overall throughput safely under the per-project RPM budget.
 *
 * Env:
 *   GEMINI_API_KEY           - single key (optional if using the lists below)
 *   GEMINI_API_KEYS          - comma separated list of keys
 *   GEMINI_API_KEY_1..N      - numbered keys
 *   GEMINI_MODEL             - default: gemini-2.5-flash
 *   GEMINI_MIN_INTERVAL_MS   - min ms between API calls (default 6000 -> max 10 RPM)
 *   GEMINI_KEY_COOLDOWN_MS   - how long a 429'd key is rested (default 60000)
 */

export type GeminiMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
const MIN_INTERVAL_MS = Number(process.env.GEMINI_MIN_INTERVAL_MS || 6000)
const KEY_COOLDOWN_MS = Number(process.env.GEMINI_KEY_COOLDOWN_MS || 60000)
const MAX_ATTEMPTS = 4

let cachedKeys: string[] | null = null

function getGeminiKeys(): string[] {
  if (cachedKeys) return cachedKeys

  const keys = new Set<string>()
  const add = (k?: string) => {
    if (k && k.trim() && k.trim() !== 'your-gemini-api-key') keys.add(k.trim())
  }

  add(process.env.GEMINI_API_KEY)
  for (const part of (process.env.GEMINI_API_KEYS || '').split(',')) add(part)
  for (let i = 1; i <= 20; i++) add(process.env[`GEMINI_API_KEY_${i}`])

  const result: string[] = []
  keys.forEach(k => result.push(k))
  cachedKeys = result
  return cachedKeys
}

/** Per-key cooldown until timestamp (ms epoch). */
const keyCooldowns: Record<string, number> = {}

let lastCallAt = 0
let throttleQueue: Promise<void> = Promise.resolve()

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

function pickKey(): string {
  const keys = getGeminiKeys()
  if (keys.length === 0) throw new Error('No Gemini API keys configured (GEMINI_API_KEY/GEMINI_API_KEYS).')

  const now = Date.now()
  // Round-robin, skipping keys in cooldown. Restart from 0 if pointer is stale.
  let idx = lastKeyIndex
  for (let i = 0; i < keys.length; i++) {
    idx = (lastKeyIndex + i) % keys.length
    if (!keyCooldowns[keys[idx]] || keyCooldowns[keys[idx]] <= now) {
      lastKeyIndex = (idx + 1) % keys.length
      return keys[idx]
    }
  }
  // Every key is cooling down - use the one with the soonest cooldown.
  const soonest = keys.reduce((a, b) => (keyCooldowns[a] || 0) < (keyCooldowns[b] || 0) ? a : b)
  return soonest
}

let lastKeyIndex = 0

async function callGemini(key: string, body: unknown): Promise<string> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': key,
    },
    body: JSON.stringify(body),
  })

  if (res.status === 429) {
    keyCooldowns[key] = Date.now() + KEY_COOLDOWN_MS
    const err = new Error(`Gemini rate limited (429) on key ${key.slice(0, 8)}...`)
    ;(err as any).status = 429
    throw err
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Gemini API error ${res.status}: ${text.slice(0, 500)}`)
  }

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (typeof text !== 'string' || text.length === 0) {
    const blockReason = data?.promptFeedback?.blockReason
    throw new Error(blockReason ? `Gemini blocked request: ${blockReason}` : 'Gemini returned an empty response.')
  }
  return text
}

/** Run a serialized, throttled, load-balanced Gemini call. */
export async function generateContent(options: {
  systemPrompt: string
  messages: GeminiMessage[]
  temperature?: number
  maxOutputTokens?: number
  allowWait?: boolean
}): Promise<string> {
  const run = throttleQueue.then(async () => {
    const now = Date.now()
    const wait = MIN_INTERVAL_MS - (now - lastCallAt)
    if (wait > 0) {
      if (options.allowWait) {
        await sleep(wait)
      }
      // If we can't wait, still proceed - the cron spacing provides the pacing.
    }
    lastCallAt = Date.now()

    const contents = options.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }))

    const body = {
      system_instruction: { parts: [{ text: options.systemPrompt }] },
      contents,
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxOutputTokens ?? 1024,
      },
    }

    let lastError: unknown = null
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const key = pickKey()
      try {
        return await callGemini(key, body)
      } catch (err) {
        lastError = err
        if ((err as any)?.status !== 429) throw err
      }
    }
    throw lastError instanceof Error ? lastError : new Error('Gemini request failed after retries.')
  })

  throttleQueue = run.then(() => undefined, () => undefined)
  return run
}
