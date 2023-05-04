export type Messagable = typeof chrome.runtime | typeof chrome.tabs;

export class Client {
    private module: typeof chrome.runtime | typeof chrome.tabs;
    private tabId?: number;
    constructor(tabId: number);
    constructor(tab: chrome.tabs.Tab);
    constructor(m: Messagable);
    constructor(a: number | chrome.tabs.Tab | Messagable) {
        if (typeof a === "number") {
            this.module = chrome.tabs;
            this.tabId = a;
        } else if (typeof a === "object" && a["id"] !== undefined && a["url"] !== undefined) {
            a = a as chrome.tabs.Tab;
            this.module = chrome.tabs;
            this.tabId = a.id;
        } else {
            this.module = a as (typeof chrome.runtime | typeof chrome.tabs);
        }
    }

    public async post(): Promise<any> {
        return Promise.resolve({aaa: "bbb"});
    }
}

export function $(): Client;
export function $(tabId: number): Client;
export function $(tab: chrome.tabs.Tab): Client;
export function $(m: Messagable): Client;
export function $(a?: number | chrome.tabs.Tab | Messagable): Client {
    if (a === undefined) {
        return new Client(chrome.runtime);
    }
    if (typeof a === "number") {
        return new Client(a);
    }
    if (typeof a === "object" && a["id"] !== undefined && a["url"] !== undefined) {
        return new Client(a as chrome.tabs.Tab);
    }
    return new Client(a as Messagable);
}
