
export class Client<MessageModule = (typeof chrome.runtime | typeof chrome.tabs)> {
    private __mod__: typeof chrome.runtime | typeof chrome.tabs;
    private __tab__?: { id: number, url?: string };
    constructor(tabId: number);
    constructor(tab: chrome.tabs.Tab);
    constructor(m: MessageModule);
    constructor(a: number | chrome.tabs.Tab | MessageModule) {
        if (typeof a === "number") {
            this.__mod__ = chrome.tabs;
            this.__tab__ = { id: a };
        } else if (typeof a === "object" && a["id"] !== undefined && a["url"] !== undefined) {
            a = a as chrome.tabs.Tab;
            this.__mod__ = chrome.tabs;
            this.__tab__ = { id: a.id, url: a.url };
        } else {
            this.__mod__ = a as (typeof chrome.runtime | typeof chrome.tabs);
        }
    }

    public async send<Message = any, Response = any>(message: Message): Promise<Response> {
        if (this.__tab__?.id) return (this.__mod__ as typeof chrome.tabs).sendMessage(this.__tab__.id, message);
        return (this.__mod__ as typeof chrome.runtime).sendMessage(message);
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
