import { ActionKey, ActionKeyAlias } from "./keys";

type HasAlias<T extends string> = { [K in T]: { [P in K]: string } }[T];
type MessageWithAction<Message> = HasAlias<ActionKeyAlias> & Message;

export class Client<MessageModule = (typeof chrome.runtime | typeof chrome.tabs)> {
    private __mod__: typeof chrome.runtime | typeof chrome.tabs;
    private __tab_id__?: number;
    private __ext_id__?: string;
    constructor(tabId: number);
    constructor(tabId: number, mod: typeof chrome.tabs);
    constructor(extId: string);
    constructor(extId: string, mod: typeof chrome.runtime);
    constructor(tab: chrome.tabs.Tab);
    constructor(mod: MessageModule);
    constructor(a: number | string | chrome.tabs.Tab | MessageModule, b?: MessageModule) {
        if (typeof a === "number") {
            this.__mod__ = b ? (b as typeof chrome.tabs) : chrome.tabs;
            this.__tab_id__ = a;
        } else if (typeof a === "string") {
            this.__mod__ = b ? (b as typeof chrome.runtime) : chrome.runtime;
            this.__ext_id__ = a;
        } else if (typeof a === "object" && a["id"] !== undefined && a["url"] !== undefined) {
            a = a as chrome.tabs.Tab;
            this.__mod__ = chrome.tabs;
            this.__tab_id__ = a.id;
        } else {
            this.__mod__ = a as (typeof chrome.runtime | typeof chrome.tabs);
        }
    }

    public async send<Message = any, Response = any>(action: string): Promise<Response>;
    public async send<Message = any, Response = any>(action: string, message: Message): Promise<Response>;
    public async send<Message = any, Response = any>(message: MessageWithAction<Message>): Promise<Response>;
    public async send<Message = any, Response = any>(a: string | MessageWithAction<Message>, message?: Message): Promise<Response> {
        if (typeof a === "string") return this.sendMessage({ [ActionKey]: a, ...(message || {}) });
        const __action__ = this.findActionKeyInMessage(a);
        if (!__action__) throw new Error("Action not found");
        return this.sendMessage({ [ActionKey]: __action__, ...a });
    }

    private sendMessage<Message = any, Response = any>(message: Message): Promise<Response> {
        if (this.__tab_id__) return (this.__mod__ as typeof chrome.tabs).sendMessage(this.__tab_id__, message);
        if (this.__ext_id__) return (this.__mod__ as typeof chrome.runtime).sendMessage(this.__ext_id__, message);
        return (this.__mod__ as typeof chrome.runtime).sendMessage(message);
    }

    private findActionKeyInMessage(message: any): string | undefined {
        if (message.__action__) return message.__action__;
        if (message._act_) return message._act_;
        if (message.action) return message.action;
        return undefined;
    }
}

// Shorthand for chrome.runtime Client
export const _ = new Client<typeof chrome.runtime>(chrome.runtime);

// Shortcuts for chrome.tabs Client
export function $(tabId: number): Client<typeof chrome.tabs>;
export function $(tab: chrome.tabs.Tab): Client<typeof chrome.tabs>;
export function $(tab: number | chrome.tabs.Tab): Client<typeof chrome.tabs> {
    if (typeof tab === "number") return new Client<typeof chrome.tabs>(tab);
    return new Client<typeof chrome.tabs>(tab);
}
