/**
 * Enumerates the severity levels supported by the logger.
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

const defaultEmojiDict: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: '🐞',
  [LogLevel.INFO]: '💡',
  [LogLevel.WARN]: '⚠️',
  [LogLevel.ERROR]: '🚨'
}

const defaultStyleDict: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: 'color:WHITE; background-color:CORAL; font-weight:BOLD;',
  [LogLevel.INFO]: 'color:WHITE; background-color:GREY;  font-weight:BOLD;',
  [LogLevel.WARN]: 'color:BLACK; background-color:GOLD;  font-weight:BOLD;',
  [LogLevel.ERROR]: 'color:WHITE; background-color:RED;   font-weight:BOLD;'
}

/**
 * Lightweight console logger that caches instances per project name and
 * shares global visual configuration.
 */
export class Logger {
  private static readonly nullProjectKey = Symbol('logger:null-project')
  private static readonly registry: Map<string | symbol, Logger> = new Map()
  private static emojiConfig: {
    enabled: boolean
    dict: Record<LogLevel, string>
  } = {
      enabled: false,
      dict: { ...defaultEmojiDict }
    }
  private static styleConfig: {
    enabled: boolean
    dict: Record<LogLevel, string>
  } = {
      enabled: true,
      dict: { ...defaultStyleDict }
    }

  public static global: {
    _level: LogLevel
    level: (level: LogLevel) => void
    // _format: string;
  } = {
      _level: LogLevel.INFO,
      /**
       * @internal Legacy setter kept for backward compatibility.
       * @param l Desired log level. Use {@link Logger.setLevel} instead.
       * @returns void
       */
      level (l: LogLevel) {
        Logger.setLevel(l)
      }
    }

  constructor (
    public readonly project: string | null,
    public level: LogLevel = Logger.global._level
  ) { }

  /**
   * Retrieves a logger for the specified project, creating and caching it on first access.
   * @param project Project label used in log headers. `null` represents anonymous output.
   * @param options Optional overrides such as the initial {@link LogLevel}.
   * @returns Cached or newly created {@link Logger} instance for the project.
   */
  public static get (project: string | null, options?: { level?: LogLevel }): Logger {
    const key = project ?? Logger.nullProjectKey
    const existing = Logger.registry.get(key)
    if (existing != null) {
      if (options?.level != null) existing.setLevel(options.level)
      return existing
    }
    const instance = new Logger(project, options?.level ?? Logger.global._level)
    Logger.registry.set(key, instance)
    return instance
  }

  /**
   * Updates the log level of all registered loggers at once.
   * @param level Desired {@link LogLevel} threshold.
   * @returns void
   */
  public static setLevel (level: LogLevel): void {
    Logger.global._level = level
    Logger.registry.forEach(logger => {
      logger.level = level
    })
  }

  /**
   * Applies global emoji settings that affect every logger instance.
   * @param enabled Whether emoji prefixes should be rendered.
   * @param dict Partial dictionary overriding per-level emoji.
   * @returns void
   */
  public static setEmoji (enabled: boolean, dict: Record<LogLevel, string>): void {
    Logger.emojiConfig.enabled = enabled
    Logger.emojiConfig.dict = {
      ...Logger.emojiConfig.dict,
      ...dict
    }
  }

  /**
   * Applies global CSS styles used by console formatting.
   * @param enabled Whether CSS styling should be applied via `%c`.
   * @param dict Partial dictionary overriding per-level style strings.
   * @returns void
   */
  public static setStyle (enabled: boolean, dict: Record<LogLevel, string>): void {
    Logger.styleConfig.enabled = enabled
    Logger.styleConfig.dict = {
      ...Logger.styleConfig.dict,
      ...dict
    }
  }

  /**
   * Updates the threshold for this specific logger instance.
   * @param level Desired {@link LogLevel}.
   * @returns The current {@link Logger} for chaining.
   */
  public setLevel (level: LogLevel): Logger {
    this.level = level
    return this
  }

  /**
   * Emits a message at DEBUG level.
   * @param args Arbitrary arguments forwarded to `console.debug`.
   * @returns void
   */
  public debug (...args: unknown[]): void {
    if (this.level > LogLevel.DEBUG) return
    const _a = this.format(LogLevel.DEBUG, args)
    console.debug(..._a)
  }

  /**
   * Emits a message at INFO level.
   * @param args Arbitrary arguments forwarded to `console.info`.
   * @returns void
   */
  public info (...args: unknown[]): void {
    if (this.level > LogLevel.INFO) return
    const _a = this.format(LogLevel.INFO, args)
    console.info(..._a)
  }

  /**
   * Emits a message at WARN level.
   * @param args Arbitrary arguments forwarded to `console.warn`.
   * @returns void
   */
  public warn (...args: unknown[]): void {
    if (this.level > LogLevel.WARN) return
    const _a = this.format(LogLevel.WARN, args)
    console.warn(..._a)
  }

  /**
   * Emits a message at ERROR level.
   * @param args Arbitrary arguments forwarded to `console.error`.
   * @returns void
   */
  public error (...args: unknown[]): void {
    if (this.level > LogLevel.ERROR) return
    const _a = this.format(LogLevel.ERROR, args)
    console.error(..._a)
  }

  /**
   * Builds the console arguments array with headers and styling metadata.
   * @param level Log level the message is associated with.
   * @param args Original arguments supplied to the logger API.
   * @returns Array passed directly to the corresponding `console` method.
   */
  private format (level: LogLevel, args: unknown[]): unknown[] {
    const label = LogLevel[level]
    const emoji = Logger.emojiConfig
    const style = Logger.styleConfig
    const head = (this.project == null ? '' : `(${this.project}) `) + `${emoji.enabled ? `${emoji.dict[level]} ` : ''}%c[${label}]`
    const styleText = style.enabled ? style.dict[level] : ''
    return [head, styleText, ...args]
  }
}
