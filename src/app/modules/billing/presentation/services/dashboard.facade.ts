import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ListClientsUseCase } from '../../../clients';
import { ListChantiersUseCase } from '../../../chantiers';
import { Bill, BillStatus } from '../../domain/entities/bill.entity';
import { ListUserBillsUseCase } from '../../domain/usecases/list-user-bills.usecase';
import { UpdateEnrichedBillInput, UpdateEnrichedBillUseCase } from '../../domain/usecases/update-enriched-bill.usecase';
import { EditBillFormValue } from '../forms/edit-bill.form';
import { ClientDisplayResolver } from './client-display.resolver';
import { ResolveChantierIdPort } from '../../domain/ports/resolve-chantier-id.port';

export type DashboardInvoiceStatus = 'EN_RETARD' | 'EN_COURS' | 'PAYE';

export type DashboardInvoiceViewModel = {
  id: string;
  client: string;
  showsIncompleteClientIndicator: boolean;
  chantier: string;
  amountTTC: number;
  dueDate: string;
  status: DashboardInvoiceStatus;
  nextReminder: string;
  overdueDays: number;
};

export type DashboardKpi = {
  totalOverdueAmount: number;
  overdueInvoices: number;
  toCollectThisMonth: number;
  inProgressInvoices: number;
};

export type EditableInvoiceViewModel = {
  id: string;
  reference: string;
  clientId: string;
  chantierId: string;
  chantierName: string;
  shouldCreateChantier: boolean;
  amountTTC: number | null;
  dueDate: string;
  invoiceNumber: string;
  type: string;
  paymentMode: string;
  status: BillStatus;
  remindersAutoEnabled: boolean;
  reminderScenarioId: string;
};

@Injectable({ providedIn: 'root' })
export class DashboardFacade {
  private readonly router = inject(Router);
  private readonly listUserBillsUseCase = inject(ListUserBillsUseCase);
  private readonly listClientsUseCase = inject(ListClientsUseCase);
  private readonly listChantiersUseCase = inject(ListChantiersUseCase);
  private readonly updateEnrichedBillUseCase = inject(UpdateEnrichedBillUseCase);
  private readonly resolveChantierIdPort = inject(ResolveChantierIdPort);
  private readonly clientDisplayResolver = inject(ClientDisplayResolver);
  private readonly markedPaid = signal<Record<string, true>>({});
  private readonly persistedBills = signal<Bill[]>([]);
  private readonly clientsById = signal<Record<string, { id: string; name?: string; firstName?: string; lastName?: string }>>({});
  private readonly chantiersById = signal<Record<string, { id: string; name: string }>>({});

  readonly isEditModalOpen = signal(false);
  readonly isEditSubmitting = signal(false);
  readonly editError = signal<string | null>(null);
  readonly editSuccess = signal(false);
  readonly duplicateChantierPrompt = signal<{ existingChantierId: string; existingChantierName: string } | null>(null);
  private pendingEditPayload: EditBillFormValue | null = null;

  constructor() {
    void this.refreshPersistedInvoices();
  }

  readonly invoices = computed(() => {
    const persisted = this.persistedBills().map((bill) => this.mapBillToDashboardInvoice(bill));
    const merged = [...persisted];
    const paid = this.markedPaid();

    return merged.map((invoice) =>
      paid[invoice.id] ? { ...invoice, status: 'PAYE' as const, overdueDays: 0 } : invoice
    );
  });

  readonly clients = computed<{ id: string; name: string }[]>(() => {
    const byId = new Map<string, { id: string; name: string }>();
    const lookup = this.clientsById();

    for (const bill of this.persistedBills()) {
      const id = bill.clientId.trim();
      if (!id || byId.has(id)) {
        continue;
      }
      const resolved = this.clientDisplayResolver.resolve(
        lookup[id] ?? { id }
      );
      byId.set(id, { id, name: resolved.label });
    }

    return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  });

  readonly chantiers = computed<{ id: string; name: string }[]>(() => {
    const eligibleIds = new Set(
      this.persistedBills()
        .map((bill) => bill.chantierId?.trim() ?? '')
        .filter((id) => id.length > 0)
    );
    const lookup = this.chantiersById();

    return Object.values(lookup)
      .filter((chantier) => eligibleIds.has(chantier.id))
      .sort((first, second) => first.name.localeCompare(second.name, 'fr', { sensitivity: 'base' }));
  });

  readonly urgentInvoices = computed(() =>
    this.invoices()
      .filter((invoice) => invoice.status === 'EN_RETARD')
      .sort((a, b) => b.overdueDays - a.overdueDays)
      .slice(0, 3)
  );

