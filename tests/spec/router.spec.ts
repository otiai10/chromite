import { Router } from "../../src/router";

describe("Router", () => {
    it("should be a class", () => {
        const r = new Router(() => Promise.resolve({ name: "otiai10" }));
        expect(r).toBeInstanceOf(Router);
    });
});