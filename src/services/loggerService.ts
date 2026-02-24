type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  userId?: string;
}

class LoggerService {
  private isDevelopment = import.meta.env.DEV;

  private log(level: LogLevel, message: string, data?: any) {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString()
    };

    // Console output in development
    if (this.isDevelopment) {
      const style = this.getConsoleStyle(level);
      console.log(`%c[${level.toUpperCase()}]`, style, message, data || '');
    }

    // Send to Sentry in production
    if (!this.isDevelopment && window.Sentry) {
      if (level === 'error') {
        window.Sentry.captureException(new Error(message), { extra: data });
      } else {
        window.Sentry.captureMessage(message, { level, extra: data });
      }
    }
  }

  private getConsoleStyle(level: LogLevel): string {
    const styles = {
      debug: 'color: #888',
      info: 'color: #0066cc',
      warn: 'color: #ff9900; font-weight: bold',
      error: 'color: #cc0000; font-weight: bold'
    };
    return styles[level];
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }
}

export const logger = new LoggerService();

// Extend Window interface for Sentry
declare global {
  interface Window {
    Sentry?: any;
  }
}