  readonly kpis = computed<DashboardKpi>(() => {
    const invoices = this.invoices();
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    const totalOverdueAmount = invoices
      .filter((invoice) => invoice.status === 'EN_RETARD')
      .reduce((sum, invoice) => sum + invoice.amountTTC, 0);

    const overdueInvoices = invoices.filter((invoice) => invoice.status === 'EN_RETARD').length;

    const toCollectThisMonth = invoices
      .filter((invoice) => {
        if (invoice.status === 'PAYE') {
          return false;
        }
        const due = new Date(invoice.dueDate);
        return due.getMonth() === month && due.getFullYear() === year;
      })
      .reduce((sum, invoice) => sum + invoice.amountTTC, 0);

    const inProgressInvoices = invoices.filter((invoice) => invoice.status === 'EN_COURS').length;

    return {
      totalOverdueAmount,
      overdueInvoices,
      toCollectThisMonth,
      inProgressInvoices
    };
  });

  markAsPaid(invoiceId: string): void {
    this.markedPaid.update((state) => ({ ...state, [invoiceId]: true }));
  }

  async openEditInvoice(invoiceId: string): Promise<EditableInvoiceViewModel | null> {
    this.editError.set(null);
    this.editSuccess.set(false);
    await this.refreshPersistedInvoices();
    const bill = this.persistedBills().find((item) => item.id === invoiceId);

    if (!bill) {
      this.editError.set("Seules les factures persistées peuvent être modifiées.");
      this.isEditModalOpen.set(false);
      return null;
    }

    this.isEditModalOpen.set(true);
    return this.mapBillToEditableInvoice(bill);
  }

  closeEditModal(): void {
    if (this.isEditSubmitting()) {
      return;
    }
    this.isEditModalOpen.set(false);
  }

  async submitEditedInvoice(payload: EditBillFormValue): Promise<void> {
    if (this.isSubmittingNewChantierDuplicate(payload)) {
      return;
    }

    await this.executeEditedInvoiceSubmit(payload);
  }

  async confirmUseExistingChantierForEdit(): Promise<void> {
    const prompt = this.duplicateChantierPrompt();
    if (!prompt || !this.pendingEditPayload) {
      return;
    }

    const payload = {
      ...this.pendingEditPayload,
      chantierId: prompt.existingChantierId,
      chantierName: '',
      shouldCreateChantier: false
    };
    this.duplicateChantierPrompt.set(null);
    this.pendingEditPayload = null;
    await this.executeEditedInvoiceSubmit(payload);
  }

  async confirmCreateNewChantierForEdit(): Promise<void> {
    if (!this.pendingEditPayload) {
      return;
    }
    const payload = this.pendingEditPayload;
    this.duplicateChantierPrompt.set(null);
    this.pendingEditPayload = null;
    await this.executeEditedInvoiceSubmit(payload);
  }

  dismissDuplicateChantierPromptForEdit(): void {
    this.duplicateChantierPrompt.set(null);
    this.pendingEditPayload = null;
  }

  private async executeEditedInvoiceSubmit(payload: EditBillFormValue): Promise<void> {
    this.editError.set(null);
    this.editSuccess.set(false);
    if (!this.ensureAuthorizedExistingClient(payload.clientId)) {
      return;
    }
    this.isEditSubmitting.set(true);

    const chantierIdResult = await this.resolveEditedChantierId(payload);
    if (!chantierIdResult.success) {
      this.editError.set(chantierIdResult.error.message);
      this.isEditSubmitting.set(false);
      return;
    }

    const input: UpdateEnrichedBillInput = {
      id: payload.id,
      reference: payload.reference,
      clientId: payload.clientId.trim(),
      amountTTC: payload.amountTTC ?? 0,
      dueDate: payload.dueDate,
      externalInvoiceReference: payload.invoiceNumber,
      type: payload.type,
      paymentMode: payload.paymentMode,
      chantierId: chantierIdResult.data,
      status: payload.status,
      remindersAutoEnabled: payload.remindersAutoEnabled,
      reminderScenarioId: payload.reminderScenarioId
    };

    const result = await this.updateEnrichedBillUseCase.execute(input);

    if (result.success) {
      await this.refreshPersistedInvoices();
      this.isEditModalOpen.set(false);
      this.editSuccess.set(true);
    } else {
      this.editError.set(result.error.message);
    }

    this.isEditSubmitting.set(false);
  }

  dismissEditSuccess(): void {
    this.editSuccess.set(false);
  }

  private mapBillToDashboardInvoice(bill: Bill): DashboardInvoiceViewModel {
    const amount = bill.amountTTC ?? 0;
    const dueDate = bill.dueDate ?? new Date().toISOString().slice(0, 10);
    const overdueDays = this.computeOverdueDays(dueDate);
    const status = this.mapBillStatusForDashboard(bill.status, overdueDays);
    const profile = this.clientsById()[bill.clientId] ?? { id: bill.clientId };
    const resolvedClient = this.clientDisplayResolver.resolve(profile);

    const chantierId = bill.chantierId?.trim() ?? '';
    const chantierLabel = chantierId
      ? this.chantiersById()[chantierId]?.name ?? chantierId
      : 'Chantier non renseigné';

    return {
      id: bill.id,
      client: resolvedClient.label,
      showsIncompleteClientIndicator: resolvedClient.showsIncompleteIndicator,
      chantier: chantierLabel,
      amountTTC: amount,
      dueDate,
      status,
      nextReminder: '—',
      overdueDays
    };
  }

