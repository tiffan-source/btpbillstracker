import { CoreError, CoreErrorMetadata } from '../../../../core/errors/core.error';

export class BillPersistenceError extends CoreError {
  constructor(message = 'Impossible de sauvegarder la facture.', metadata?: CoreErrorMetadata, cause?: unknown) {
    super('BILL_PERSISTENCE_ERROR', message, metadata, cause);
  }
}

