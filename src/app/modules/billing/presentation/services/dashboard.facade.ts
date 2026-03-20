import { computed, inject, Injectable, signal } from '@angular/core';
import { BillStore, BillViewModel } from '../stores/bill.store';

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

@Injectable({ providedIn: 'root' })
export class DashboardFacade {
  private readonly store = inject(BillStore);
  private readonly markedPaid = signal<Record<string, true>>({});

  private readonly seededInvoices = signal<DashboardInvoiceViewModel[]>([
    {
      id: 'inv-urgent-1',
      client: 'Marie Lambert',
      chantier: 'Cadjehoun',
      amountTTC: 156,
      dueDate: '2026-03-19',
      status: 'EN_RETARD',
      nextReminder: '—',
      overdueDays: 1
    },
    {
      id: 'inv-2',
      client: 'Sonia Ahouanvoébla',
      chantier: 'Akpakpa',
      amountTTC: 480,
      dueDate: '2026-03-28',
      status: 'EN_COURS',
      nextReminder: '—',
      overdueDays: 0
    },
    {
      id: 'inv-3',
      client: 'BTP Yovo',
      chantier: 'Calavi',
      amountTTC: 920,
      dueDate: '2026-03-05',
      status: 'PAYE',
      nextReminder: '—',
      overdueDays: 0
    }
  ]);

  readonly invoices = computed(() => {
    const draft = this.store.draftBill();
    const base = this.seededInvoices();
    const merged = draft ? [this.mapDraftToDashboardInvoice(draft), ...base] : base;
    const paid = this.markedPaid();

    return merged.map((invoice) =>
      paid[invoice.id] ? { ...invoice, status: 'PAYE' as const, overdueDays: 0 } : invoice
    );
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

  private mapDraftToDashboardInvoice(draft: BillViewModel): DashboardInvoiceViewModel {
    const amount = draft.amountTTC ?? 0;
    const dueDate = draft.dueDate ?? new Date().toISOString().slice(0, 10);
    const overdueDays = this.computeOverdueDays(dueDate);

    return {
      id: draft.id,
      client: draft.clientId || 'Client',
      chantier: 'Chantier non renseigné',
      amountTTC: amount,
      dueDate,
      status: overdueDays > 0 ? 'EN_RETARD' : 'EN_COURS',
      nextReminder: '—',
      overdueDays
    };
  }

  private computeOverdueDays(dueDateIso: string): number {
    const dueDate = new Date(dueDateIso);
    const today = new Date();
    const diff = today.getTime() - dueDate.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    return days > 0 ? days : 0;
  }
}

