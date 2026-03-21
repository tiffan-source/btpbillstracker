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
      chantierId: '',
      chantierName: '',
      shouldCreateChantier: false,
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
      chantierId: '',
      chantierName: '',
      shouldCreateChantier: false,
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
      chantierId: '',
      chantierName: '',
      shouldCreateChantier: false,
      remindersAutoEnabled: false,
      reminderScenarioId: ''
    });
  });

  it('maps new chantier payload to enriched input', () => {
    const result = mapInvoiceFormToCreateEnrichedBillInput({
      clientId: 'client-1',
      chantierId: '',
      chantierName: '  Lot A  ',
      shouldCreateChantier: true,
      amountTTC: 1200,
      dueDate: '2026-06-01',
      invoiceNumber: 'FAC-22',
      type: 'Situation',
      paymentMode: 'Virement',
      remindersAutoEnabled: false,
      reminderScenarioId: ''
    });

    expect(result).toEqual({
      isNewClient: false,
      clientIdOrName: 'client-1',
      chantierId: '',
      chantierName: 'Lot A',
      shouldCreateChantier: true,
      amountTTC: 1200,
      dueDate: '2026-06-01',
      externalInvoiceReference: 'FAC-22',
      type: 'Situation',
      paymentMode: 'Virement',
      remindersAutoEnabled: false,
      reminderScenarioId: ''
    });
  });
});
