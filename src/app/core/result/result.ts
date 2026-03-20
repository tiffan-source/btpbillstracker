import { CoreErrorMetadata } from '../errors/core.error';

export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; metadata?: CoreErrorMetadata } };

/**
 * Construire un résultat de succès typé.
 */
export function success<T>(data: T): Result<T> {
  return { success: true, data };
}

/**
 * Construire un résultat d'échec normalisé.
 */
export function failure<T = unknown>(code: string, message: string, metadata?: CoreErrorMetadata): Result<T> {
  return { success: false, error: { code, message, metadata } };
}

