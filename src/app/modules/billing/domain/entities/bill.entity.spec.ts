import { Bill } from './bill.entity';

describe('Bill Entity', () => {
  it('should create a valid Draft Bill automatically', () => {
    const bill = new Bill('bill-1', 'F-2026-0001', 'client-xyz');

    expect(bill.id).toBe('bill-1');
    expect(bill.reference).toBe('F-2026-0001');
    expect(bill.clientId).toBe('client-xyz');
    expect(bill.status).toBe('DRAFT');
  });

  it('should fail if reference is empty or missing', () => {
    expect(() => new Bill('bill-1', '', 'client-xyz')).toThrow('Une facture doit avoir une référence valide.');
    expect(() => new Bill('bill-1', '   ', 'client-xyz')).toThrow('Une facture doit avoir une référence valide.');
  });

  it('should fail if clientId is empty or missing', () => {
    expect(() => new Bill('bill-1', 'F-2026-0001', '')).toThrow('Une facture doit être associée à un client.');
    expect(() => new Bill('bill-1', 'F-2026-0001', '   ')).toThrow('Une facture doit être associée à un client.');
  });
});
