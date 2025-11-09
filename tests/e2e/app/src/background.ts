// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="chrome" />

import { Client, Router, Logger, LogLevel } from '../../../../src'

interface RouteContext<P = Record<string, unknown>> {
  route: P & { __action__: string }
}

interface HighlightMessage {
  text?: string
  color?: string
}

interface LookupMessage {
  include_log?: boolean
}

const USERS = {
  '001': { id: '001', name: 'Alice', role: 'admin' },
  '002': { id: '002', name: 'Bob', role: 'reviewer' },
  '003': { id: '003', name: 'Charlie', role: 'viewer' }
} as const

const logger = Logger.get('chromite-e2e', { level: LogLevel.DEBUG })
const router = new Router()
const recentActions: string[] = []

const remember = (ctx: RouteContext): void => {
  recentActions.push(ctx.route.__action__)
  if (recentActions.length > 10) recentActions.shift()
}

router.on('/health/ping', async function (this: RouteContext) {
  remember(this)
  logger.debug('health ping received')
  return { status: 'ok', timestamp: Date.now() }
})

router.on('/users/list', async function (this: RouteContext) {
  remember(this)
  return { status: 200, users: Object.values(USERS) }
})

router.on('/users/{id}', async function (this: RouteContext<{ id: string }>, message: LookupMessage) {
  remember(this)
  const user = USERS[this.route.id as keyof typeof USERS]
  if (user == null) {
    logger.warn('missing user lookup', { id: this.route.id })
    return { status: 404, message: `User ${this.route.id} not found` }
  }
  if (message.include_log === true) {
    logger.info('user lookup', { id: user.id })
  }
  return { status: 200, user }
})

router.on('/history/latest', async function (this: RouteContext) {
  remember(this)
  return { status: 200, actions: [...recentActions] }
})

router.on('/page/highlight', async function (this: RouteContext, message: HighlightMessage, sender) {
  remember(this)
  if (sender?.tab?.id == null) {
    return { status: 400, message: 'Tab id required' }
  }
  const tabClient = Client.tab(sender.tab.id)
  const response = await tabClient.send('/dom/render', {
    text: message.text ?? 'Chromite',
    color: message.color ?? '#ffeb3b'
  })
  return { status: 200, ack: response }
})

router.onNotFound(function (this: RouteContext) {
  remember(this)
  logger.error('route not found', { action: this.route.__action__ })
  return { status: 404, message: `Handler for ${this.route.__action__} not found` }
})

chrome.runtime.onMessage.addListener(router.listener())
