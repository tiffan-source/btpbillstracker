import { CoreError, CoreErrorMetadata } from '../../../../core/errors/core.error';

export class ReminderPersistenceError extends CoreError {
  constructor(message = 'Impossible de persister les données de relance.', metadata?: CoreErrorMetadata, cause?: unknown) {
    super('REMINDER_PERSISTENCE_ERROR', message, metadata, cause);
  }
}
