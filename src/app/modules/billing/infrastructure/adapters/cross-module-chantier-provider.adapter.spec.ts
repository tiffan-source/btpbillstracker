import { failure, success } from '../../../../core/result/result';
import { QuickChantierCreatorPort, Chantier } from '../../../chantiers';
import { ResolveChantierIdPort } from '../../domain/ports/resolve-chantier-id.port';
import { CrossModuleChantierProviderAdapter } from './cross-module-chantier-provider.adapter';

class MockQuickChantierCreatorPort extends QuickChantierCreatorPort {
  execute = vitest.fn();
}

describe('CrossModuleChantierProviderAdapter', () => {
  let creator: MockQuickChantierCreatorPort;
  let adapter: ResolveChantierIdPort;

  beforeEach(() => {
    creator = new MockQuickChantierCreatorPort();
    adapter = new CrossModuleChantierProviderAdapter(creator);
  });

  it('creates a chantier through quick chantier creator port', async () => {
    creator.execute.mockResolvedValue(success(new Chantier('chantier-1', 'Lot A')));

    const result = await adapter.execute({ chantierName: 'Lot A' });

    expect(creator.execute).toHaveBeenCalledWith({ name: 'Lot A' });
    expect(result).toEqual(success('chantier-1'));
  });

  it('propagates creation failure from quick chantier creator port', async () => {
    creator.execute.mockResolvedValue(failure('CHANTIER_NAME_ALREADY_EXISTS', 'Un chantier porte déjà ce nom.'));

    const result = await adapter.execute({ chantierName: 'Lot A' });

    expect(result).toEqual(failure('CHANTIER_NAME_ALREADY_EXISTS', 'Un chantier porte déjà ce nom.', undefined));
  });

  it('maps unexpected technical failures to chantier resolution error', async () => {
    creator.execute.mockRejectedValue(new Error('network down'));

    const result = await adapter.execute({ chantierName: 'Lot A' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('CHANTIER_RESOLUTION_ERROR');
    }
  });
});
