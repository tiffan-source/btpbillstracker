import { computed, inject, Injectable, signal } from '@angular/core';
import { Bill, BillStatus } from '../../domain/entities/bill.entity';
import { BillRepository } from '../../domain/ports/bill.repository';
import { UpdateEnrichedBillInput, UpdateEnrichedBillUseCase } from '../../domain/usecases/update-enriched-bill.usecase';
import { EditBillFormValue } from '../forms/edit-bill.form';

export type DashboardInvoiceStatus = 'EN_RETARD' | 'EN_COURS' | 'PAYE';

export type DashboardInvoiceViewModel = {
  id: string;
  client: string;
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
// This is strange, why facade comunicate with repository. There should have usecase to handle this logic
  private readonly repository = inject(BillRepository);

  private readonly updateEnrichedBillUseCase = inject(UpdateEnrichedBillUseCase);
  private readonly markedPaid = signal<Record<string, true>>({});
  private readonly persistedBills = signal<Bill[]>([]);

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
    const uniqueByName = new Map<string, { id: string; name: string }>();

    for (const bill of this.persistedBills()) {
      const name = bill.clientId.trim();
      if (!name || uniqueByName.has(name.toLowerCase())) {
        continue;
      }
      uniqueByName.set(name.toLowerCase(), { id: name, name });
    }

    return Array.from(uniqueByName.values()).sort((a, b) => a.name.localeCompare(b.name, 'fr'));
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
      chantier: payload.chantier,
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

    return {
      id: bill.id,
      client: bill.clientId || 'Client',
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
    try {
      // This is strange, why facade comunicate with repository. There should have usecase to handle this logic
      const bills = await this.repository.list();
      this.persistedBills.set(bills);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Impossible de charger les factures persistées.';
      this.editError.set(message);
      this.persistedBills.set([]);
    }
  }
}
