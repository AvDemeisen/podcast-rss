export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, unknown>;
  error?: Error;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 100; // Keep last 100 logs in memory

  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      error,
    };

    this.logs.push(entry);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console logging
    const logMethod = console[level] || console.log;
    if (error) {
      logMethod(`[${level.toUpperCase()}] ${message}`, context, error);
    } else if (context) {
      logMethod(`[${level.toUpperCase()}] ${message}`, context);
    } else {
      logMethod(`[${level.toUpperCase()}] ${message}`);
    }

    // In production, you might want to send to an external service
    if (process.env.NODE_ENV === 'production' && level === LogLevel.ERROR) {
      this.sendToErrorService(entry);
    }
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, unknown>, error?: Error) {
    this.log(LogLevel.WARN, message, context, error);
  }

  error(message: string, context?: Record<string, unknown>, error?: Error) {
    this.log(LogLevel.ERROR, message, context, error);
  }

  private sendToErrorService(entry: LogEntry) {
    // TODO: Implement error reporting service (e.g., Sentry, LogRocket, etc.)
    console.error('Production error that should be reported:', entry);
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }
}

export const logger = new Logger(); 