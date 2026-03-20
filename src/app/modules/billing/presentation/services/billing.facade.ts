import { Injectable, signal, inject } from '@angular/core';
import { BillStore } from '../stores/bill.store';
import { BillPdfMemoryFile } from '../models/bill-pdf-memory-file.model';
import { CreateEnrichedBillInput, CreateEnrichedBillUseCase } from '../../domain/usecases/create-enriched-bill.usecase';
import { BillingInvoiceFormValue, mapInvoiceFormToCreateEnrichedBillInput } from './bill-submission.mapper';
import { ReminderAssociationRepository } from '../../../reminders/domain/ports/reminder-association.repository';
import { ReminderAssociation } from '../../../reminders/domain/entities/reminder-association.entity';

export type SubmitBillInput = BillingInvoiceFormValue & {
  pdfFile?: BillPdfMemoryFile | null;
};

@Injectable({ providedIn: 'root' })
export class BillingFacade {
  private readonly createEnrichedBillUseCase = inject(CreateEnrichedBillUseCase);
  private readonly store = inject(BillStore);
  private readonly reminderAssociationRepository = inject(ReminderAssociationRepository);

  readonly isSubmitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly isSuccess = signal(false);
  readonly draftBill = this.store.draftBill;

  // Mock data to satisfy UI blueprint
  readonly clients = signal<{id: string, name: string}[]>([
    { id: 'client-1', name: 'Client 1' },
    { id: 'client-2', name: 'Client 2' }
  ]);

  async createInvoice(formValue: SubmitBillInput): Promise<void> {
    this.isSuccess.set(false);
    this.isSubmitting.set(true);
    const input = mapInvoiceFormToCreateEnrichedBillInput(formValue);
    await this.submitNewBill(input, formValue.pdfFile ?? null);

    this.isSubmitting.set(false);
  }

  async submitNewBill(input: CreateEnrichedBillInput, pdfFile: BillPdfMemoryFile | null): Promise<void> {
    this.error.set(null);

    const result = await this.createEnrichedBillUseCase.execute(input);

    if (result.success) {
      if (result.data.remindersAutoEnabled && result.data.reminderScenarioId) {
        try {
          await this.reminderAssociationRepository.save(
            new ReminderAssociation(result.data.id, result.data.reminderScenarioId)
          );
        } catch {
          this.error.set("La facture a été créée mais l'association de relance a échoué.");
          this.isSuccess.set(false);
          return;
        }
      }

      this.store.setDraftBill(result.data, pdfFile);
      this.isSuccess.set(true);
    } else {
      this.error.set(result.error.message);
    }
  }

  dismissSuccess(): void {
    this.isSuccess.set(false);
  }
}
