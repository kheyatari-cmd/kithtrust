type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

/** 
 * Logging abstraction for observability.
 * In production, replace console calls with a service like Sentry, Datadog, etc.
 */
class Logger {
  private isDev = process.env.NODE_ENV === "development";

  private formatEntry(level: LogLevel, message: string, context?: Record<string, unknown>): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };
  }

  debug(message: string, context?: Record<string, unknown>) {
    if (this.isDev) {
      const entry = this.formatEntry("debug", message, context);
      console.debug(`[KithTrust] ${entry.timestamp} DEBUG:`, message, context || "");
    }
  }

  info(message: string, context?: Record<string, unknown>) {
    const entry = this.formatEntry("info", message, context);
    console.info(`[KithTrust] ${entry.timestamp} INFO:`, message, context || "");
  }

  warn(message: string, context?: Record<string, unknown>) {
    const entry = this.formatEntry("warn", message, context);
    console.warn(`[KithTrust] ${entry.timestamp} WARN:`, message, context || "");
  }

  error(message: string, context?: Record<string, unknown>) {
    const entry = this.formatEntry("error", message, context);
    console.error(`[KithTrust] ${entry.timestamp} ERROR:`, message, context || "");
    // In production: send to error tracking service
    // e.g., Sentry.captureException(new Error(message), { extra: context });
  }

  /** Log a transaction event */
  tx(txHash: string, status: string, context?: Record<string, unknown>) {
    this.info(`Transaction ${status}`, { txHash, ...context });
  }

  /** Log a contract event */
  event(eventType: string, data: Record<string, unknown>) {
    this.info(`Contract event: ${eventType}`, data);
  }
}

export const logger = new Logger();
