import { ActionKey, ActionKeyAlias } from './keys'

export type Resolved<U = Record<string, unknown>> = {
  [ActionKey]: string
} & U

// type ExtractCallback<T> = T extends chrome.events.Event<infer U> ? U : never
export type RoutingTargetEvent = chrome.events.Event<(...args: any[]) => any> | chrome.webRequest.WebRequestEvent<(...args: any[]) => any, string[]>
export type ExtractCallback<T> = T extends chrome.events.Event<infer U> ? U : (T extends chrome.webRequest.WebRequestEvent<infer V, any> ? V : never)
export type HandlerOf<Callback extends (...args: any[]) => any> = (...args: Parameters<Callback>) => (Promise<any | undefined> | undefined)
export type Resolver<Callback extends (...args: any[]) => any, U = Record<string, unknown>> = (...args: Parameters<Callback>) => (Resolved<U> | Promise<Resolved<U>>)

interface RouteMatcher<H, U = any> {
  match: (action: string) => Resolved<U> | undefined
  handelr: () => H
}

export const DefaultResolver = <U = any>(...args): Resolved<U> => {
  const alias = ActionKeyAlias.find(a => args[0][a] !== undefined)
  if (alias === undefined) return { [ActionKey]: '__notfound__', ...args[0] }
  return { [ActionKey]: args[0][alias], ...args[0] }
}

export class Router<T extends RoutingTargetEvent, U = Record<string, unknown>> {
  constructor (public readonly resolver: Resolver<ExtractCallback<T>, U> = DefaultResolver) { }

  // NotFound handler
  private notfound: HandlerOf<ExtractCallback<T>> = async function (this: { route: Resolved<U> }, ...args) {
    // This is default 404 handler
    return { status: 404, message: `Handler for request "${this.route[ActionKey]}" not found` }
  }

  // onNotFound can overwrite behavior for 404
  public onNotFound (callback: HandlerOf<ExtractCallback<T>>): void {
    this.notfound = callback
  }

  // Error handler
  private error: HandlerOf<ExtractCallback<T>> = async function (this: { route: Resolved<U> }, ...args) {
    return { status: 500, message: `Handler for request "${this.route[ActionKey]}" throw an error` }
  }

  // onError can overwire behavior for 500-ish error
  public onError (callback: HandlerOf<ExtractCallback<T>>): void {
    this.error = callback
  }

  private readonly routes: {
    exact: Array<RouteMatcher<HandlerOf<ExtractCallback<T>>>>
    regex: Array<RouteMatcher<HandlerOf<ExtractCallback<T>>>>
  } = { exact: [], regex: [] }

  public on (action: string, callback: HandlerOf<ExtractCallback<T>>): unknown {
    let includesRegex = false
    const segments = action.split('/').filter(c => c !== '').map(c => {
      if (c.startsWith('{') && c.endsWith('}')) {
        includesRegex = true
        const name = c.slice(1, c.length - 1)
        return `(?<${name}>[^\\/]+)`
      }
      return c
    })
    if (!includesRegex) {
      return this.routes.exact.push({
        match: (a) => a === action ? { [ActionKey]: action } : undefined,
        handelr: () => callback
      })
    }
    const str = '^' + '\\/' + segments.join('\\/') + '$'
    const regex = new RegExp(str)
    return this.routes.regex.push({
      match: (act) => {
        const m = act.match(regex)
        if (m != null) return { [ActionKey]: action, ...m.groups }
        return undefined
      },
      handelr: () => callback
    })
  }

  private findHandler (action: string): HandlerOf<ExtractCallback<T>> {
    const exact = this.routes.exact.find(r => r.match(action))
    if (exact != null) return exact.handelr().bind({ route: exact.match(action) })
    const regex = this.routes.regex.find(r => r.match(action))
    if (regex != null) return regex.handelr().bind({ route: regex.match(action) })
    return this.notfound.bind({ route: { [ActionKey]: action } })
  }

  public listener (): ExtractCallback<T> {
    return ((...args: Parameters<ExtractCallback<T>>) => {
      const sendResponse = this.sendResponse(...args)
      const resolved = this.resolver(...args);
      (resolved instanceof Promise ? resolved : Promise.resolve(resolved)).then(route => {
        const fn = this.findHandler(route[ActionKey])
        const res = fn(...args)
        if (res instanceof Promise) {
          res.then(sendResponse).catch(err => this.error.bind({
            route, error: err
          })(...args).then(sendResponse))
        } else sendResponse(res)
      }).catch(err => {
        const fn = this.error.bind({ route: { [ActionKey]: '__router_error__', error: err } })
        void fn(...args).then(sendResponse)
      })
      return true
    }) as ExtractCallback<T>
  }

  private sendResponse (...args): (any) => void {
    if (args.length === 0) return () => {}
    return typeof args[args.length - 1] === 'function'
      ? args[args.length - 1]
      : () => {}
  }
}
