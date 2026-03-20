import { CoreError, CoreErrorMetadata } from '../../../../core/errors/core.error';

export class ChantierPersistenceError extends CoreError {
  constructor(message = 'Impossible de sauvegarder le chantier.', metadata?: CoreErrorMetadata, cause?: unknown) {
    super('CHANTIER_PERSISTENCE_ERROR', message, metadata, cause);
  }
}

