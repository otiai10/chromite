import { SequentialRouter } from '../../src/router'

describe('SequentialRouter', () => {
  it('should register a route', async () => {
    const r = new SequentialRouter(4, async (m: any) => await Promise.resolve({ __action__: m.action }))
    const c = jest.fn().mockName('callback')
    r.on(['/precommit', '/commit'], c)
    const listen = r.listener()
    const s = jest.fn().mockName('sendResponse')
    listen({ action: '/precommit' }, {}, s)
    expect(s).not.toBeCalled()
    listen({ action: '/commit' }, {}, s)
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(s).toBeCalled()
  })
})
