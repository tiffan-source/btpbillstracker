import { CoreError, CoreErrorMetadata } from '../../../../core/errors/core.error';

/**
 * Signale une erreur de résolution chantier au niveau du domaine billing.
 */
export class ChantierResolutionError extends CoreError {
  constructor(message?: string, metadata?: CoreErrorMetadata, cause?: unknown) {
    super('CHANTIER_RESOLUTION_ERROR', message ?? 'Impossible de résoudre le chantier.', metadata, cause);
  }
}
