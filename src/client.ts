import { ActionKey, ActionKeyAlias } from './keys'

type HasAlias<T extends string> = { [K in T]: { [P in K]: string } }[T]
type MessageWithAction<Message> = HasAlias<typeof ActionKeyAlias[number]> & Message

export class Client<MessageModule = (typeof chrome.runtime | typeof chrome.tabs)> {
  private readonly __mod__: typeof chrome.runtime | typeof chrome.tabs
  private readonly __tab_id__?: number
  private readonly __ext_id__?: string

  constructor (tabId: number)
  constructor (tabId: number, mod: typeof chrome.tabs)
  constructor (extId: string)
  constructor (extId: string, mod: typeof chrome.runtime)
  constructor (tab: chrome.tabs.Tab)
  constructor (mod: MessageModule)
  constructor (a: number | string | chrome.tabs.Tab | MessageModule, b?: MessageModule) {
    if (typeof a === 'number') {
      this.__mod__ = (b !== undefined) ? (b as typeof chrome.tabs) : chrome.tabs
      this.__tab_id__ = a
    } else if (typeof a === 'string') {
      this.__mod__ = (b !== undefined) ? (b as typeof chrome.runtime) : chrome.runtime
      this.__ext_id__ = a
    } else if (typeof a === 'object' && a !== null && 'id' in a && 'url' in a) {
      this.__mod__ = chrome.tabs
      this.__tab_id__ = a.id
    } else {
      this.__mod__ = a as (typeof chrome.runtime | typeof chrome.tabs)
    }
  }

  public async send<Response = any>(action: string): Promise<Response>
  public async send<Message = any, Response = any>(action: string, message: Message): Promise<Response>
  public async send<Message = any, Response = any>(message: MessageWithAction<Message>): Promise<Response>
  public async send<Message = any, Response = any>(a: string | MessageWithAction<Message>, message?: Message): Promise<Response> {
    if (typeof a === 'string') return await this.sendMessage({ [ActionKey]: a, ...(message ?? {}) })
    const _action_ = this.findActionKeyInMessage(a)
    if (_action_ === undefined) throw new Error('Action not found')
    return await this.sendMessage({ [ActionKey]: _action_, ...a })
  }

  private async sendMessage<Message = any, Response = any>(message: Message): Promise<Response> {
    if (typeof this.__tab_id__ === 'number') return await (this.__mod__ as typeof chrome.tabs).sendMessage(this.__tab_id__, message)
    if (typeof this.__ext_id__ === 'string') return await (this.__mod__ as typeof chrome.runtime).sendMessage(this.__ext_id__, message)
    return await (this.__mod__ as typeof chrome.runtime).sendMessage(message)
  }

  private findActionKeyInMessage (message: any): string | undefined {
    for (const alias of ActionKeyAlias) {
      if (alias in message) return message[alias]
    }
    return undefined
  }
}

// Shorthand for chrome.runtime Client
export const _ = new Client<typeof chrome.runtime>(chrome.runtime)

// Shortcuts for chrome.tabs Client
export function $ (tabId: number): Client<typeof chrome.tabs>
export function $ (tab: chrome.tabs.Tab): Client<typeof chrome.tabs>
export function $ (tab: number | chrome.tabs.Tab): Client<typeof chrome.tabs> {
  if (typeof tab === 'number') return new Client<typeof chrome.tabs>(tab)
  return new Client<typeof chrome.tabs>(tab)
}
