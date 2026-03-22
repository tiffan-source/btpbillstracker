import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
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
  readonly chantiers = input<{ id: string; name: string }[]>([]);
  readonly form = input.required<EditBillForm>();
  readonly duplicateChantierPrompt = input<{ existingChantierName: string } | null>(null);

  readonly requestClose = output<void>();
  readonly save = output<void>();
  readonly useExistingChantier = output<void>();
  readonly createNewChantier = output<void>();
  readonly closeDuplicateChantierPrompt = output<void>();

  readonly billTypes = BILL_TYPES;
  readonly paymentModes = PAYMENT_MODES;
  readonly statuses: BillStatus[] = ['DRAFT', 'VALIDATED', 'PAID'];
  readonly reminderScenarioLabel = STANDARD_REMINDER_SCENARIO_NAME;
  isCreatingNewClient = false;

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

  toggleNewChantierMode(): void {
    this.form().setChantierMode(!this.form().controls.shouldCreateChantier.value);
  }

  toggleNewClientMode(): void {
    this.isCreatingNewClient = !this.isCreatingNewClient;
    this.form().setClientMode(this.isCreatingNewClient);
  }

  hasFieldError(controlName: keyof EditBillForm['controls']): boolean {
    const control = this.form().controls[controlName];
    return control.invalid;
  }

  availableChantiers(): { id: string; name: string }[] {
    const fromScope = this.chantiers();
    const selectedId = this.form().controls.chantierId.value.trim();
    if (!selectedId || fromScope.some((chantier) => chantier.id === selectedId)) {
      return fromScope;
    }
    return [...fromScope, { id: selectedId, name: `${selectedId} (hors liste)` }];
  }

  onUseExistingChantier(): void {
    this.useExistingChantier.emit();
  }

  onCreateNewChantierAnyway(): void {
    this.createNewChantier.emit();
  }

  onCloseDuplicateChantierPrompt(): void {
    this.closeDuplicateChantierPrompt.emit();
  }

  onDocumentKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || !this.open() || this.isSubmitting()) {
      return;
    }
    this.requestClose.emit();
  }
}
