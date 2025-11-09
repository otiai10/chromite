/* eslint-disable no-new */
import { Router } from '../../src'

type RuntimeMessageEvent = typeof chrome.runtime.onMessage
type RuntimeConnectEvent = typeof chrome.runtime.onConnect
type TabsActivatedEvent = typeof chrome.tabs.onActivated
type TabsAttachedEvent = typeof chrome.tabs.onAttached
type TabsCreatedEvent = typeof chrome.tabs.onCreated
type TabsDetachedEvent = typeof chrome.tabs.onDetached
type TabsHighlightedEvent = typeof chrome.tabs.onHighlighted
type WebNavigationCommittedEvent = typeof chrome.webNavigation.onCommitted
type WebNavigationHistoryStateUpdatedEvent = typeof chrome.webNavigation.onHistoryStateUpdated
type WebNavigationTabReplacedEvent = typeof chrome.webNavigation.onTabReplaced
type WebNavigationCreatedTargetEvent = typeof chrome.webNavigation.onCreatedNavigationTarget
type WebRequestBodyEvent = typeof chrome.webRequest.onBeforeRequest
type WebRequestHeadersEvent = typeof chrome.webRequest.onBeforeSendHeaders
type AlarmsEvent = typeof chrome.alarms.onAlarm

describe('Router', () => {
  it('should be a class', () => {
    const r = new Router(() => ({ __action__: '/foobar' }))
    expect(r).toBeInstanceOf(Router)
  })

  it('should be constructed by default resolver if not given', async () => {
    const r = new Router<RuntimeMessageEvent>()
    const callback = jest.fn().mockName('callback').mockImplementation((message: { name: string }) => {
      return { message: `Hello, ${message.name}` }
    })
    const sendResponse = jest.fn().mockName('sendResponse')
    r.on('/greet', callback)
    r.listener()({ action: '/greet', name: 'otiai10' }, {}, sendResponse)
    await new Promise(resolve => setTimeout(resolve, 0))
  })
  it('should be constructed with EventWithRequiredFilterInAddListener generics', async () => {
    const r = new Router<WebRequestBodyEvent>(async (details: chrome.webRequest.OnBeforeRequestDetails) => {
      return { __action__: '/test' }
    })
    expect(r).toBeInstanceOf(Router)
  })

  describe('on', () => {
    it('should register a route', async () => {
      const r = new Router<RuntimeMessageEvent>(async (m: any) => await Promise.resolve({ __action__: m.action }))
      const callback = jest.fn().mockName('callback').mockImplementation((message: { name: string }) => {
        return { message: `Hello, ${message.name}` }
      })
      const sendResponse = jest.fn().mockName('sendResponse')
      r.on('/greet', callback)
      r.listener()({ action: '/greet', name: 'otiai10' }, {}, sendResponse)
      await new Promise(resolve => setTimeout(resolve, 0))
      expect(callback).toBeCalled()
      expect(sendResponse).toBeCalled()
    })

    it('should parse {} in action and path parameters', async () => {
      const r = new Router<RuntimeMessageEvent>()
      const fn = function (this: { route: { name: string } }, message: any): any {
        return { message: `Hello, ${this.route.name}!` }
      }
      const callback = jest.fn().mockName('callback').mockImplementation(fn)
      const sendResponse = jest.fn().mockName('sendResponse')
      r.on('/greet/{name}', callback)
      r.listener()({ action: '/greet/otiai10', name: 'otiai10' }, {}, sendResponse)
      await new Promise(resolve => setTimeout(resolve, 0))
      expect(callback).toBeCalled()
      expect(sendResponse).toBeCalled()
      expect(sendResponse).toBeCalledWith({ message: 'Hello, otiai10!' })
    })
  })

  describe('default NotFound handler', () => {
    it('should send response with status:404', async () => {
      const r = new Router<RuntimeMessageEvent>()
      const sendResponse = jest.fn().mockName('sendResponse')
      r.listener()({ action: '/notfound' }, {}, sendResponse)
      await new Promise(resolve => setTimeout(resolve, 0))
      expect(sendResponse).toBeCalledWith({ status: 404, message: 'Handler for request "/notfound" not found' })
    })
  })
  describe('onNotFound', () => {
    it('should overwrite a handler for not found', async () => {
      const r = new Router<RuntimeMessageEvent>()
      const callback = jest.fn().mockName('callback').mockImplementation(async function (this: any) {
        return { message: 'See you yesterday ;)', status: 5004 }
      })
      const sendResponse = jest.fn().mockName('sendResponse')
      r.onNotFound(callback)
      r.listener()({ action: '/notfound' }, {}, sendResponse)
      await new Promise(resolve => setTimeout(resolve, 0))
      expect(callback).toBeCalled()
      expect(sendResponse).toBeCalledWith({ status: 5004, message: 'See you yesterday ;)' })
    })
  })

  describe('onError', () => {
    it('should overwrite a handler for error', async () => {
      const r = new Router<RuntimeMessageEvent, { status: number }>()
      const onerror = jest.fn().mockName('callback').mockImplementation(async function (this: any) {
        return { message: 'See you yesterday ;)', status: 500, error: this.error }
      })
      const sendResponse = jest.fn().mockName('sendResponse')
      r.onError(onerror)
      r.on('/problem', async function () {
        throw new Error('Something wrong')
      })
      r.listener()({ action: '/problem' }, {}, sendResponse)
      await new Promise(resolve => setTimeout(resolve, 0))
      expect(onerror).toBeCalled()
      expect(sendResponse).toBeCalledWith({ status: 500, message: 'See you yesterday ;)', error: new Error('Something wrong') })
    })
  })

  describe('should accept all the event types provided by chrome APIs', () => {
    // runtime
    new Router<RuntimeMessageEvent>()
    new Router<RuntimeConnectEvent>()
    // tabs
    new Router<TabsActivatedEvent>()
    new Router<TabsAttachedEvent>()
    new Router<TabsCreatedEvent>()
    new Router<TabsDetachedEvent>()
    new Router<TabsHighlightedEvent>()
    // webNavigation
    new Router<WebNavigationCommittedEvent>()
    new Router<WebNavigationHistoryStateUpdatedEvent>()
    new Router<WebNavigationTabReplacedEvent>()
    new Router<WebNavigationCreatedTargetEvent>()
    // webRequest
    new Router<WebRequestBodyEvent>()
    new Router<WebRequestHeadersEvent>()
    // alarms
    new Router<AlarmsEvent>((alarm: chrome.alarms.Alarm) => {
      return { __action__: alarm.name }
    })
  })
})
