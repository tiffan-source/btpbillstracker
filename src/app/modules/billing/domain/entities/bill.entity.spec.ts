import { Bill } from './bill.entity';
import { BillClientRequiredError } from '../errors/bill-client-required.error';
import { InvalidBillReferenceError } from '../errors/invalid-bill-reference.error';

describe('Bill Entity', () => {
  it('should create a valid Draft Bill automatically', () => {
    const bill = new Bill('bill-1', 'F-2026-0001', 'client-xyz');

    expect(bill.id).toBe('bill-1');
    expect(bill.reference).toBe('F-2026-0001');
    expect(bill.clientId).toBe('client-xyz');
    expect(bill.status).toBe('DRAFT');
  });

  it('stores chantier relation using chantierId', () => {
    const bill = new Bill('bill-1', 'F-2026-0001', 'client-xyz')
      .setChantierId('chantier-123');

    expect(bill.chantierId).toBe('chantier-123');
    expect(bill.chantier).toBe('chantier-123');
  });

  it('should fail if reference is empty or missing', () => {
    expect(() => new Bill('bill-1', '', 'client-xyz')).toThrow(InvalidBillReferenceError);
    expect(() => new Bill('bill-1', '   ', 'client-xyz')).toThrow(InvalidBillReferenceError);
  });

  it('should fail if clientId is empty or missing', () => {
    expect(() => new Bill('bill-1', 'F-2026-0001', '')).toThrow(BillClientRequiredError);
    expect(() => new Bill('bill-1', 'F-2026-0001', '   ')).toThrow(BillClientRequiredError);
  });
});
