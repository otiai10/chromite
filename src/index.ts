export type MessagingModule = typeof chrome.runtime | typeof chrome.tabs;

export class Client {
    private module: typeof chrome.runtime | typeof chrome.tabs;
    private tabId?: number;
    constructor(tabId: number);
    constructor(tab: chrome.tabs.Tab);
    constructor(m: typeof chrome.runtime | typeof chrome.tabs);
    constructor(a: number | chrome.tabs.Tab | MessagingModule) {
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
}

