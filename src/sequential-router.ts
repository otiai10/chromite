import { ActionKey } from './keys'
import {
  type Resolved,
  type Resolver,
  type RoutingTargetEvent,
  type ExtractCallback,
  DefaultResolver,
  type HandlerOf
} from './router'

interface RouteSequentialMatcher<H, U = any> {
  match: (history: string[]) => Resolved<U> | undefined
  handelr: () => H
}

export class SequentialRouter<T extends RoutingTargetEvent, U = Record<string, unknown>> {
  constructor (
    public readonly length: number,
    public readonly resolver: Resolver<ExtractCallback<T>, U> = DefaultResolver
  ) { }

  private pool: string[] = []

  // NotFound handler
  private readonly notfound: HandlerOf<ExtractCallback<T>> = async function (this: { route: Resolved<U> }, ...args) {
    // Do nothing
  }

  // Error handler
  private readonly error: HandlerOf<ExtractCallback<T>> = async function (this: { route: Resolved<U> }, ...args) {
    return { status: 500, message: `Handler for request "${this.route[ActionKey]}" throw an error` }
  }

  private readonly routes: {
    exact: Array<RouteSequentialMatcher<HandlerOf<ExtractCallback<T>>>>
  } = { exact: [] }

  on (actions: string[], callback: HandlerOf<ExtractCallback<T>>): unknown {
    return this.routes.exact.push({
      match: (history: string[]) => {
        const latest = history.slice(-actions.length)
        for (let i = 0; i < actions.length; i++) {
          if (actions[i] !== latest[i]) return undefined
        }
        return { [ActionKey]: actions }
      },
      handelr: () => callback
    })
  }

  private findHandler (history: string[]): HandlerOf<ExtractCallback<T>> {
    const exact = this.routes.exact.find(r => r.match(history))
    if (exact != null) return exact.handelr().bind({ route: exact.match(history) })
    return this.notfound.bind({ route: { [ActionKey]: history } })
  }

  public listener (): ExtractCallback<T> {
    return ((...args: Parameters<ExtractCallback<T>>) => {
      const sendResponse = this.sendResponse(...args)
      this.resolver(...args).then(route => {
        this.pool.push(route[ActionKey])
        const fn = this.findHandler(this.pool.slice(-this.length))
        const res = fn(...args)
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
