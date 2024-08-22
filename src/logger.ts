export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export class Logger {
  public static global: {
    _level: LogLevel
    level: (level: LogLevel) => void
    // _format: string;
  } = {
      _level: LogLevel.INFO,
      level (l: LogLevel) {
        this._level = l
      }
    }

  constructor (
    public readonly project: string,
    public level: LogLevel = Logger.global._level
  ) { }

  public readonly emoji: {
    enabled: boolean
    dict: Record<LogLevel, string>
  } = {
      enabled: false,
      dict: {
        [LogLevel.DEBUG]: '🐞',
        [LogLevel.INFO]: '💡',
        [LogLevel.WARN]: '⚠️',
        [LogLevel.ERROR]: '🚨'
      }
    }

  public readonly style: {
    enabled: boolean
    dict: Record<LogLevel, string>
  } = {
      enabled: true,
      dict: {
        [LogLevel.DEBUG]: 'color:WHITE; background-color:CORAL; font-weight:BOLD;',
        [LogLevel.INFO]: 'color:WHITE; background-color:GREY;  font-weight:BOLD;',
        [LogLevel.WARN]: 'color:BLACK; background-color:GOLD;  font-weight:BOLD;',
        [LogLevel.ERROR]: 'color:WHITE; background-color:RED;   font-weight:BOLD;'
      }
    }

  public setLevel (level: LogLevel): Logger {
    this.level = level
    return this
  }

  public setEmoji (enabled: boolean, dict: Record<LogLevel, string>): Logger {
    this.emoji.enabled = enabled
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    Object.keys(LogLevel).map(k => (dict[k] ? (this.emoji.dict[k] = dict[k]) : null))
    return this
  }

  public setStyle (enabled: boolean, dict: Record<LogLevel, string>): Logger {
    this.style.enabled = enabled
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    Object.keys(LogLevel).map(k => (dict[k] ? (this.style.dict[k] = dict[k]) : null))
    return this
  }

  public debug (...args: unknown[]): void {
    if (this.level > LogLevel.DEBUG) return
    this.print(LogLevel.DEBUG, args)
  }

  public info (...args: unknown[]): void {
    if (this.level > LogLevel.INFO) return
    this.print(LogLevel.INFO, args)
  }

  public warn (...args: unknown[]): void {
    if (this.level > LogLevel.WARN) return
    this.print(LogLevel.WARN, args)
  }

  public error (...args: unknown[]): void {
    if (this.level > LogLevel.ERROR) return
    this.print(LogLevel.ERROR, args)
  }

  private print (level: LogLevel, args: unknown[]): void {
    const label = LogLevel[level]
    const head = `(${this.project}) ${this.emoji.enabled ? `${this.emoji.dict[level]} ` : ''}%c[${label}]`
    const style = this.style.enabled ? this.style.dict[level] : ''
    console.log(head, style, ...args)
  }
}
