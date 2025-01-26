import { Router } from '../../src'

describe('Router', () => {
  it('should be a class', () => {
    const r = new Router(async () => await Promise.resolve({ __action__: '/foobar' }))
    expect(r).toBeInstanceOf(Router)
  })

  it('should be constructed by default resolver if not given', async () => {
    const r = new Router<chrome.runtime.ExtensionMessageEvent>()
    const callback = jest.fn().mockName('callback').mockImplementation((message: { name: string }) => {
      return { message: `Hello, ${message.name}` }
    })
    const sendResponse = jest.fn().mockName('sendResponse')
    r.on('/greet', callback)
    r.listener()({ action: '/greet', name: 'otiai10' }, {}, sendResponse)
    await new Promise(resolve => setTimeout(resolve, 0))
  })
  it('should be constructed with EventWithRequiredFilterInAddListener generics', async () => {
    const r = new Router<chrome.webRequest.WebRequestBodyEvent>(async (details: chrome.webRequest.WebRequestBodyDetails) => {
      return { __action__: '/test' }
    })
    expect(r).toBeInstanceOf(Router)
  })

  describe('on', () => {
    it('should register a route', async () => {
      const r = new Router<chrome.runtime.ExtensionMessageEvent>(async (m: any) => await Promise.resolve({ __action__: m.action }))
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
      const r = new Router<chrome.runtime.ExtensionMessageEvent>()
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
      const r = new Router<chrome.runtime.ExtensionMessageEvent>()
      const sendResponse = jest.fn().mockName('sendResponse')
      r.listener()({ action: '/notfound' }, {}, sendResponse)
      await new Promise(resolve => setTimeout(resolve, 0))
      expect(sendResponse).toBeCalledWith({ status: 404, message: 'Handler for request "/notfound" not found' })
    })
  })
  describe('onNotFound', () => {
    it('should overwrite a handler for not found', async () => {
      const r = new Router<chrome.runtime.ExtensionMessageEvent>()
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
      const r = new Router<chrome.runtime.ExtensionMessageEvent, { status: number }>()
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
    new Router<chrome.runtime.ExtensionMessageEvent>();
    new Router<chrome.runtime.ExtensionConnectEvent>();
    // tabs
    new Router<chrome.tabs.TabActivatedEvent>();
    new Router<chrome.tabs.TabAttachedEvent>();
    new Router<chrome.tabs.TabCreatedEvent>();
    new Router<chrome.tabs.TabDetachedEvent>();
    new Router<chrome.tabs.TabHighlightedEvent>();
    // webNavigation
    new Router<chrome.webNavigation.WebNavigationFramedEvent>();
    new Router<chrome.webNavigation.WebNavigationSourceEvent>();
    new Router<chrome.webNavigation.WebNavigationParentedEvent>();
    new Router<chrome.webNavigation.WebNavigationTransitionalEvent>();
    // webRequest
    new Router<chrome.webRequest.WebRequestBodyEvent>();
    new Router<chrome.webRequest.WebRequestHeadersEvent>();
    // alarms
    new Router<chrome.alarms.AlarmEvent>();
  })
})
