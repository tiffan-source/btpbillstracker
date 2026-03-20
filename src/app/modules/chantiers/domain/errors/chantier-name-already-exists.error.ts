import { CoreError } from '../../../../core/errors/core.error';

export class ChantierNameAlreadyExistsError extends CoreError {
  constructor() {
    super('CHANTIER_NAME_ALREADY_EXISTS', 'Un chantier avec ce nom existe deja.');
  }
}

