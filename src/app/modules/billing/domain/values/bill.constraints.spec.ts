import { describe, expect, it } from 'vitest';
import {
  BILL_MIN_AMOUNT_TTC,
  BILL_TYPES,
  PAYMENT_MODES,
  isBillType,
  isPaymentMode
} from './bill.constraints';

describe('bill.constraints', () => {
  it('defines stable billing type options', () => {
    expect(BILL_TYPES).toEqual(['Situation', 'Solde', 'Acompte']);
    expect(isBillType('Situation')).toBe(true);
    expect(isBillType('InvalidType')).toBe(false);
  });

  it('defines stable payment mode options', () => {
    expect(PAYMENT_MODES).toEqual(['Virement', 'Chèque', 'Espèces']);
    expect(isPaymentMode('Virement')).toBe(true);
    expect(isPaymentMode('Carte')).toBe(false);
  });

  it('defines minimum amount TTC constraint', () => {
    expect(BILL_MIN_AMOUNT_TTC).toBe(0);
  });
});
