import { failure, success } from '../../../../core/result/result';
import { Client } from '../../../clients/domain/entities/client.entity';
import { QuickClientCreatorPort } from '../../../clients';
import { ClientProviderPort } from '../../domain/ports/client-provider.port';
import { CrossModuleClientProviderAdapter } from './cross-module-client-provider.adapter';

class MockQuickClientCreatorPort extends QuickClientCreatorPort {
  execute = vitest.fn();
}

describe('CrossModuleClientProviderAdapter', () => {
  let creator: MockQuickClientCreatorPort;
  let adapter: ClientProviderPort;

  beforeEach(() => {
    creator = new MockQuickClientCreatorPort();
    adapter = new CrossModuleClientProviderAdapter(creator);
  });

  it('returns existing client id without calling quick client creator', async () => {
    const result = await adapter.resolveClient({
      isNewClient: false,
      clientIdOrName: 'client-123'
    });

    expect(result).toEqual(success('client-123'));
    expect(creator.execute).not.toHaveBeenCalled();
  });

  it('creates a new client through quick client creator port', async () => {
    creator.execute.mockResolvedValue(success(new Client('new-client-1', 'Alice')));

    const result = await adapter.resolveClient({
      isNewClient: true,
      clientIdOrName: 'Alice',
      clientEmail: 'alice@example.com'
    });

    expect(creator.execute).toHaveBeenCalledWith({
      name: 'Alice',
      email: 'alice@example.com'
    });
    expect(result).toEqual(success('new-client-1'));
  });

  it('propagates creation failure from quick client creator port', async () => {
    creator.execute.mockResolvedValue(failure('CLIENT_CREATION_ERROR', 'Creation failed'));

    const result = await adapter.resolveClient({
      isNewClient: true,
      clientIdOrName: 'Alice'
    });

    expect(result).toEqual(failure('CLIENT_CREATION_ERROR', 'Creation failed'));
  });

  it('maps unexpected technical failures to client resolution error', async () => {
    creator.execute.mockRejectedValue(new Error('network down'));

    const result = await adapter.resolveClient({
      isNewClient: true,
      clientIdOrName: 'Alice'
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('CLIENT_RESOLUTION_ERROR');
    }
  });
});
