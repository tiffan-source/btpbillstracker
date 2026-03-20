import { ChangeDetectionStrategy, Component, HostListener, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { EditBillForm } from '../../forms/edit-bill.form';
import { BILL_TYPES, PAYMENT_MODES } from '../../../domain/values/bill.constraints';
import { STANDARD_REMINDER_SCENARIO_NAME } from '../../../../reminders/domain/values/reminder.constants';
import { BillStatus } from '../../../domain/entities/bill.entity';

@Component({
  selector: 'app-edit-bill-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './edit-bill-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditBillModalComponent {
  readonly open = input(false);
  readonly isSubmitting = input(false);
  readonly clients = input<{ id: string; name: string }[]>([]);
  readonly form = input.required<EditBillForm>();

  readonly requestClose = output<void>();
  readonly save = output<void>();

  readonly billTypes = BILL_TYPES;
  readonly paymentModes = PAYMENT_MODES;
  readonly statuses: BillStatus[] = ['DRAFT', 'VALIDATED', 'PAID'];
  readonly reminderScenarioLabel = STANDARD_REMINDER_SCENARIO_NAME;

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (!this.open() || this.isSubmitting()) {
      return;
    }
    this.requestClose.emit();
  }

  onOverlayClick(): void {
    if (this.isSubmitting()) {
      return;
    }
    this.requestClose.emit();
  }

  onCancel(): void {
    if (this.isSubmitting()) {
      return;
    }
    this.requestClose.emit();
  }

  onSubmit(): void {
    const form = this.form();
    if (this.isSubmitting()) {
      return;
    }
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }
    this.save.emit();
  }

  toggleRemindersAuto(isEnabled: boolean): void {
    this.form().setRemindersAutoEnabled(isEnabled);
  }

  hasFieldError(controlName: keyof EditBillForm['controls']): boolean {
    const control = this.form().controls[controlName];
    return control.invalid;
  }
}
