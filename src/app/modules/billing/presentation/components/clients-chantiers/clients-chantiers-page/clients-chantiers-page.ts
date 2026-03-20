import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ClientCardComponent } from '../client-card/client-card.component';
import { ClientFormModalComponent } from '../client-form-modal/client-form-modal.component';
import { ClientsChantiersFacade } from '../../../services/clients-chantiers.facade';

@Component({
  selector: 'app-clients-chantiers-page',
  imports: [ClientCardComponent, ClientFormModalComponent],
  templateUrl: './clients-chantiers-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientsChantiersPage implements OnInit {
  readonly facade = inject(ClientsChantiersFacade);

  readonly isClientModalOpen = signal(false);
  readonly editedClientId = signal<string | null>(null);
  readonly clientEditTrigger = signal<HTMLElement | null>(null);

  ngOnInit(): void {
    void this.facade.loadClients();
  }

  openClientModal(clientId: string, trigger: HTMLElement): void {
    this.clientEditTrigger.set(trigger);
    this.editedClientId.set(clientId);
    this.isClientModalOpen.set(true);
  }

  closeClientModal(): void {
    this.isClientModalOpen.set(false);
    this.editedClientId.set(null);

    const trigger = this.clientEditTrigger();
    if (trigger) {
      queueMicrotask(() => trigger.focus());
    }
  }

  editedClient() {
    const editedClientId = this.editedClientId();
    return this.facade.clients().find((client) => client.id === editedClientId) ?? null;
  }

  async saveClient(payload: { id: string; firstName: string; lastName: string; email: string; phone: string }): Promise<void> {
    const success = await this.facade.updateClient(payload.id, payload);
    if (success) {
      this.closeClientModal();
    }
  }
}
