import { chrome } from 'jest-chrome';
import { Client, _ } from "../../src";

describe("Client", () => {
    it("should be a class", () => {
        const c = new Client(1000);
        expect(c).toBeInstanceOf(Client);
    });
});

describe("_", () => {
    chrome.runtime.sendMessage.mockImplementation((message: any) => {
        return Promise.resolve({ greet: `Hello, ${message.name}!` });
    });
    it("should do something", async () => {
        const res = await _.send({ name: "otiai10" });
        expect(res.greet).toBe("Hello, otiai10!");
    });
})
