// Browser-compatible logger for client-side logging
type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
}

class BrowserLogger {
  private isDevelopment = import.meta.env.MODE === 'development';
  private logLevel: LogLevel = (import.meta.env.VITE_LOG_LEVEL as LogLevel) || 'info';

  private levelPriority: Record<LogLevel, number> = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
  };

  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] <= this.levelPriority[this.logLevel];
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] ${level.toUpperCase()}:`;
    return data ? `${prefix} ${message}` : `${prefix} ${message}`;
  }

  private log(level: LogLevel, message: string, data?: any) {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, data);

    // Always log to console
    switch (level) {
      case 'error':
        console.error(formattedMessage, data);
        break;
      case 'warn':
        console.warn(formattedMessage, data);
        break;
      case 'info':
        console.info(formattedMessage, data);
        break;
      case 'debug':
        console.debug(formattedMessage, data);
        break;
    }

    // In development, also store logs for debugging
    if (this.isDevelopment) {
      const logEntry: LogEntry = {
        level,
        message,
        timestamp: new Date().toISOString(),
        data,
      };

      // Store in sessionStorage for debugging (limited to last 100 entries)
      try {
        const existingLogs = JSON.parse(sessionStorage.getItem('app_logs') || '[]');
        existingLogs.push(logEntry);
        if (existingLogs.length > 100) {
          existingLogs.shift(); // Remove oldest
        }
        sessionStorage.setItem('app_logs', JSON.stringify(existingLogs));
      } catch (error) {
        // Ignore storage errors
      }
    }
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }

  // Utility method to get recent logs (for debugging)
  getRecentLogs(): LogEntry[] {
    try {
      return JSON.parse(sessionStorage.getItem('app_logs') || '[]');
    } catch {
      return [];
    }
  }

  // Clear stored logs
  clearLogs() {
    try {
      sessionStorage.removeItem('app_logs');
    } catch {
      // Ignore
    }
  }
}

// Create singleton instance
const logger = new BrowserLogger();

export default logger;
