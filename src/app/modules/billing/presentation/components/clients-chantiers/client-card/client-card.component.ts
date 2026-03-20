import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type ClientCardViewModel = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  invoiceCount: number;
  totalDue: number;
  paid: number;
};

@Component({
  selector: 'app-client-card',
  imports: [],
  templateUrl: './client-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientCardComponent {
  readonly client = input.required<ClientCardViewModel>();
  readonly edit = output<{ id: string; trigger: HTMLElement }>();

  onEdit(trigger: HTMLElement): void {
    this.edit.emit({ id: this.client().id, trigger });
  }
}
