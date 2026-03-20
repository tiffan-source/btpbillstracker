import { Chantier } from './chantier.entity';
import { InvalidChantierNameError } from '../errors/invalid-chantier-name.error';

describe('Chantier Entity', () => {
  it('creates chantier with id and name', () => {
    const chantier = new Chantier('ch-1', 'Villa A');

    expect(chantier.id).toBe('ch-1');
    expect(chantier.name).toBe('Villa A');
  });

  it('rejects empty chantier name', () => {
    expect(() => new Chantier('ch-2', '')).toThrow(InvalidChantierNameError);
    expect(() => new Chantier('ch-2', '   ')).toThrow(InvalidChantierNameError);
  });

  it('updates chantier name with fluent setter', () => {
    const chantier = new Chantier('ch-3', 'Ancien Nom').setName('Nouveau Nom');

    expect(chantier.name).toBe('Nouveau Nom');
  });
});
