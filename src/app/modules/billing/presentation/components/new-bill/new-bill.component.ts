import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BillingFacade } from '../../services/billing.facade';

@Component({
  selector: 'app-new-bill',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './new-bill.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewBillComponent {
  readonly facade = inject(BillingFacade);
  private fb = inject(FormBuilder);

  invoiceForm = this.fb.group({
    clientId: [''],
    newClientName: [''],
    chantier: [''],
    amountTTC: [null as number | null],
    dueDate: [''],
    invoiceNumber: [''],
    type: ['Situation'],
    paymentMode: ['Virement'],
    scenario: ['standard']
  });

  onSubmit(): void {
    if (this.invoiceForm.invalid) return;
    this.facade.createInvoice(this.invoiceForm.value);
  }
}
