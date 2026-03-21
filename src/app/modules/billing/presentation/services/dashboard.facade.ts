import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ListClientsUseCase } from '../../../clients';
import { Bill, BillStatus } from '../../domain/entities/bill.entity';
import { ListUserBillsUseCase } from '../../domain/usecases/list-user-bills.usecase';
import { UpdateEnrichedBillInput, UpdateEnrichedBillUseCase } from '../../domain/usecases/update-enriched-bill.usecase';
import { EditBillFormValue } from '../forms/edit-bill.form';
import { ClientDisplayResolver } from './client-display.resolver';

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
  chantier: string;
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
  private readonly updateEnrichedBillUseCase = inject(UpdateEnrichedBillUseCase);
  private readonly clientDisplayResolver = inject(ClientDisplayResolver);
  private readonly markedPaid = signal<Record<string, true>>({});
  private readonly persistedBills = signal<Bill[]>([]);
  private readonly clientsById = signal<Record<string, { id: string; name?: string; firstName?: string; lastName?: string }>>({});

  readonly isEditModalOpen = signal(false);
  readonly isEditSubmitting = signal(false);
  readonly editError = signal<string | null>(null);
  readonly editSuccess = signal(false);

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
    this.editError.set(null);
    this.editSuccess.set(false);
    this.isEditSubmitting.set(true);

    const input: UpdateEnrichedBillInput = {
      id: payload.id,
      reference: payload.reference,
      clientId: payload.newClientName.trim() ? payload.newClientName.trim() : payload.clientId,
      amountTTC: payload.amountTTC ?? 0,
      dueDate: payload.dueDate,
      externalInvoiceReference: payload.invoiceNumber,
      type: payload.type,
      paymentMode: payload.paymentMode,
      chantierId: payload.chantier,
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

    return {
      id: bill.id,
      client: resolvedClient.label,
      showsIncompleteClientIndicator: resolvedClient.showsIncompleteIndicator,
      chantier: bill.chantier ?? 'Chantier non renseigné',
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
      chantier: bill.chantier ?? '',
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
    const [billsResult, clientsResult] = await Promise.all([
      this.listUserBillsUseCase.execute(),
      this.listClientsUseCase.execute()
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
}
