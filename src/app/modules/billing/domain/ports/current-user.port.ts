import { Result } from '../../../../core/result/result';

export type BillingCurrentUser = {
  uid: string;
};

/**
 * Port d'accès à l'utilisateur courant pour les use cases billing.
 */
export abstract class CurrentUserPort {
  abstract getCurrentUser(): Promise<Result<BillingCurrentUser | null>>;
}
