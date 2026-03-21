import { Injectable, computed, signal, inject } from '@angular/core';
import { BillStore } from '../stores/bill.store';
import { BillPdfMemoryFile } from '../models/bill-pdf-memory-file.model';
import { CreateEnrichedBillInput, CreateEnrichedBillUseCase } from '../../domain/usecases/create-enriched-bill.usecase';
import { BillingInvoiceFormValue, mapInvoiceFormToCreateEnrichedBillInput } from './bill-submission.mapper';
import { ReminderAssociationRepository } from '../../../reminders/domain/ports/reminder-association.repository';
import { ReminderAssociation } from '../../../reminders/domain/entities/reminder-association.entity';
import { ListReminderScenariosUseCase } from '../../../reminders/domain/usecases/list-reminder-scenarios.usecase';
import { ListClientsUseCase } from '../../../clients';
import { ListUserBillsUseCase } from '../../domain/usecases/list-user-bills.usecase';
import { ListChantiersUseCase } from '../../../chantiers';

export type SubmitBillInput = BillingInvoiceFormValue & {
  pdfFile?: BillPdfMemoryFile | null;
};

export type DuplicateClientPrompt = {
  existingClientId: string;
  existingClientName: string;
  pendingForm: SubmitBillInput;
};

export type DuplicateChantierPrompt = {
  existingChantierId: string;
  existingChantierName: string;
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
  private readonly listChantiersUseCase = inject(ListChantiersUseCase);
  private readonly listUserBillsUseCase = inject(ListUserBillsUseCase);
  private readonly listReminderScenariosUseCase = inject(ListReminderScenariosUseCase);
  private readonly store = inject(BillStore);
  private readonly reminderAssociationRepository = inject(ReminderAssociationRepository);
  private readonly clientsState = signal<{ id: string; name: string }[]>([]);
  private readonly chantiersState = signal<{ id: string; name: string }[]>([]);
  private readonly reminderScenariosState = signal<ReminderScenarioOption[]>([]);

  readonly isSubmitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly isSuccess = signal(false);
  readonly draftBill = this.store.draftBill;
  readonly clients = computed(() => this.clientsState());
  readonly chantiers = computed(() => this.chantiersState());
  readonly isClientsLoading = signal(false);
  readonly clientsLoadError = signal<string | null>(null);
  readonly isChantiersLoading = signal(false);
  readonly chantiersLoadError = signal<string | null>(null);
  readonly reminderScenarios = computed(() => this.reminderScenariosState());
  readonly isReminderScenariosLoading = signal(false);
  readonly reminderScenariosLoadError = signal<string | null>(null);
  readonly duplicateClientPrompt = signal<DuplicateClientPrompt | null>(null);
  readonly duplicateChantierPrompt = signal<DuplicateChantierPrompt | null>(null);

  async loadClients(): Promise<void> {
    this.clientsLoadError.set(null);
    this.isClientsLoading.set(true);

    const [clientsResult, userBillsResult] = await Promise.all([
      this.listClientsUseCase.execute(),
      this.listUserBillsUseCase.execute()
    ]);

    if (clientsResult.success && userBillsResult.success) {
      const eligibleClientIds = new Set(
        userBillsResult.data
          .map((bill) => bill.clientId.trim())
          .filter((clientId) => clientId.length > 0)
      );

      const sortedClients = clientsResult.data
        .filter((client) => eligibleClientIds.has(client.id))
        .map((client) => ({ id: client.id, name: client.name }))
        .sort((first, second) => first.name.localeCompare(second.name, 'fr', { sensitivity: 'base' }));
      this.clientsState.set(sortedClients);
    } else {
      if (!clientsResult.success) {
        this.clientsLoadError.set(clientsResult.error.message);
      } else {
        this.clientsLoadError.set('Impossible de charger les factures utilisateur.');
      }
      this.clientsState.set([]);
    }

    this.isClientsLoading.set(false);
  }

  async loadChantiers(): Promise<void> {
    this.chantiersLoadError.set(null);
    this.isChantiersLoading.set(true);

    const [chantiersResult, userBillsResult] = await Promise.all([
      this.listChantiersUseCase.execute(),
      this.listUserBillsUseCase.execute()
    ]);

    if (chantiersResult.success && userBillsResult.success) {
      const eligibleChantierIds = new Set(
        userBillsResult.data
          .map((bill) => bill.chantierId?.trim() ?? '')
          .filter((chantierId) => chantierId.length > 0)
      );

      const sortedChantiers = chantiersResult.data
        .filter((chantier) => eligibleChantierIds.has(chantier.id))
        .map((chantier) => ({ id: chantier.id, name: chantier.name }))
        .sort((first, second) => first.name.localeCompare(second.name, 'fr', { sensitivity: 'base' }));
      this.chantiersState.set(sortedChantiers);
    } else {
      if (!chantiersResult.success) {
        this.chantiersLoadError.set(chantiersResult.error.message);
      } else {
        this.chantiersLoadError.set('Impossible de charger les factures utilisateur.');
      }
      this.chantiersState.set([]);
    }

    this.isChantiersLoading.set(false);
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
    this.error.set(null);
    if (!this.ensureExistingClientIsAuthorized(formValue)) {
      return;
    }
    if (!this.ensureExistingChantierIsAuthorized(formValue)) {
      return;
    }

    const normalizedNewClientName = this.normalizeClientName(formValue.newClientName);
    if (!normalizedNewClientName) {
      await this.requestCreationWithChantierValidation(formValue);
      return;
    }

    const matchingClient = this.clients().find(
      (client) => this.normalizeClientName(client.name) === normalizedNewClientName
    );

    if (!matchingClient) {
      await this.requestCreationWithChantierValidation(formValue);
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
    await this.requestCreationWithChantierValidation({
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

  async confirmUseExistingChantier(): Promise<void> {
    const prompt = this.duplicateChantierPrompt();
    if (!prompt) {
      return;
    }

    this.duplicateChantierPrompt.set(null);
    await this.createInvoice({
      ...prompt.pendingForm,
      chantierId: prompt.existingChantierId,
      chantierName: '',
      shouldCreateChantier: false
    });
  }

  async confirmCreateNewChantier(): Promise<void> {
    const prompt = this.duplicateChantierPrompt();
    if (!prompt) {
      return;
    }

    this.duplicateChantierPrompt.set(null);
    await this.createInvoice(prompt.pendingForm);
  }

  dismissDuplicateChantierPrompt(): void {
    this.duplicateChantierPrompt.set(null);
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
      await this.loadChantiers();
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

  private normalizeChantierName(name: string | null | undefined): string {
    return (name ?? '')
      .trim()
      .normalize('NFKD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/\s+/g, ' ')
      .toLowerCase();
  }

  private ensureExistingClientIsAuthorized(formValue: SubmitBillInput): boolean {
    const hasNewClientName = !!formValue.newClientName?.trim();
    const selectedClientId = formValue.clientId?.trim();

    if (hasNewClientName || !selectedClientId) {
      return true;
    }

    const isAuthorized = this.clients().some((client) => client.id === selectedClientId);
    if (isAuthorized) {
      return true;
    }

    this.error.set('Le client sélectionné n’est pas autorisé pour votre périmètre facture.');
    this.isSuccess.set(false);
    return false;
  }

  private ensureExistingChantierIsAuthorized(formValue: SubmitBillInput): boolean {
    const selectedChantierId = formValue.chantierId?.trim();

    if (formValue.shouldCreateChantier || !selectedChantierId) {
      return true;
    }

    const isAuthorized = this.chantiers().some((chantier) => chantier.id === selectedChantierId);
    if (isAuthorized) {
      return true;
    }

    this.error.set('Le chantier sélectionné n’est pas autorisé pour votre périmètre facture.');
    this.isSuccess.set(false);
    return false;
  }

  private async requestCreationWithChantierValidation(formValue: SubmitBillInput): Promise<void> {
    const shouldCreateChantier = !!formValue.shouldCreateChantier;
    const normalizedName = this.normalizeChantierName(formValue.chantierName);

    if (!shouldCreateChantier || !normalizedName) {
      await this.createInvoice(formValue);
      return;
    }

    const matchingChantier = this.chantiers().find(
      (chantier) => this.normalizeChantierName(chantier.name) === normalizedName
    );

    if (!matchingChantier) {
      await this.createInvoice(formValue);
      return;
    }

    this.duplicateChantierPrompt.set({
      existingChantierId: matchingChantier.id,
      existingChantierName: matchingChantier.name,
      pendingForm: formValue
    });
  }
}
