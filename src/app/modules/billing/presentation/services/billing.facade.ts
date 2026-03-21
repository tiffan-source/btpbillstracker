import { Injectable, computed, signal, inject } from '@angular/core';
import { BillStore } from '../stores/bill.store';
import { BillPdfMemoryFile } from '../models/bill-pdf-memory-file.model';
import { CreateEnrichedBillInput, CreateEnrichedBillUseCase } from '../../domain/usecases/create-enriched-bill.usecase';
import { BillingInvoiceFormValue, mapInvoiceFormToCreateEnrichedBillInput } from './bill-submission.mapper';
import { ReminderAssociationRepository } from '../../../reminders/domain/ports/reminder-association.repository';
import { ReminderAssociation } from '../../../reminders/domain/entities/reminder-association.entity';
import { ListReminderScenariosUseCase } from '../../../reminders/domain/usecases/list-reminder-scenarios.usecase';
import { ListClientsUseCase } from '../../../clients';

export type SubmitBillInput = BillingInvoiceFormValue & {
  pdfFile?: BillPdfMemoryFile | null;
};

export type DuplicateClientPrompt = {
  existingClientId: string;
  existingClientName: string;
  pendingForm: SubmitBillInput;
};

export type ReminderScenarioOption = {
  id: string;
  name: string;
};

@Injectable({ providedIn: 'root' })
export class BillingFacade {
  private readonly createEnrichedBillUseCase = inject(CreateEnrichedBillUseCase);
  private readonly listClientsUseCase = inject(ListClientsUseCase);
  private readonly listReminderScenariosUseCase = inject(ListReminderScenariosUseCase);
  private readonly store = inject(BillStore);
  private readonly reminderAssociationRepository = inject(ReminderAssociationRepository);
  private readonly clientsState = signal<{ id: string; name: string }[]>([]);
  private readonly reminderScenariosState = signal<ReminderScenarioOption[]>([]);

  readonly isSubmitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly isSuccess = signal(false);
  readonly draftBill = this.store.draftBill;
  readonly clients = computed(() => this.clientsState());
  readonly isClientsLoading = signal(false);
  readonly clientsLoadError = signal<string | null>(null);
  readonly reminderScenarios = computed(() => this.reminderScenariosState());
  readonly isReminderScenariosLoading = signal(false);
  readonly reminderScenariosLoadError = signal<string | null>(null);
  readonly duplicateClientPrompt = signal<DuplicateClientPrompt | null>(null);

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

  async loadReminderScenarios(): Promise<void> {
    this.reminderScenariosLoadError.set(null);
    this.isReminderScenariosLoading.set(true);

    const result = await this.listReminderScenariosUseCase.execute();
    if (result.success) {
      const sortedScenarios = result.data
        .map((scenario) => ({ id: scenario.id, name: scenario.name }))
        .sort((first, second) => first.name.localeCompare(second.name, 'fr', { sensitivity: 'base' }));
      this.reminderScenariosState.set(sortedScenarios);
    } else {
      this.reminderScenariosLoadError.set(result.error.message);
      this.reminderScenariosState.set([]);
    }

    this.isReminderScenariosLoading.set(false);
  }

  async createInvoice(formValue: SubmitBillInput): Promise<void> {
    this.isSuccess.set(false);
    this.isSubmitting.set(true);
    const input = mapInvoiceFormToCreateEnrichedBillInput(formValue);
    await this.submitNewBill(input, formValue.pdfFile ?? null);

    this.isSubmitting.set(false);
  }

  async requestInvoiceCreation(formValue: SubmitBillInput): Promise<void> {
    const normalizedNewClientName = this.normalizeClientName(formValue.newClientName);
    if (!normalizedNewClientName) {
      await this.createInvoice(formValue);
      return;
    }

    const matchingClient = this.clients().find(
      (client) => this.normalizeClientName(client.name) === normalizedNewClientName
    );

    if (!matchingClient) {
      await this.createInvoice(formValue);
      return;
    }

    this.duplicateClientPrompt.set({
      existingClientId: matchingClient.id,
      existingClientName: matchingClient.name,
      pendingForm: formValue
    });
  }

  async confirmUseExistingClient(): Promise<void> {
    const prompt = this.duplicateClientPrompt();
    if (!prompt) {
      return;
    }

    this.duplicateClientPrompt.set(null);
    await this.createInvoice({
      ...prompt.pendingForm,
      clientId: prompt.existingClientId,
      newClientName: ''
    });
  }

  async confirmCreateNewClient(): Promise<void> {
    const prompt = this.duplicateClientPrompt();
    if (!prompt) {
      return;
    }

    this.duplicateClientPrompt.set(null);
    await this.createInvoice(prompt.pendingForm);
  }

  dismissDuplicateClientPrompt(): void {
    this.duplicateClientPrompt.set(null);
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

  private normalizeClientName(name: string | null | undefined): string {
    return (name ?? '')
      .trim()
      .normalize('NFKD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/\s+/g, ' ')
      .toLowerCase();
  }
}
