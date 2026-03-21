import { computed, inject, Injectable, signal } from '@angular/core';
import { BillRepository } from '../../domain/ports/bill.repository';
import { ListClientsUseCase, UpdateClientUseCase } from '../../../clients';
import { ListChantiersUseCase, UpdateChantierUseCase } from '../../../chantiers';

export type ClientsDashboardViewModel = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  invoiceCount: number;
  totalDue: number;
  paid: number;
  firstName: string;
  lastName: string;
};

export type ChantiersDashboardViewModel = {
  id: string;
  name: string;
  paid: number;
  pending: number;
  progressPercent: number;
};

@Injectable({ providedIn: 'root' })
export class ClientsChantiersFacade {
  private readonly listClientsUseCase = inject(ListClientsUseCase);
  private readonly updateClientUseCase = inject(UpdateClientUseCase);
  private readonly listChantiersUseCase = inject(ListChantiersUseCase);
  private readonly updateChantierUseCase = inject(UpdateChantierUseCase);
  private readonly billRepository = inject(BillRepository);

  private readonly clientsState = signal<ClientsDashboardViewModel[]>([]);
  private readonly chantiersState = signal<ChantiersDashboardViewModel[]>([]);
  readonly error = signal<string | null>(null);
  readonly isSubmitting = signal(false);

  readonly clients = computed(() => this.clientsState());
  readonly chantiers = computed(() => this.chantiersState());

  async loadClients(): Promise<void> {
    this.error.set(null);

    const [clientsResult, bills] = await Promise.all([
      this.listClientsUseCase.execute(),
      this.billRepository.list()
    ]);

    if (!clientsResult.success) {
      this.error.set(clientsResult.error.message);
      return;
    }

    const mapped = clientsResult.data.map((client) => {
      const relatedBills = bills.filter((bill) => bill.clientId === client.id);
      const invoiceCount = relatedBills.length;
      const totalDue = relatedBills
        .filter((bill) => bill.status !== 'PAID')
        .reduce((sum, bill) => sum + (bill.amountTTC ?? 0), 0);
      const paid = relatedBills
        .filter((bill) => bill.status === 'PAID')
        .reduce((sum, bill) => sum + (bill.amountTTC ?? 0), 0);

      return {
        id: client.id,
        fullName: client.name,
        email: client.email ?? '—',
        phone: client.phone ?? '—',
        invoiceCount,
        totalDue,
        paid,
        firstName: client.firstName ?? '',
        lastName: client.lastName ?? ''
      };
    });

    this.clientsState.set(mapped);
  }

  async loadChantiers(): Promise<void> {
    this.error.set(null);

    const [chantiersResult, bills] = await Promise.all([
      this.listChantiersUseCase.execute(),
      this.billRepository.list()
    ]);

    if (!chantiersResult.success) {
      this.error.set(chantiersResult.error.message);
      return;
    }

    const mapped = chantiersResult.data.map((chantier) => {
      const relatedBills = bills.filter((bill) => (bill.chantierId ?? '').trim() === chantier.id);
      const paid = relatedBills
        .filter((bill) => bill.status === 'PAID')
        .reduce((sum, bill) => sum + (bill.amountTTC ?? 0), 0);
      const pending = relatedBills
        .filter((bill) => bill.status !== 'PAID')
        .reduce((sum, bill) => sum + (bill.amountTTC ?? 0), 0);
      const total = paid + pending;
      const progressPercent = total > 0 ? Math.round((paid / total) * 100) : 0;

      return {
        id: chantier.id,
        name: chantier.name,
        paid,
        pending,
        progressPercent
      };
    });

    this.chantiersState.set(mapped);
  }

  async updateClient(clientId: string, input: { firstName: string; lastName: string; email: string; phone: string }): Promise<boolean> {
    this.error.set(null);
    this.isSubmitting.set(true);

    const result = await this.updateClientUseCase.execute({
      id: clientId,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email || undefined,
      phone: input.phone || undefined
    });

    this.isSubmitting.set(false);

    if (!result.success) {
      this.error.set(result.error.message);
      return false;
    }

    await this.loadClients();
    return true;
  }

  async updateChantier(chantierId: string, input: { name: string }): Promise<boolean> {
    this.error.set(null);
    this.isSubmitting.set(true);

    const result = await this.updateChantierUseCase.execute({ id: chantierId, name: input.name });

    this.isSubmitting.set(false);

    if (!result.success) {
      this.error.set(result.error.message);
      return false;
    }

    await this.loadChantiers();
    return true;
  }
}
