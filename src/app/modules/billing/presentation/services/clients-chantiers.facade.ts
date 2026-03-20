import { computed, inject, Injectable, signal } from '@angular/core';
import { BillRepository } from '../../domain/ports/bill.repository';
import { ListClientsUseCase, UpdateClientUseCase } from '../../../clients';

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

@Injectable({ providedIn: 'root' })
export class ClientsChantiersFacade {
  private readonly listClientsUseCase = inject(ListClientsUseCase);
  private readonly updateClientUseCase = inject(UpdateClientUseCase);
  private readonly billRepository = inject(BillRepository);

  private readonly clientsState = signal<ClientsDashboardViewModel[]>([]);
  readonly error = signal<string | null>(null);
  readonly isSubmitting = signal(false);

  readonly clients = computed(() => this.clientsState());

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
}
