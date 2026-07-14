const WHATSAPP_SERVICE_URL = process.env.NEXT_PUBLIC_WHATSAPP_SERVICE_URL || 'http://localhost:3002'

export type WhatsAppSessionStatus = {
  connected: boolean
  user?: string
}

export type WhatsAppInitResponse = {
  qr?: string
  connected?: boolean
}

/**
 * Trigger POST /sessions/:clinicId/init on the Baileys service
 * Returns a QR code as a base64 string/data URL, or indicates already connected.
 */
export async function initSession(clinicId: string): Promise<WhatsAppInitResponse> {
  const res = await fetch(`${WHATSAPP_SERVICE_URL}/sessions/${clinicId}/init`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  
  if (!res.ok) {
    throw new Error('Failed to initialize WhatsApp session')
  }

  return res.json()
}

/**
 * Poll/Check GET /sessions/:clinicId/status
 */
export async function getSessionStatus(clinicId: string): Promise<WhatsAppSessionStatus> {
  const res = await fetch(`${WHATSAPP_SERVICE_URL}/sessions/${clinicId}/status`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  if (!res.ok) {
    if (res.status === 404) {
      return { connected: false }
    }
    throw new Error('Failed to fetch WhatsApp session status')
  }

  return res.json()
}

/**
 * Trigger DELETE /sessions/:clinicId
 */
export async function disconnectSession(clinicId: string): Promise<void> {
  const res = await fetch(`${WHATSAPP_SERVICE_URL}/sessions/${clinicId}`, {
    method: 'DELETE',
  })

  if (!res.ok) {
    throw new Error('Failed to disconnect WhatsApp session')
  }
}

/**
 * Send a message via the Baileys service
 */
export async function sendMessage(clinicId: string, to: string, text: string): Promise<void> {
  const res = await fetch(`${WHATSAPP_SERVICE_URL}/sessions/${clinicId}/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      to,
      text
    })
  })

  if (!res.ok) {
    throw new Error(`Failed to send message to ${to}`)
  }
}
