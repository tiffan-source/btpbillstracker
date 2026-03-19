import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BillingFacade } from '../../services/billing.facade';
import { BillPdfMemoryFile } from '../../stores/bill.store';

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
    scenario: ['standard'],
    pdfFile: [null as BillPdfMemoryFile | null]
  });

  onSubmit(): void {
    if (this.invoiceForm.invalid) return;
    this.facade.createInvoice(this.invoiceForm.value);
  }

  onPdfSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      this.invoiceForm.patchValue({ pdfFile: null });
      return;
    }

    this.invoiceForm.patchValue({
      pdfFile: {
        name: file.name,
        size: file.size,
        type: file.type
      }
    });
  }
}
