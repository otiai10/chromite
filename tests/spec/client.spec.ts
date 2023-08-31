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
  chrome.runtime.sendMessage.mockImplementation(async (extId: string | null | undefined, message: any) => {
    const name: string = message.name
    return await Promise.resolve({ greet: `Hello, ${name}!` })
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
  chrome.tabs.sendMessage.mockImplementation(async (tabId: number, message: any) => {
    const name: string = message.name
    return await Promise.resolve({ greet: `Hello, ${name}!` })
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
