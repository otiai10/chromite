import { Client, $ } from "../../src";

describe("Client", () => {
    it("should be a class", () => {
        const c = new Client(1000);
        expect(c).toBeInstanceOf(Client);
        // expect(c.greet()).toBe("hello");
    });
});

describe("$", () => {
    it("should do something", async () => {
        const res = await $().post();
        expect(res.aaa).toBe("bbb");
    });
})
