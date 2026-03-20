import { ChangeDetectionStrategy, Component, effect, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ChantierForm } from '../../../forms/chantier-form.form';

export type EditableChantier = {
  id: string;
  name: string;
};

@Component({
  selector: 'app-chantier-form-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './chantier-form-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChantierFormModalComponent {
  readonly isOpen = input.required<boolean>();
  readonly chantier = input<EditableChantier | null>(null);
  readonly isSubmitting = input(false);

  readonly closed = output<void>();
  readonly saved = output<{ id: string; name: string }>();

  protected readonly form = signal(new ChantierForm());
  private readonly nameInput = viewChild<ElementRef<HTMLInputElement>>('nameInput');

  constructor() {
    effect(() => {
      if (!this.isOpen()) {
        return;
      }

      const chantier = this.chantier();
      this.form.set(new ChantierForm({ name: chantier?.name ?? '' }));
      queueMicrotask(() => this.nameInput()?.nativeElement.focus());
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
    const form = this.form();
    if (form.invalid || !this.chantier()) {
      form.markAllAsTouched();
      return;
    }

    const value = form.getPayload();
    this.saved.emit({ id: this.chantier()!.id, name: value.name });
  }
}
