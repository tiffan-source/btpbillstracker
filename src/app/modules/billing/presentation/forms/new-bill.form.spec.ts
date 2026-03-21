import { NewBillForm } from './new-bill.form';

describe('NewBillForm', () => {
  it('defaults to reminders auto enabled with empty scenario', () => {
    const form = new NewBillForm();

    expect(form.controls['remindersAutoEnabled'].value).toBe(true);
    expect(form.controls['reminderScenarioId'].value).toBe('');
  });

  it('requires scenario id when reminders are enabled', () => {
    const form = new NewBillForm();

    form.controls['remindersAutoEnabled'].setValue(true);
    form.controls['reminderScenarioId'].setValue('');
    form.controls['reminderScenarioId'].markAsTouched();
    form.updateValueAndValidity();

    expect(form.controls['reminderScenarioId'].invalid).toBe(true);
    expect(form.getErrorMessage('reminderScenarioId')).toBe('Le scénario de relance est obligatoire lorsque les relances automatiques sont activées.');
  });

  it('clears scenario id requirement when reminders are disabled', () => {
    const form = new NewBillForm();

    form.setRemindersAutoEnabled(false);
    form.controls['reminderScenarioId'].setValue('');
    form.updateValueAndValidity();

    expect(form.controls['reminderScenarioId'].valid).toBe(true);
  });

  it('exposes reminder fields in typed payload', () => {
    const form = new NewBillForm();

    const payload = form.getPayload();

    expect(payload).toHaveProperty('remindersAutoEnabled', true);
    expect(payload).toHaveProperty('reminderScenarioId', '');
  });
});
