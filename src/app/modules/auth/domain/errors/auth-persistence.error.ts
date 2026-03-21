import { CoreError } from '../../../../core/errors/core.error';

export class AuthPersistenceError extends CoreError {
  constructor(message: string, cause?: unknown) {
    super('AUTH_PERSISTENCE_ERROR', message, undefined, cause);
  }
}
