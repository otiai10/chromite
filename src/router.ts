export type Resolved<U = {}> = {
    action: string;
} & U;

type ExtractCallback<T> = T extends chrome.events.Event<infer U> ? U : never;
type HandlerOf<Callback extends (...args: any[]) => any> = (...args: Parameters<Callback>) => (Promise<any | void> | void);
type Resolver<Callback extends (...args: any[]) => any, U = {}> = (...args: Parameters<Callback>) => Promise<Resolved<U>>;

// type RouteMatcher<H> = {
//     match(action: string): boolean;
//     handelr(): H;
// }

export class Router<T extends chrome.events.Event<any>, U = {}> {

    constructor(private resolver: Resolver<ExtractCallback<T>, U>) { }

    private routes: { [action: string]: HandlerOf<ExtractCallback<T>> } = {};

    // private _routes: {
    //     exact: RouteMatcher<HandlerOf<ExtractCallback<T>>>[],
    //     regex: RouteMatcher<HandlerOf<ExtractCallback<T>>>[],
    // }

    public on(action: string, callback: HandlerOf<ExtractCallback<T>>) {
        // name.split("/").filter
        this.routes[action] = callback;
    }

    public listener(): ExtractCallback<T> {
        return ((...args: Parameters<ExtractCallback<T>>) => {
            const sendResponse = this.sendResponse(...args);
            this.resolver(...args).then(route => {
                // TODO: Handle notfound
                const fun = this.routes[route.action].bind({ route });
                const res = fun(...args);
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
