import { ActionKey, ActionKeyAlias } from "./keys";

export type Resolved<U = {}> = {
    [ActionKey]: string;
} & U;

type ExtractCallback<T> = T extends chrome.events.Event<infer U> ? U : never;
type HandlerOf<Callback extends (...args: any[]) => any> = (...args: Parameters<Callback>) => (Promise<any | void> | void);
type Resolver<Callback extends (...args: any[]) => any, U = {}> = (...args: Parameters<Callback>) => Promise<Resolved<U>>;

type RouteMatcher<H, U = any> = {
    match(action: string): Resolved<U> | undefined;
    handelr(): H;
}

const DefaultResolver = (...args) => {
    const alias = ActionKeyAlias.find(a => args[0][a] !== undefined);
    const key = args[0][alias];
    return Promise.resolve({ [ActionKey]: key, ...args[0] });
};

export class Router<T extends chrome.events.Event<any>, U = {}> {

    constructor(private resolver: Resolver<ExtractCallback<T>, U> = DefaultResolver) { }

    // private routes: { [action: string]: HandlerOf<ExtractCallback<T>> } = {};

    private notfound: HandlerOf<ExtractCallback<T>> = () => { };
    public onNotFound(callback: HandlerOf<ExtractCallback<T>>) {
        this.notfound = callback;
    }

    private routes: {
        exact: RouteMatcher<HandlerOf<ExtractCallback<T>>>[],
        regex: RouteMatcher<HandlerOf<ExtractCallback<T>>>[],
    } = { exact: [], regex: [] };

    public on(action: string, callback: HandlerOf<ExtractCallback<T>>) {
        let includesRegex = false;
        const segments = action.split("/").filter(c => c !== "").map(c => {
            if (c.startsWith("{") && c.endsWith("}")) {
                includesRegex = true;
                const name = c.slice(1, c.length - 1);
                return `(?<${name}>[^\\\/]+)`;
            }
            return c;
        })
        if (!includesRegex) {
            return this.routes.exact.push({
                match: (a) => a === action ? { [ActionKey]: action } : undefined,
                handelr: () => callback,
            });
        }
        const str = "^" + "\\\/" + segments.join("\\\/") + "$";
        const regex = new RegExp(str);
        return this.routes.regex.push({
            match: (act) => {
                const m = act.match(regex);
                if (m) return { [ActionKey]: action, ...m.groups };
                return undefined;
            },
            handelr: () => callback,
        });
    }

    private findHandler(action: string): HandlerOf<ExtractCallback<T>> {
        const exact = this.routes.exact.find(r => r.match(action));
        if (exact) return exact.handelr().bind({ route: exact.match(action) });
        const regex = this.routes.regex.find(r => r.match(action));
        if (regex) return regex.handelr().bind({ route: regex.match(action) });
        return this.notfound;
    }

    public listener(): ExtractCallback<T> {
        return ((...args: Parameters<ExtractCallback<T>>) => {
            const sendResponse = this.sendResponse(...args);
            this.resolver(...args).then(route => {
                const fn = this.findHandler(route[ActionKey]);
                const res = fn(...args);
                if (res instanceof Promise) res.then(sendResponse);
                else sendResponse(res);
            })
            return true;
        }) as ExtractCallback<T>;
    }

    private sendResponse(...args): (any) => void {
        if (args.length == 0) return () => {};
        return typeof args[args.length - 1] === 'function'
            ? args[args.length - 1] : () => {};
    }
}
