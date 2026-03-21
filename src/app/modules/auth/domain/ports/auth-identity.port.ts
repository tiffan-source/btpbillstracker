import { AuthUser } from '../models/auth-user.model';

export abstract class AuthIdentityPort {
  abstract getCurrentUser(): Promise<AuthUser | null>;
}
