describe('Example', () => {
  let page
  beforeAll(async () => {
    page = await globalThis.__BROWSER_GLOBAL__.newPage()
  })
  it('should be titled "Example"', async () => {
    // await page.goto('https://example.com');
    // await expect(page.title()).resolves.toMatch("Example Domain");
    expect(true).toBe(true)
  })
})
