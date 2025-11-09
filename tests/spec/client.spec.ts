import { chrome } from 'jest-chrome'
import { Client } from '../../src'

describe('Client', () => {
  it('should be a class', async () => {
    const c = Client.tab(1000)
    await c.send({ action: 'otiai10' })
    expect(c).toBeInstanceOf(Client)
  })
})

describe('_', () => {
  // jest-chrome の型は Promise 戻り値を void と推論するため lint を抑制
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  chrome.runtime.sendMessage.mockImplementation(async (extId: string | null | undefined, message: { name: string }) => {
    return await Promise.resolve({ greet: `Hello, ${message.name}!` })
  })
  it('should be an instance of Client', () => {
    expect(Client._).toBeInstanceOf(Client)
  })
  it('should do something', async () => {
    const res = await Client._.send('/foo', { name: 'otiai10' })
    expect(res.greet).toBe('Hello, otiai10!')
    expect(chrome.runtime.sendMessage).toBeCalledWith(null, { __action__: '/foo', name: 'otiai10' })
  })
})

describe('$', () => {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  chrome.tabs.sendMessage.mockImplementation(async (tabId: number, message: { name: string }) => {
    return await Promise.resolve({ greet: `Hello, ${message.name}!` })
  })
  it('should be an instance of Client', () => {
    expect(Client.$).toBeInstanceOf(Function)
  })
  it('should do something', async () => {
    const res = await Client.$(1000).send('/bar', { name: 'otiai10' })
    expect(res.greet).toBe('Hello, otiai10!')
    expect(chrome.tabs.sendMessage).toBeCalledWith(1000, { __action__: '/bar', name: 'otiai10' })
  })
})
