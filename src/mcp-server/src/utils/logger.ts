/**
 * Simple logger for MCP Server
 */

export enum LogType {
  INFO = "info",
  ERROR = "error",
  DEBUG = "debug",
  WARN = "warn",
  SYSTEM = "system"
}

export const logger = {
  info: (message: string, data?: any) => {
    console.error(`[INFO] ${message}`, data ? JSON.stringify(data) : '');
  },
  error: (message: string, data?: any) => {
    console.error(`[ERROR] ${message}`, data ? JSON.stringify(data) : '');
  },
  debug: (message: string, data?: any) => {
    console.error(`[DEBUG] ${message}`, data ? JSON.stringify(data) : '');
  },
  warn: (message: string, data?: any) => {
    console.error(`[WARN] ${message}`, data ? JSON.stringify(data) : '');
  }
};
