/* eslint-disable @typescript-eslint/explicit-function-return-type */

describe('Chromite routing E2E', () => {
  let page

  beforeAll(async () => {
    page = await globalThis.__BROWSER_GLOBAL__.newPage()
    await page.goto('https://example.com')
  })

  afterAll(async () => {
    await page.close()
  })

  const bridgeRequest = async (options) => {
    return page.evaluate(async (opts) => {
      const requestId = (globalThis.crypto?.randomUUID?.() ?? `req-${Date.now()}-${Math.random()}`)
      return await new Promise((resolve, reject) => {
        const cleanup = () => {
          window.removeEventListener('message', handle)
          clearTimeout(timeout)
        }

        const handle = (event) => {
          if (event.source !== window) return
          const detail = event.data
          if (detail == null || detail.type !== 'chromite-e2e:response') return
          if (detail.requestId !== requestId) return
          cleanup()
          if (detail.ok === true) {
            resolve(detail.data)
          } else {
            const message = typeof detail.error === 'string' ? detail.error : 'unknown error'
            reject(new Error(message))
          }
        }

        const timeout = setTimeout(() => {
          cleanup()
          reject(new Error('timeout'))
        }, opts.timeout ?? 5000)

        window.addEventListener('message', handle)
        window.postMessage({
          type: 'chromite-e2e',
          requestId,
          action: opts.action,
          payload: opts.payload,
          mode: opts.mode,
          message: opts.message
        }, '*')
      })
    }, options)
  }

  it('responds to /health/ping with status ok', async () => {
    const response = await bridgeRequest({ action: '/health/ping' })
    expect(response.status).toBe('ok')
    expect(typeof response.timestamp).toBe('number')
  })

  it('resolves dynamic params for /users/{id}', async () => {
    const response = await bridgeRequest({ action: '/users/002', payload: { include_log: true } })
    expect(response.status).toBe(200)
    expect(response.user).toMatchObject({ id: '002', name: 'Bob' })
  })

  it('returns 404 payload for unknown routes', async () => {
    const response = await bridgeRequest({ action: '/not/exist' })
    expect(response.status).toBe(404)
    expect(response.message).toMatch(/not found/i)
  })

  it('accepts alias messages without the Client helper', async () => {
    const response = await bridgeRequest({
      mode: 'raw',
      message: { action: '/users/list' }
    })
    expect(response.status).toBe(200)
    expect(Array.isArray(response.users)).toBe(true)
    expect(response.users.length).toBeGreaterThanOrEqual(3)
  })

  it('forwards highlight instructions back to the active tab', async () => {
    const payload = { text: 'Bridge OK', color: '#00ff00' }
    const response = await bridgeRequest({ action: '/page/highlight', payload })
    expect(response.status).toBe(200)
    expect(response.ack).toMatchObject({ acknowledged: true })

    const rendered = await page.waitForFunction(() => {
      const raw = document.body.getAttribute('data-chromite-rendered')
      return raw != null ? JSON.parse(raw) : null
    })
    const renderedPayload = await rendered.jsonValue()
    expect(renderedPayload).toMatchObject(payload)
  })

  it('reports recent action history in order', async () => {
    const response = await bridgeRequest({ action: '/history/latest' })
    expect(response.status).toBe(200)
    expect(response.actions.slice(-3)).toEqual([
      '/users/list',
      '/page/highlight',
      '/history/latest'
    ])
  })
})
