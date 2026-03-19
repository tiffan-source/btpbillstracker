export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; metadata?: any } };

export function success<T>(data: T): Result<T> {
  return { success: true, data };
}

export function failure<T = any>(code: string, message: string, metadata?: any): Result<T> {
  return { success: false, error: { code, message, metadata } };
}
