import { ActionKey } from './keys'
import {
  type Resolved,
  type Resolver,
  type RoutingTargetEvent,
  type ExtractCallback,
  type HandlerOf,
  DefaultResolver
} from './router'

// eslint-disable-next-line @typescript-eslint/ban-types
export type StackCallback<F extends Function> =
  F extends (first: any, ...rest: infer V) => any ?
      (stack: Array<Parameters<F>[0]>, ...args: V) => ReturnType<F>
    : F extends (first: any) => any ?
        (stack: Array<Parameters<F>[0]>) => ReturnType<F>
      : never

type EventTypes = chrome.events.Event<any> | chrome.webRequest.WebRequestEvent<any, any>

export type ExtractCallbackSequential<T extends EventTypes> =
  T extends chrome.events.Event<infer U> ?
    StackCallback<U>
    : T extends chrome.webRequest.WebRequestEvent<infer U, any> ?
      StackCallback<U>
      : never

const WildCard = '*'

interface Entry<Data = unknown> {
  [ActionKey]: string
  data?: Data | undefined | unknown
}

interface RouteSequentialMatcher<H, U = any> {
  actions: string[]
  match: (history: Entry[]) => Resolved<U> | undefined
  handelr: () => H
}

export class SequentialRouter<T extends RoutingTargetEvent, U = Record<string, unknown>> {
  constructor (
    public readonly length: number,
    public readonly resolver: Resolver<ExtractCallback<T>, U> = DefaultResolver
  ) { }

  private pool: Array<Entry<Parameters<ExtractCallbackSequential<T>>[0]>> = []

  public onNotFound (callback: HandlerOf<ExtractCallbackSequential<T>>): void {
    this.notfound = callback
  }

  // NotFound handler
  private notfound: HandlerOf<ExtractCallbackSequential<T>> = async function (this: { route: Resolved<U> }, ...args) {
    // This is default 404 handler
    return { status: 404, message: `Handler for request "${this.route[ActionKey]}" not found` }
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
      actions,
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

  private findHandler (history: Entry[]): [HandlerOf<ExtractCallbackSequential<T>>, number] {
    const exact = this.routes.exact.find(r => r.match(history))
    if (exact != null) return [exact.handelr().bind({ route: exact.match(history) }), exact.actions.length]
    return [this.notfound.bind({ route: { [ActionKey]: history } }), this.length]
  }

  public listener (): ExtractCallback<T> {
    return ((...args: Parameters<ExtractCallback<T>>) => {
      const sendResponse = this.sendResponse(...args)
      const resolved = this.resolver(...args);
      (resolved instanceof Promise ? resolved : Promise.resolve(resolved)).then(route => {
        this.pool.push({ [ActionKey]: route[ActionKey], data: args[0] })
        const [fn, len] = this.findHandler(this.pool.slice(-this.length))
        const stacked = this.pool.map(e => e.data).slice(-len) as Array<Parameters<ExtractCallbackSequential<T>>[0]>
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
