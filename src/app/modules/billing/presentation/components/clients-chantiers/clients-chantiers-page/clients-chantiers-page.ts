import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ClientCardComponent } from '../client-card/client-card.component';
import { ClientFormModalComponent } from '../client-form-modal/client-form-modal.component';
import { ClientsChantiersFacade } from '../../../services/clients-chantiers.facade';
import { ChantierCardComponent } from '../chantier-card/chantier-card.component';
import { ChantierFormModalComponent } from '../chantier-form-modal/chantier-form-modal.component';

@Component({
  selector: 'app-clients-chantiers-page',
  imports: [ClientCardComponent, ClientFormModalComponent, ChantierCardComponent, ChantierFormModalComponent],
  templateUrl: './clients-chantiers-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientsChantiersPage implements OnInit {
  readonly facade = inject(ClientsChantiersFacade);

  readonly isClientModalOpen = signal(false);
  readonly editedClientId = signal<string | null>(null);
  readonly clientEditTrigger = signal<HTMLElement | null>(null);
  readonly isChantierModalOpen = signal(false);
  readonly editedChantierId = signal<string | null>(null);
  readonly chantierEditTrigger = signal<HTMLElement | null>(null);

  ngOnInit(): void {
    void Promise.all([this.facade.loadClients(), this.facade.loadChantiers()]);
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

  openChantierModal(chantierId: string, trigger: HTMLElement): void {
    this.chantierEditTrigger.set(trigger);
    this.editedChantierId.set(chantierId);
    this.isChantierModalOpen.set(true);
  }

  closeChantierModal(): void {
    this.isChantierModalOpen.set(false);
    this.editedChantierId.set(null);

    const trigger = this.chantierEditTrigger();
    if (trigger) {
      queueMicrotask(() => trigger.focus());
    }
  }

  editedChantier() {
    const editedChantierId = this.editedChantierId();
    return this.facade.chantiers().find((chantier) => chantier.id === editedChantierId) ?? null;
  }

  async saveChantier(payload: { id: string; name: string }): Promise<void> {
    const success = await this.facade.updateChantier(payload.id, { name: payload.name });
    if (success) {
      this.closeChantierModal();
    }
  }
}
