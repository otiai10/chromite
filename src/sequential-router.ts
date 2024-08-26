import { ActionKey } from './keys'
import {
  type Resolved,
  type Resolver,
  type RoutingTargetEvent,
  type ExtractCallback,
  type HandlerOf,
  DefaultResolver
} from './router'

// もういやや、TypeScriptの型パズル...
export type ExtractCallbackSequential<T> =
    T extends chrome.events.Event<infer U extends (...args: any[]) => any> ? (
      stack: Array<Parameters<U>[0]>,
      ...args: U extends (first: any, ...rest: infer V) => any ? V : never
    ) => ReturnType<U> :
        (T extends chrome.events.EventWithRequiredFilterInAddListener<infer V> ? (
          stack: V extends (...args: any) => any ? Array<Parameters<V>[0]> : never,
          ...args: V extends (first: any, ...rest: infer W) => any ? W : never
        ) => V extends (...args: any[]) => any ? ReturnType<V> : never : never)

const WildCard = '*'

interface Entry<Data = unknown> {
  [ActionKey]: string
  data?: Data | undefined | unknown
}

interface RouteSequentialMatcher<H, U = any> {
  match: (history: Entry[]) => Resolved<U> | undefined
  handelr: () => H
}

export class SequentialRouter<T extends RoutingTargetEvent, U = Record<string, unknown>> {
  constructor (
    public readonly length: number,
    public readonly resolver: Resolver<ExtractCallback<T>, U> = DefaultResolver
  ) { }

  private pool: Array<Entry<Parameters<ExtractCallbackSequential<T>>[0]>> = []

  // NotFound handler
  private readonly notfound: HandlerOf<ExtractCallback<T>> = async function (this: { route: Resolved<U> }, ...args) {
    // Do nothing
  }

  // Error handler
  private readonly error: HandlerOf<ExtractCallback<T>> = async function (this: { route: Resolved<U> }, ...args) {
    return { status: 500, message: `Handler for request "${this.route[ActionKey]}" throw an error` }
  }

  private readonly routes: {
    exact: Array<RouteSequentialMatcher<HandlerOf<ExtractCallbackSequential<T>>>>
  } = { exact: [] }

  on (actions: string[], callback: HandlerOf<ExtractCallbackSequential<T>>): unknown {
    return this.routes.exact.push({
      match: (history: Entry[]) => {
        const latest = history.slice(-actions.length)
        for (let i = 0; i < actions.length; i++) {
          if (actions[i] === WildCard) continue
          if (actions[i] !== latest[i][ActionKey]) return undefined
        }
        return { [ActionKey]: actions }
      },
      handelr: () => callback
    })
  }

  private findHandler (history: Entry[]): HandlerOf<ExtractCallbackSequential<T>> {
    const exact = this.routes.exact.find(r => r.match(history))
    if (exact != null) return exact.handelr().bind({ route: exact.match(history) })
    return this.notfound.bind({ route: { [ActionKey]: history } })
  }

  public listener (): ExtractCallback<T> {
    return ((...args: Parameters<ExtractCallback<T>>) => {
      const sendResponse = this.sendResponse(...args)
      this.resolver(...args).then(route => {
        this.pool.push({ [ActionKey]: route[ActionKey], data: args[0] })
        const fn = this.findHandler(this.pool.slice(-this.length))
        const stacked = this.pool.map(e => e.data) as Array<Parameters<ExtractCallbackSequential<T>>[0]>
        const _args = [stacked, ...args.slice(1)] as Parameters<ExtractCallbackSequential<T>>
        const res = fn(..._args)
        if (res instanceof Promise) {
          res.then(sendResponse).catch(err => this.error.bind({
            route, error: err
          })(...args).then(sendResponse))
        } else sendResponse(res)
        this.pool = this.pool.slice(-this.length)
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
