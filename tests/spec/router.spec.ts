import { Router } from '../../src'

describe('Router', () => {
  it('should be a class', () => {
    const r = new Router(async () => await Promise.resolve({ __action__: '/foobar' }))
    expect(r).toBeInstanceOf(Router)
  })

  it('should be constructed by default resolver if not given', async () => {
    const r = new Router()
    const callback = jest.fn().mockName('callback').mockImplementation((message: { name: string }) => {
      return { message: `Hello, ${message.name}` }
    })
    const sendResponse = jest.fn().mockName('sendResponse')
    r.on('/greet', callback)
    r.listener()({ action: '/greet', name: 'otiai10' }, {}, sendResponse)
    await new Promise(resolve => setTimeout(resolve, 0))
  })

  describe('on', () => {
    it('should register a route', async () => {
      const r = new Router(async (m: any) => await Promise.resolve({ __action__: m.action }))
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
      const r = new Router()
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
      const r = new Router()
      const sendResponse = jest.fn().mockName('sendResponse')
      r.listener()({ action: '/notfound' }, {}, sendResponse)
      await new Promise(resolve => setTimeout(resolve, 0))
      expect(sendResponse).toBeCalledWith({ status: 404, message: 'Handler for request "/notfound" not found' })
    })
  })
  describe('onNotFound', () => {
    it('should overwrite a handler for not found', async () => {
      const r = new Router()
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
})
