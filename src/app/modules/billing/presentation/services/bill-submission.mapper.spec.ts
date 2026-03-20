import { describe, expect, it } from 'vitest';
import { mapInvoiceFormToCreateEnrichedBillInput } from './bill-submission.mapper';

describe('bill-submission.mapper', () => {
  it('maps existing client payload to enriched input', () => {
    const result = mapInvoiceFormToCreateEnrichedBillInput({
      clientId: 'client-123',
      amountTTC: 2200,
      dueDate: '2026-05-01',
      invoiceNumber: 'EXT-44',
      type: 'Situation',
      paymentMode: 'Virement',
      remindersAutoEnabled: true,
      reminderScenarioId: 'standard-reminder-scenario'
    });

    expect(result).toEqual({
      isNewClient: false,
      clientIdOrName: 'client-123',
      amountTTC: 2200,
      dueDate: '2026-05-01',
      externalInvoiceReference: 'EXT-44',
      type: 'Situation',
      paymentMode: 'Virement',
      chantier: '',
      remindersAutoEnabled: true,
      reminderScenarioId: 'standard-reminder-scenario'
    });
  });

  it('maps new client payload to enriched input', () => {
    const result = mapInvoiceFormToCreateEnrichedBillInput({
      newClientName: 'Alice',
      amountTTC: 1800,
      dueDate: '2026-05-10',
      invoiceNumber: 'EXT-99',
      type: 'Solde',
      paymentMode: 'Chèque',
      remindersAutoEnabled: true,
      reminderScenarioId: 'standard-reminder-scenario'
    });

    expect(result).toEqual({
      isNewClient: true,
      clientIdOrName: 'Alice',
      amountTTC: 1800,
      dueDate: '2026-05-10',
      externalInvoiceReference: 'EXT-99',
      type: 'Solde',
      paymentMode: 'Chèque',
      chantier: '',
      remindersAutoEnabled: true,
      reminderScenarioId: 'standard-reminder-scenario'
    });
  });

  it('trims new client name and falls back to defaults', () => {
    const result = mapInvoiceFormToCreateEnrichedBillInput({
      newClientName: '  Alice  ',
      amountTTC: null,
      dueDate: null,
      invoiceNumber: null,
      type: null,
      paymentMode: null,
      remindersAutoEnabled: null,
      reminderScenarioId: null
    });

    expect(result).toEqual({
      isNewClient: true,
      clientIdOrName: 'Alice',
      amountTTC: 0,
      dueDate: '',
      externalInvoiceReference: '',
      type: '',
      paymentMode: '',
      chantier: '',
      remindersAutoEnabled: false,
      reminderScenarioId: ''
    });
  });
});
