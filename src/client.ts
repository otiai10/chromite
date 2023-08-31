import { ActionKey, type ActionKeyAlias } from './keys'

type HasAlias<T extends string> = { [K in T]: { [P in K]: string } }[T]
type MessageWithAction<Message> = HasAlias<typeof ActionKeyAlias[number]> & Message

interface ClientOptions<MessageModule = (typeof chrome.runtime | typeof chrome.tabs)> {
  module: MessageModule
  tabId?: number
  extId?: string
}

export class Client<MessageModule = (typeof chrome.runtime | typeof chrome.tabs)> {
  private readonly __mod__: MessageModule
  private readonly __tab_id__?: number
  private readonly __ext_id__?: string

  constructor (opt: ClientOptions<MessageModule>) {
    this.__mod__ = opt.module
    this.__tab_id__ = opt.tabId
    this.__ext_id__ = opt.extId
  }

  public static tab (tab: chrome.tabs.Tab | number): Client<typeof chrome.tabs> {
    if (typeof tab === 'number') return new Client<typeof chrome.tabs>({ module: chrome.tabs, tabId: tab })
    return new Client<typeof chrome.tabs>({ module: chrome.tabs, tabId: tab.id })
  }

  public static runtime (extId?: string): Client<typeof chrome.runtime> {
    return new Client<typeof chrome.runtime>({ module: chrome.runtime, extId })
  }

  public async send<Message = Record<string, unknown>, Response = any>(action: string, message?: Message): Promise<Response>
  public async send<Message = Record<string, unknown>, Response = any>(message: MessageWithAction<Message>): Promise<Response>
  public async send<Message = Record<string, unknown>, Response = any>(a: string | MessageWithAction<Message>, message = {}): Promise<Response> {
    if (typeof a === 'string') return await this.sendMessage({ [ActionKey]: a, ...(message || {}) })
    const _action_ = this.findActionKeyInMessage(a)
    if (!_action_) throw new Error('Action not found')
    return await this.sendMessage({ [ActionKey]: _action_, ...a })
  }

  private async sendMessage<Message = any, Response = any>(message: Message): Promise<Response> {
    if (this.__tab_id__) return await (this.__mod__ as typeof chrome.tabs).sendMessage(this.__tab_id__, message)
    if (this.__ext_id__) return await (this.__mod__ as typeof chrome.runtime).sendMessage(this.__ext_id__, message)
    return await (this.__mod__ as typeof chrome.runtime).sendMessage(message)
  }

  private findActionKeyInMessage (message: any): string | undefined {
    if (message.__action__) return message.__action__
    if (message._act_) return message._act_
    if (message.action) return message.action
    return undefined
  }

  // Shorthands
  public static _ = new Client({ module: chrome.runtime })
  public static $ = Client.tab
}
