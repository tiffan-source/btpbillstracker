import { Injectable, computed, signal, inject } from '@angular/core';
import { BillStore } from '../stores/bill.store';
import { BillPdfMemoryFile } from '../models/bill-pdf-memory-file.model';
import { CreateEnrichedBillInput, CreateEnrichedBillUseCase } from '../../domain/usecases/create-enriched-bill.usecase';
import { BillingInvoiceFormValue, mapInvoiceFormToCreateEnrichedBillInput } from './bill-submission.mapper';
import { ReminderAssociationRepository } from '../../../reminders/domain/ports/reminder-association.repository';
import { ReminderAssociation } from '../../../reminders/domain/entities/reminder-association.entity';
import { ListClientsUseCase } from '../../../clients';

export type SubmitBillInput = BillingInvoiceFormValue & {
  pdfFile?: BillPdfMemoryFile | null;
};

@Injectable({ providedIn: 'root' })
export class BillingFacade {
  private readonly createEnrichedBillUseCase = inject(CreateEnrichedBillUseCase);
  private readonly listClientsUseCase = inject(ListClientsUseCase);
  private readonly store = inject(BillStore);
  private readonly reminderAssociationRepository = inject(ReminderAssociationRepository);
  private readonly clientsState = signal<{ id: string; name: string }[]>([]);

  readonly isSubmitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly isSuccess = signal(false);
  readonly draftBill = this.store.draftBill;
  readonly clients = computed(() => this.clientsState());
  readonly isClientsLoading = signal(false);
  readonly clientsLoadError = signal<string | null>(null);

  async loadClients(): Promise<void> {
    this.clientsLoadError.set(null);
    this.isClientsLoading.set(true);

    const result = await this.listClientsUseCase.execute();
    if (result.success) {
      const sortedClients = result.data
        .map((client) => ({ id: client.id, name: client.name }))
        .sort((first, second) => first.name.localeCompare(second.name, 'fr', { sensitivity: 'base' }));
      this.clientsState.set(sortedClients);
    } else {
      this.clientsLoadError.set(result.error.message);
      this.clientsState.set([]);
    }

    this.isClientsLoading.set(false);
  }

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
      await this.loadClients();
      this.isSuccess.set(true);
    } else {
      this.error.set(result.error.message);
    }
  }

  dismissSuccess(): void {
    this.isSuccess.set(false);
  }
}
