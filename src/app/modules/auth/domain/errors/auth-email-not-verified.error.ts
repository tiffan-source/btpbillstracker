import { CoreError } from '../../../../core/errors/core.error';

export class AuthEmailNotVerifiedError extends CoreError {
  constructor(email: string) {
    super(
      'AUTH_EMAIL_NOT_VERIFIED',
      "L'adresse email n'est pas encore vérifiée.",
      { email }
    );
  }
}
