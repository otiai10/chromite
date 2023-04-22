/// <reference types="chrome" />

globalThis.log = [];
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    globalThis.log.push(message);
    sendResponse({ log: globalThis.log });
});