/**
 * Production-ready logging service
 * Replaces console.log statements with proper logging infrastructure
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, any>
  stack?: string
  userId?: string
  sessionId?: string
}

export interface LoggerConfig {
  level: LogLevel
  enableConsole: boolean
  enableStorage: boolean
  enableRemote: boolean
  remoteEndpoint?: string
  maxStorageEntries: number
}

class Logger {
  private config: LoggerConfig
  private sessionId: string
  private context: Record<string, any> = {}

  constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      level: process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG,
      enableConsole: process.env.NODE_ENV !== 'production',
      enableStorage: true,
      enableRemote: process.env.NODE_ENV === 'production',
      maxStorageEntries: 1000,
      ...config
    }
    
    this.sessionId = this.generateSessionId()
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  setContext(context: Record<string, any>): void {
    this.context = { ...this.context, ...context }
  }

  clearContext(): void {
    this.context = {}
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context)
  }

  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context)
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context)
  }

  error(message: string, error?: Error | unknown, context?: Record<string, any>): void {
    const errorContext = {
      ...context,
      ...(error instanceof Error && {
        errorName: error.name,
        errorMessage: error.message,
        stack: error.stack
      })
    }
    this.log(LogLevel.ERROR, message, errorContext, error instanceof Error ? error.stack : undefined)
  }

  critical(message: string, error?: Error | unknown, context?: Record<string, any>): void {
    const errorContext = {
      ...context,
      ...(error instanceof Error && {
        errorName: error.name,
        errorMessage: error.message,
        stack: error.stack
      })
    }
    this.log(LogLevel.CRITICAL, message, errorContext, error instanceof Error ? error.stack : undefined)
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, stack?: string): void {
    if (level < this.config.level) {
      return
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...this.context, ...context },
      stack,
      sessionId: this.sessionId
    }

    // Add user ID if available
    if (typeof window !== 'undefined') {
      try {
        const userData = localStorage.getItem('supabase.auth.token')
        if (userData) {
          const parsed = JSON.parse(userData)
          entry.userId = parsed?.user?.id
        }
      } catch {
        // Ignore parsing errors
      }
    }

    this.processLogEntry(entry)
  }

  private processLogEntry(entry: LogEntry): void {
    // Console output for development
    if (this.config.enableConsole) {
      this.outputToConsole(entry)
    }

    // Local storage for debugging
    if (this.config.enableStorage && typeof window !== 'undefined') {
      this.storeLocally(entry)
    }

    // Remote logging for production
    if (this.config.enableRemote && this.config.remoteEndpoint) {
      this.sendRemote(entry)
    }
  }

  private outputToConsole(entry: LogEntry): void {
    const levelColors = {
      [LogLevel.DEBUG]: 'color: #888',
      [LogLevel.INFO]: 'color: #0ea5e9',
      [LogLevel.WARN]: 'color: #f59e0b',
      [LogLevel.ERROR]: 'color: #ef4444',
      [LogLevel.CRITICAL]: 'color: #dc2626; font-weight: bold'
    }

    const levelNames = {
      [LogLevel.DEBUG]: 'DEBUG',
      [LogLevel.INFO]: 'INFO',
      [LogLevel.WARN]: 'WARN',
      [LogLevel.ERROR]: 'ERROR',
      [LogLevel.CRITICAL]: 'CRITICAL'
    }

    const prefix = `[${entry.timestamp}] [${levelNames[entry.level]}]`
    const style = levelColors[entry.level]

    if (entry.context && Object.keys(entry.context).length > 0) {
      console.groupCollapsed(`%c${prefix} ${entry.message}`, style)
      console.log('Context:', entry.context)
      if (entry.stack) {
        console.log('Stack:', entry.stack)
      }
      console.groupEnd()
    } else {
      console.log(`%c${prefix} ${entry.message}`, style)
      if (entry.stack) {
        console.log(entry.stack)
      }
    }
  }

  private storeLocally(entry: LogEntry): void {
    try {
      const stored = localStorage.getItem('cupnote_logs')
      const logs: LogEntry[] = stored ? JSON.parse(stored) : []
      
      logs.push(entry)
      
      // Trim to max entries
      if (logs.length > this.config.maxStorageEntries) {
        logs.splice(0, logs.length - this.config.maxStorageEntries)
      }
      
      localStorage.setItem('cupnote_logs', JSON.stringify(logs))
    } catch {
      // Ignore storage errors
    }
  }

  private async sendRemote(entry: LogEntry): Promise<void> {
    try {
      if (!this.config.remoteEndpoint) return

      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entry)
      })
    } catch {
      // Ignore remote logging errors to prevent infinite loops
    }
  }

  // Utility methods for debugging
  exportLogs(): LogEntry[] {
    try {
      const stored = localStorage.getItem('cupnote_logs')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  clearLogs(): void {
    try {
      localStorage.removeItem('cupnote_logs')
    } catch {
      // Ignore errors
    }
  }

  getStats(): { total: number; byLevel: Record<LogLevel, number> } {
    const logs = this.exportLogs()
    const stats = {
      total: logs.length,
      byLevel: {
        [LogLevel.DEBUG]: 0,
        [LogLevel.INFO]: 0,
        [LogLevel.WARN]: 0,
        [LogLevel.ERROR]: 0,
        [LogLevel.CRITICAL]: 0
      }
    }

    logs.forEach(log => {
      stats.byLevel[log.level]++
    })

    return stats
  }
}

// Create global logger instance
export const logger = new Logger()

// Convenience exports for easy migration from console.log
export const log = {
  debug: (message: string, context?: Record<string, any>) => logger.debug(message, context),
  info: (message: string, context?: Record<string, any>) => logger.info(message, context),
  warn: (message: string, context?: Record<string, any>) => logger.warn(message, context),
  error: (message: string, error?: Error | unknown, context?: Record<string, any>) => logger.error(message, error, context),
  critical: (message: string, error?: Error | unknown, context?: Record<string, any>) => logger.critical(message, error, context)
}

// Performance logging utilities
export const perf = {
  time: (label: string) => {
    const start = performance.now()
    return {
      end: (context?: Record<string, any>) => {
        const duration = performance.now() - start
        logger.debug(`Performance: ${label}`, { duration, ...context })
        return duration
      }
    }
  },
  
  measure: async <T>(label: string, fn: () => Promise<T> | T, context?: Record<string, any>): Promise<T> => {
    const timer = perf.time(label)
    try {
      const result = await fn()
      timer.end({ success: true, ...context })
      return result
    } catch (error) {
      timer.end({ success: false, error: error instanceof Error ? error.message : 'Unknown error', ...context })
      throw error
    }
  }
}

export default logger