import { SequentialRouter } from '../../src/sequential-router'

describe('SequentialRouter', () => {
  it('should register a route', async () => {
    const r = new SequentialRouter<chrome.runtime.ExtensionMessageEvent>(4, async (m: any) => await Promise.resolve({ __action__: m.action }))
    const c = jest.fn().mockName('callback')
    r.on(['/precommit', '/commit'], c)
    const listen = r.listener()
    const sendResponse = jest.fn().mockName('sendResponse')
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const sender = { tab: { id: 123 } } as chrome.runtime.MessageSender
    listen({ action: '/unused', hash: 'aaa' }, sender, sendResponse)
    listen({ action: '/precommit', hash: 'xxx' }, sender, sendResponse)
    expect(sendResponse).not.toBeCalled()
    listen({ action: '/commit', hash: 'yyy' }, sender, sendResponse)
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(sendResponse).toBeCalled()
    expect(c).toBeCalled()
    expect(c).toBeCalledTimes(1)
    expect(c).toBeCalledWith([
      { action: '/precommit', hash: 'xxx' },
      { action: '/commit', hash: 'yyy' }
    ], { tab: { id: 123 } }, sendResponse)
  })
})
