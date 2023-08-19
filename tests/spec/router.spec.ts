import { Router } from "../../src";

describe("Router", () => {
    it("should be a class", () => {
        const r = new Router(() => Promise.resolve({ __action__: "/foobar" }));
        expect(r).toBeInstanceOf(Router);
    });

    it("should be constructed by default resolver if not given",  () => {
        const r = new Router();
    });

    describe("on", () => {
        it("should register a route", async () => {
            const r = new Router((m: any) => Promise.resolve({ __action__: m["action"] }));
            const callback = jest.fn().mockName("callback").mockImplementation((message: any) => {
                return { message: `Hello, ${message.name}` };
            });
            const sendResponse = jest.fn().mockName("sendResponse");
            r.on("/greet", callback);
            r.listener()({ action: "/greet", name: "otiai10" }, {}, sendResponse);
            await new Promise(resolve => setTimeout(resolve, 0));
            expect(callback).toBeCalled();
            expect(sendResponse).toBeCalled();
        });
    });
});