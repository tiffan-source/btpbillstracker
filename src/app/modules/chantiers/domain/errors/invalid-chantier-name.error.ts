import { CoreError } from '../../../../core/errors/core.error';

export class InvalidChantierNameError extends CoreError {
  constructor() {
    super('INVALID_CHANTIER_NAME', 'Un chantier doit avoir un nom valide.');
  }
}

