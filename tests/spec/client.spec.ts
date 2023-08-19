import { chrome } from 'jest-chrome';
import { Client, _, $ } from "../../src";

describe("Client", () => {
    it("should be a class", async () => {
        let c = new Client(1000);
        c = new Client({ id: 1000, url: "https://example.com" });
        c = new Client(chrome.runtime);
        await c.send({ name: "otiai10" });
        expect(c).toBeInstanceOf(Client);
    });
});

describe("_", () => {
    chrome.runtime.sendMessage.mockImplementation((message: any) => {
        return Promise.resolve({ greet: `Hello, ${message.name}!` });
    });
    it("should be an instance of Client", () => {
        expect(_).toBeInstanceOf(Client);
    });
    it("should do something", async () => {
        const res = await _.send({ name: "otiai10" });
        expect(res.greet).toBe("Hello, otiai10!");
        expect(chrome.runtime.sendMessage).toBeCalledWith({ name: "otiai10" });
    });
});

describe("$", () => {
    chrome.tabs.sendMessage.mockImplementation((tabId: number, message: any) => {
        return Promise.resolve({ greet: `Hello, ${message.name}!` });
    });
    it("should be an instance of Client", () => {
        expect($).toBeInstanceOf(Function);
    });
    it("should do something", async () => {
        const res = await $(1000).send({ name: "otiai10" });
        expect(res.greet).toBe("Hello, otiai10!");
        expect(chrome.tabs.sendMessage).toBeCalledWith(1000, { name: "otiai10" });
    });
});
