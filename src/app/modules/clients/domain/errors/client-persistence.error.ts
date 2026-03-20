import { CoreError, CoreErrorMetadata } from '../../../../core/errors/core.error';

export class ClientPersistenceError extends CoreError {
  constructor(message = 'Impossible de sauvegarder le client.', metadata?: CoreErrorMetadata, cause?: unknown) {
    super('CLIENT_PERSISTENCE_ERROR', message, metadata, cause);
  }
}

