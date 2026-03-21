import { ClientDisplayResolver } from './client-display.resolver';

describe('ClientDisplayResolver', () => {
  it('returns firstName + lastName when both are available', () => {
    const resolver = new ClientDisplayResolver();

    const result = resolver.resolve({
      id: 'c-1',
      firstName: '  Alice ',
      lastName: ' Martin  ',
      name: 'ALIAS'
    });

    expect(result.label).toBe('Alice Martin');
    expect(result.showsIncompleteIndicator).toBe(false);
  });

  it('falls back to canonical name when first/last are incomplete', () => {
    const resolver = new ClientDisplayResolver();

    const result = resolver.resolve({
      id: 'c-2',
      firstName: 'Alice',
      lastName: '',
      name: 'Alice M.'
    });

    expect(result.label).toBe('Alice M.');
    expect(result.showsIncompleteIndicator).toBe(true);
  });

  it('normalizes extra spaces in canonical fallback name', () => {
    const resolver = new ClientDisplayResolver();

    const result = resolver.resolve({
      id: 'c-2',
      firstName: '',
      lastName: '',
      name: '  Alice   Martin  '
    });

    expect(result.label).toBe('Alice Martin');
    expect(result.showsIncompleteIndicator).toBe(true);
  });

  it('returns "Client inconnu" when no usable data exists', () => {
    const resolver = new ClientDisplayResolver();

    const result = resolver.resolve({
      id: 'c-3',
      firstName: '   ',
      lastName: '',
      name: ''
    });

    expect(result.label).toBe('Client inconnu');
    expect(result.showsIncompleteIndicator).toBe(true);
  });

  it('returns "Client inconnu" for null profile', () => {
    const resolver = new ClientDisplayResolver();

    const result = resolver.resolve(null);

    expect(result.label).toBe('Client inconnu');
    expect(result.showsIncompleteIndicator).toBe(true);
  });
});
