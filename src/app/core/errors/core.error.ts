export type CoreErrorMetadata = Record<string, unknown>;

/**
 * Erreur racine de l'application avec code stable et contexte optionnel.
 */
export class CoreError extends Error {
  readonly code: string;
  readonly metadata?: CoreErrorMetadata;
  override readonly cause?: unknown;

  constructor(code: string, message: string, metadata?: CoreErrorMetadata, cause?: unknown) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.metadata = metadata;
    this.cause = cause;
  }
}
