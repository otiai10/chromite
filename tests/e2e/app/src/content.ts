// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="chrome" />

import { Client, Router } from '../../../../src'

interface BridgeRequest {
  type: 'chromite-e2e'
  requestId: string
  action?: string
  payload?: Record<string, unknown>
  mode?: 'client' | 'raw'
  message?: Record<string, unknown>
}

const client = Client.runtime()
const inboundRouter = new Router()

inboundRouter.on('/dom/render', function (_message: { text?: string, color?: string }) {
  const body = document.body
  if (body != null) {
    body.setAttribute('data-chromite-rendered', JSON.stringify({
      text: _message.text ?? 'Chromite',
      color: _message.color ?? '#ffeb3b'
    }))
  }
  return { acknowledged: true }
})

inboundRouter.on('/dom/mark', function (_message: { selector?: string, mark?: string }) {
  const target = document.querySelector(_message.selector ?? 'body')
  if (target != null) {
    target.setAttribute('data-chromite-mark', _message.mark ?? 'set')
  }
  return { acknowledged: true }
})

chrome.runtime.onMessage.addListener(inboundRouter.listener())

async function sendViaClient (action: string, payload: Record<string, unknown> = {}): Promise<any> {
  return await client.send(action, payload)
}

async function sendRawMessage (message: Record<string, unknown>): Promise<any> {
  return await new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, response => {
      if (chrome.runtime.lastError != null) {
        reject(new Error(chrome.runtime.lastError.message))
        return
      }
      resolve(response)
    })
  })
}

window.addEventListener('message', async (event) => {
  if (event.source !== window) return
  const data = event.data as BridgeRequest
  if (data?.type !== 'chromite-e2e') return

  try {
    const mode = data.mode ?? 'client'
    let response
    if (mode === 'raw') {
      response = await sendRawMessage(data.message ?? {})
    } else {
      if (typeof data.action !== 'string') throw new Error('action is required')
      response = await sendViaClient(data.action, data.payload)
    }
    window.postMessage({
      type: 'chromite-e2e:response',
      requestId: data.requestId,
      ok: true,
      data: response
    }, '*')
  } catch (error: any) {
    window.postMessage({
      type: 'chromite-e2e:response',
      requestId: data.requestId,
      ok: false,
      error: error?.message ?? String(error)
    }, '*')
  }
})