  private mapBillToEditableInvoice(bill: Bill): EditableInvoiceViewModel {
    return {
      id: bill.id,
      reference: bill.reference,
      clientId: bill.clientId,
      chantierId: bill.chantierId ?? '',
      chantierName: '',
      shouldCreateChantier: false,
      amountTTC: bill.amountTTC ?? null,
      dueDate: bill.dueDate ?? '',
      invoiceNumber: bill.externalInvoiceReference ?? '',
      type: bill.type ?? 'Situation',
      paymentMode: bill.paymentMode ?? 'Virement',
      status: bill.status,
      remindersAutoEnabled: bill.remindersAutoEnabled,
      reminderScenarioId: bill.reminderScenarioId ?? ''
    };
  }

  private mapBillStatusForDashboard(status: BillStatus, overdueDays: number): DashboardInvoiceStatus {
    if (status === 'PAID') {
      return 'PAYE';
    }

    if (overdueDays > 0) {
      return 'EN_RETARD';
    }

    return 'EN_COURS';
  }

  private computeOverdueDays(dueDateIso: string): number {
    const dueDate = new Date(dueDateIso);
    const today = new Date();
    const diff = today.getTime() - dueDate.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    return days > 0 ? days : 0;
  }

  private async refreshPersistedInvoices(): Promise<void> {
    const [billsResult, clientsResult, chantiersResult] = await Promise.all([
      this.listUserBillsUseCase.execute(),
      this.listClientsUseCase.execute(),
      this.listChantiersUseCase.execute()
    ]);

    if (clientsResult.success) {
      const byId = clientsResult.data.reduce<Record<string, { id: string; name?: string; firstName?: string; lastName?: string }>>(
        (acc, client) => {
          acc[client.id] = {
            id: client.id,
            name: client.name,
            firstName: client.firstName,
            lastName: client.lastName
          };
          return acc;
        },
        {}
      );
      this.clientsById.set(byId);
    } else {
      this.clientsById.set({});
    }

    if (chantiersResult.success) {
      const byId = chantiersResult.data.reduce<Record<string, { id: string; name: string }>>(
        (acc, chantier) => {
          acc[chantier.id] = { id: chantier.id, name: chantier.name };
          return acc;
        },
        {}
      );
      this.chantiersById.set(byId);
    } else {
      this.chantiersById.set({});
    }

    if (billsResult.success) {
      this.persistedBills.set(billsResult.data);
      return;
    }

    this.persistedBills.set([]);
    if (billsResult.error.code === 'AUTH_USER_NOT_FOUND' || billsResult.error.code.startsWith('AUTH_')) {
      await this.router.navigateByUrl('/login?returnUrl=/dashboard');
      return;
    }

    this.editError.set(billsResult.error.message);
  }

  private isSubmittingNewChantierDuplicate(payload: EditBillFormValue): boolean {
    if (!payload.shouldCreateChantier) {
      return false;
    }
    const chantierName = payload.chantierName.trim();
    if (!chantierName) {
      return false;
    }
    const normalized = this.normalizeName(chantierName);
    const duplicate = this.chantiers().find((chantier) => this.normalizeName(chantier.name) === normalized);
    if (!duplicate) {
      return false;
    }
    this.pendingEditPayload = payload;
    this.duplicateChantierPrompt.set({
      existingChantierId: duplicate.id,
      existingChantierName: duplicate.name
    });
    return true;
  }

  private async resolveEditedChantierId(payload: EditBillFormValue) {
    if (!payload.shouldCreateChantier) {
      return { success: true as const, data: payload.chantierId };
    }
    const chantierName = payload.chantierName.trim();
    if (!chantierName) {
      return { success: false as const, error: { code: 'CHANTIER_NAME_REQUIRED', message: 'Le nom du chantier est obligatoire.' } };
    }
    return this.resolveChantierIdPort.execute({ chantierName });
  }

  private normalizeName(value: string): string {
    return value
      .trim()
      .normalize('NFKD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/\s+/g, ' ')
      .toLowerCase();
  }

  private ensureAuthorizedExistingClient(clientId: string): boolean {
    const selectedClientId = clientId.trim();
    if (!selectedClientId) {
      this.editError.set('Le client sélectionné est invalide.');
      return false;
    }

    if (Object.keys(this.clientsById()).length === 0) {
      return true;
    }

    const isAuthorized = !!this.clientsById()[selectedClientId];
    if (isAuthorized) {
      return true;
    }

    this.editError.set('Le client sélectionné n’est pas autorisé pour votre périmètre facture.');
    return false;
  }
}
