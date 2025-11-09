import { Logger, LogLevel } from '../../src/logger'

describe('Logger', () => {
  afterEach(() => {
    Logger.setLevel(LogLevel.INFO)
    Logger.setEmoji(false) // Disable emoji
    Logger.setStyle(true) // Enable style with defaults
  })

  describe('new', () => {
    it('should create a logger instance', () => {
      const logger = new Logger('test')
      expect(logger).toBeInstanceOf(Logger)
    })
  })
  describe('level', () => {
    it('should have INFO level by default', () => {
      console.debug = jest.fn().mockName('debug')
      console.info = jest.fn().mockName('info')
      console.warn = jest.fn().mockName('warn')
      console.error = jest.fn().mockName('error')
      const logger = new Logger('test')
      expect(logger.level).toBe(1)
      logger.debug('hello', 'world')
      expect(console.debug).not.toBeCalled()
      logger.setLevel(LogLevel.DEBUG)
      expect(logger.level).toBe(0)
      logger.debug('hello', 'world', 'again')
      expect(console.debug).toBeCalledWith('(test) %c[DEBUG]', 'color:WHITE; background-color:CORAL; font-weight:BOLD;', 'hello', 'world', 'again')
      logger.info('hello', 'world', 'info')
      expect(console.info).toBeCalledWith('(test) %c[INFO]', 'color:WHITE; background-color:GREY;  font-weight:BOLD;', 'hello', 'world', 'info')
      logger.warn('hello', 'world', 'warn')
      expect(console.warn).toBeCalledWith('(test) %c[WARN]', 'color:BLACK; background-color:GOLD;  font-weight:BOLD;', 'hello', 'world', 'warn')
      logger.error('hello', 'world', 'error')
      expect(console.error).toBeCalledWith('(test) %c[ERROR]', 'color:WHITE; background-color:RED;   font-weight:BOLD;', 'hello', 'world', 'error')
    })
  })

  describe('get', () => {
    it('should return the same instance for the same project name', () => {
      const loggerA = Logger.get('ui')
      const loggerB = Logger.get('ui')
      expect(loggerA).toBe(loggerB)
    })

    it('should allow overriding level at creation', () => {
      const logger = Logger.get('worker', { level: LogLevel.ERROR })
      expect(logger.level).toBe(LogLevel.ERROR)
    })

    it('should propagate Logger.setLevel to cached loggers', () => {
      const logger = Logger.get('background')
      expect(logger.level).toBe(LogLevel.INFO)
      Logger.setLevel(LogLevel.DEBUG)
      expect(logger.level).toBe(LogLevel.DEBUG)
    })
  })

  describe('visual configuration', () => {
    it('should apply global emoji settings to all loggers', () => {
      console.info = jest.fn().mockName('info')
      Logger.setEmoji({
        [LogLevel.INFO]: '✨'
      })
      const logger = Logger.get('ui')
      logger.info('hello')
      expect(console.info).toBeCalledWith('(ui) ✨ %c[INFO]', 'color:WHITE; background-color:GREY;  font-weight:BOLD;', 'hello')
    })

    it('should disable emoji when false is passed', () => {
      console.info = jest.fn().mockName('info')
      Logger.setEmoji({ [LogLevel.INFO]: '✨' })
      Logger.setEmoji(false)
      const logger = Logger.get('ui-no-emoji')
      logger.info('hello')
      expect(console.info).toBeCalledWith('(ui-no-emoji) %c[INFO]', 'color:WHITE; background-color:GREY;  font-weight:BOLD;', 'hello')
    })

    it('should enable emoji with defaults when true is passed', () => {
      console.info = jest.fn().mockName('info')
      Logger.setEmoji(true)
      const logger = Logger.get('ui-default-emoji-true')
      logger.info('hello')
      expect(console.info).toBeCalledWith('(ui-default-emoji-true) 💡 %c[INFO]', 'color:WHITE; background-color:GREY;  font-weight:BOLD;', 'hello')
    })

    it('should disable style output when false is passed', () => {
      console.warn = jest.fn().mockName('warn')
      Logger.setStyle(false)
      const logger = Logger.get('ui-no-style')
      logger.warn('something')
      expect(console.warn).toBeCalledWith('(ui-no-style) %c[WARN]', '', 'something')
    })

    it('should enable style with defaults when true is passed', () => {
      console.warn = jest.fn().mockName('warn')
      Logger.setStyle(true)
      const logger = Logger.get('ui-default-style-true')
      logger.warn('something')
      expect(console.warn).toBeCalledWith('(ui-default-style-true) %c[WARN]', 'color:BLACK; background-color:GOLD;  font-weight:BOLD;', 'something')
    })
  })
})
