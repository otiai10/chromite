import { Logger, LogLevel } from '../../src/logger'

describe('Logger', () => {
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
})
