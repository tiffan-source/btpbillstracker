import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BillingFacade } from '../../services/billing.facade';
import { BillPdfMemoryFile } from '../../stores/bill.store';
import { NewBillForm } from '../../forms/new-bill.form';

@Component({
  selector: 'app-new-bill',
  imports: [ReactiveFormsModule],
  templateUrl: './new-bill.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewBillComponent {
  readonly facade = inject(BillingFacade);
  readonly invoiceForm = new NewBillForm();
  isCreatingNewClient = false;

  toggleNewClientMode(): void {
    this.isCreatingNewClient = !this.isCreatingNewClient;
  }

  onSubmit(): void {
    if (this.invoiceForm.invalid) return;
    this.facade.createInvoice(this.invoiceForm.getPayload());
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
