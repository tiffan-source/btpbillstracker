import { Result } from '../../../../core/result/result';

export type ResolveClientInput = {
  isNewClient: boolean;
  clientIdOrName: string;
  clientEmail?: string;
};

export abstract class ClientProviderPort {
  abstract resolveClient(input: ResolveClientInput): Promise<Result<string>>;
}
