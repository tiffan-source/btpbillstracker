import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BillingFacade, SubmitBillInput } from '../../services/billing.facade';

@Component({
  selector: 'app-new-bill',
  standalone: true,
  imports: [ReactiveFormsModule],
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

      <form [formGroup]="billForm" (ngSubmit)="onSubmit()">
        <fieldset>
          <legend>Sélection Client</legend>
          
          <label>
            <input type="radio" formControlName="isNewClient" [value]="false">
            Client existant
          </label>
          <label>
            <input type="radio" formControlName="isNewClient" [value]="true">
            Nouveau client (Rapide)
          </label>
        </fieldset>

        @if (billForm.value.isNewClient) {
          <div class="form-group">
            <label for="clientName">Nom du client *</label>
            <input id="clientName" formControlName="clientName" type="text" placeholder="John Doe">
          </div>
          
          <div class="form-group">
            <label for="clientEmail">Email du client (Optionnel)</label>
            <input id="clientEmail" formControlName="clientEmail" type="email" placeholder="john@example.com">
          </div>
        } @else {
          <div class="form-group">
            <label for="existingClientId">Client</label>
            <select id="existingClientId" formControlName="existingClientId">
              <option value="client-1">Client 1</option>
              <option value="client-2">Client 2</option>
            </select>
          </div>
        }

        <button 
          type="submit"
          [disabled]="facade.isSubmitting() || billForm.invalid">
          {{ facade.isSubmitting() ? 'Création en cours...' : 'Créer la facture' }}
        </button>
      </form>
    </div>
  `
})
export class NewBillComponent {
  readonly facade = inject(BillingFacade);
  private fb = inject(FormBuilder);

  billForm = this.fb.group({
    isNewClient: [true],
    clientName: ['', Validators.required],
    clientEmail: [''],
    existingClientId: ['']
  });

  constructor() {
    // Dynamic validation
    this.billForm.get('isNewClient')?.valueChanges.subscribe(isNew => {
      if (isNew) {
        this.billForm.get('clientName')?.setValidators([Validators.required]);
        this.billForm.get('existingClientId')?.clearValidators();
      } else {
        this.billForm.get('existingClientId')?.setValidators([Validators.required]);
        this.billForm.get('clientName')?.clearValidators();
      }
      this.billForm.get('clientName')?.updateValueAndValidity();
      this.billForm.get('existingClientId')?.updateValueAndValidity();
    });
  }

  onSubmit(): void {
    if (this.billForm.invalid) return;

    const values = this.billForm.value;
    
    const input: SubmitBillInput = {
      isNewClient: !!values.isNewClient,
      clientIdOrName: values.isNewClient ? (values.clientName || '') : (values.existingClientId || ''),
      clientEmail: values.clientEmail || undefined
    };

    this.facade.submitNewBill(input);
  }
}
