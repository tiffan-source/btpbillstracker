import { CoreError, CoreErrorMetadata } from '../../../../core/errors/core.error';

export class ClientResolutionError extends CoreError {
  constructor(message = 'Impossible de résoudre le client.', metadata?: CoreErrorMetadata, cause?: unknown) {
    super('CLIENT_RESOLUTION_ERROR', message, metadata, cause);
  }
}

