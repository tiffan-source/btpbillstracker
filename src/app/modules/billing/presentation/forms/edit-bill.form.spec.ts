import { EditBillForm } from './edit-bill.form';

describe('EditBillForm', () => {
  it('defaults to required typed controls including status and reminder settings', () => {
    const form = new EditBillForm();

    expect(form.controls.clientId.value).toBe('');
    expect(form.controls.newClientName.value).toBe('');
    expect(form.controls.status.value).toBe('VALIDATED');
    expect(form.controls.remindersAutoEnabled.value).toBe(true);
    expect(form.controls.reminderScenarioId.value).toBe('standard-reminder-scenario');
  });

  it('requires reminder scenario when reminders are enabled', () => {
    const form = new EditBillForm();

    form.controls.remindersAutoEnabled.setValue(true);
    form.controls.reminderScenarioId.setValue('');
    form.controls.reminderScenarioId.updateValueAndValidity();

    expect(form.controls.reminderScenarioId.invalid).toBe(true);
    expect(form.getErrorMessage('reminderScenarioId')).toBe(
      'Le scénario de relance est obligatoire lorsque les relances automatiques sont activées.'
    );
  });

  it('clears reminder scenario and validators when reminders are disabled', () => {
    const form = new EditBillForm();
    form.controls.reminderScenarioId.setValue('custom-scenario');

    form.setRemindersAutoEnabled(false);

    expect(form.controls.reminderScenarioId.value).toBe('');
    expect(form.controls.reminderScenarioId.valid).toBe(true);
  });

  it('switches client mode validators without coupling to creation form', () => {
    const form = new EditBillForm();

    form.setClientMode(true);
    form.controls.newClientName.setValue('');
    form.controls.newClientName.updateValueAndValidity();
    expect(form.controls.newClientName.invalid).toBe(true);
    expect(form.controls.clientId.errors).toBeNull();

    form.setClientMode(false);
    form.controls.clientId.setValue('');
    form.controls.clientId.updateValueAndValidity();
    expect(form.controls.clientId.invalid).toBe(true);
  });

  it('clears opposite client field when toggling client mode', () => {
    const form = new EditBillForm();
    form.controls.clientId.setValue('client-1');
    form.controls.newClientName.setValue('Nouveau Client');

    form.setClientMode(true);
    expect(form.controls.clientId.value).toBe('');
    expect(form.controls.newClientName.value).toBe('Nouveau Client');

    form.setClientMode(false);
    expect(form.controls.newClientName.value).toBe('');
  });

  it('returns typed payload including status and reminder fields', () => {
    const form = new EditBillForm();
    form.patchValue({
      id: 'b-1',
      reference: 'F-2026-0008',
      clientId: 'client-1',
      chantierId: 'ch-1',
      chantierName: '',
      shouldCreateChantier: false,
      amountTTC: 380,
      dueDate: '2026-05-20',
      invoiceNumber: 'EXT-88',
      type: 'Situation',
      paymentMode: 'Virement',
      status: 'PAID',
      remindersAutoEnabled: false,
      reminderScenarioId: ''
    });

    const payload = form.getPayload();

    expect(payload.status).toBe('PAID');
    expect(payload.id).toBe('b-1');
    expect(payload.remindersAutoEnabled).toBe(false);
  });

  it('switches chantier mode validators for creation flow', () => {
    const form = new EditBillForm();

    form.setChantierMode(true);
    form.controls.chantierName.setValue('');
    form.controls.chantierName.updateValueAndValidity();
    expect(form.controls.chantierName.invalid).toBe(true);

    form.setChantierMode(false);
    form.controls.chantierName.updateValueAndValidity();
    expect(form.controls.chantierName.valid).toBe(true);
  });
});
