export type Resolved<U = {}> = {
    name: string;
} & U;

type ExtractCallback<T> = T extends chrome.events.Event<infer U> ? U : never;
type HandlerOf<Callback extends (...args: any[]) => any> = (...args: Parameters<Callback>) => Promise<any | void>;
type Resolver<Callback extends (...args: any[]) => any, U = {}> = (...args: Parameters<Callback>) => Promise<Resolved<U>>;

export class Router<T extends chrome.events.Event<any>, U = {}> {

    constructor(private resolver: Resolver<ExtractCallback<T>, U>) { }

    private routes: { [name: string]: HandlerOf<ExtractCallback<T>> } = {};

    public on(name: string, callback: HandlerOf<ExtractCallback<T>>) {
        this.routes[name] = callback;
    }

    public listener(): ExtractCallback<T> {
        return ((...args: Parameters<ExtractCallback<T>>) => {
            const sendResponse = this.sendResponse(...args);
            this.resolver(...args).then(route => {
                // TODO: Handle notfound
                const fun = this.routes[route.name].bind({ route });
                fun(...args).then(sendResponse);
            })
            return true;
        }) as ExtractCallback<T>;
    }

    private sendResponse(...args): (any) => void {
        if (args.length == 0) return () => {};
        const f = args[args.length - 1];
        if (typeof f !== 'function') return () => {};
        if (f instanceof Function) return f;
        return () => {};
    }
}
