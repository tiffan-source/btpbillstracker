import { Component, inject } from '@angular/core';
import { BillingFacade } from '../../services/billing.facade';

@Component({
  selector: 'app-new-bill',
  standalone: true,
  template: `
    <div class="new-bill-container">
      <h2>Créer une nouvelle facture</h2>

      @if (facade.error()) {
        <div class="error-message">{{ facade.error() }}</div>
      }

      @if (facade.draftBill()) {
        <div class="success-message">
          Facture générée avec succès : {{ facade.draftBill()?.reference }}
        </div>
      }

      <button
        [disabled]="facade.isSubmitting()"
        (click)="createBill()">
        {{ facade.isSubmitting() ? 'Création en cours...' : 'Créer la facture' }}
      </button>
    </div>
  `
})
export class NewBillComponent {
  readonly facade = inject(BillingFacade);

  createBill(): void {
    // For this first slice, we hardcode the client ID as specified
    this.facade.createDraftBill('HARDCODED-CLIENT-ID');
  }
}

