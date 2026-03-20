import { ChangeDetectionStrategy, Component, effect, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ClientForm } from '../../../forms/client-form.form';

export type EditableClient = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

@Component({
  selector: 'app-client-form-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './client-form-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientFormModalComponent {
  readonly isOpen = input.required<boolean>();
  readonly client = input<EditableClient | null>(null);
  readonly isSubmitting = input(false);

  readonly closed = output<void>();
  readonly saved = output<{ id: string; firstName: string; lastName: string; email: string; phone: string }>();

  protected readonly form = signal(new ClientForm());
  private readonly firstNameInput = viewChild<ElementRef<HTMLInputElement>>('firstNameInput');

  constructor() {
    effect(() => {
      if (!this.isOpen()) {
        return;
      }

      const client = this.client();
      const form = new ClientForm({
        firstName: client?.firstName ?? '',
        lastName: client?.lastName ?? '',
        email: client?.email ?? '',
        phone: client?.phone ?? ''
      });

      this.form.set(form);
      queueMicrotask(() => {
        this.firstNameInput()?.nativeElement.focus();
      });
    });
  }

  onCancel(): void {
    this.closed.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closed.emit();
    }
  }

  onEscape(): void {
    this.closed.emit();
  }

  onSubmit(): void {
    const currentForm = this.form();
    if (currentForm.invalid || !this.client()) {
      currentForm.markAllAsTouched();
      return;
    }

    const value = currentForm.getPayload();
    this.saved.emit({
      id: this.client()!.id,
      firstName: value.firstName,
      lastName: value.lastName,
      email: value.email,
      phone: value.phone
    });
  }
}
