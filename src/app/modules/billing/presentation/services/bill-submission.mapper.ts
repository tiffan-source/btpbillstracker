import { CreateEnrichedBillInput } from '../../domain/usecases/create-enriched-bill.usecase';

export type BillingInvoiceFormValue = {
  clientId?: string | null;
  newClientName?: string | null;
  chantier?: string | null;
  amountTTC?: number | null;
  dueDate?: string | null;
  invoiceNumber?: string | null;
  type?: string | null;
  paymentMode?: string | null;
  remindersAutoEnabled?: boolean | null;
  reminderScenarioId?: string | null;
};

/**
 * Convertit la saisie UI en payload métier enrichi.
 */
export function mapInvoiceFormToCreateEnrichedBillInput(
  formValue: BillingInvoiceFormValue
): CreateEnrichedBillInput {
  const normalizedNewClientName = formValue.newClientName?.trim();

  if (normalizedNewClientName) {
    return {
      isNewClient: true,
      clientIdOrName: normalizedNewClientName,
      amountTTC: formValue.amountTTC ?? 0,
      dueDate: formValue.dueDate ?? '',
      externalInvoiceReference: formValue.invoiceNumber ?? '',
      type: formValue.type ?? '',
      paymentMode: formValue.paymentMode ?? '',
      chantierId: formValue.chantier ?? '',
      remindersAutoEnabled: formValue.remindersAutoEnabled ?? false,
      reminderScenarioId: formValue.reminderScenarioId ?? ''
    };
  }

  return {
    isNewClient: false,
    clientIdOrName: formValue.clientId ?? 'unknown',
    amountTTC: formValue.amountTTC ?? 0,
    dueDate: formValue.dueDate ?? '',
    externalInvoiceReference: formValue.invoiceNumber ?? '',
    type: formValue.type ?? '',
    paymentMode: formValue.paymentMode ?? '',
    chantierId: formValue.chantier ?? '',
    remindersAutoEnabled: formValue.remindersAutoEnabled ?? false,
    reminderScenarioId: formValue.reminderScenarioId ?? ''
  };
}
