import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type ChantierCardViewModel = {
  id: string;
  name: string;
  paid: number;
  pending: number;
  progressPercent: number;
};

@Component({
  selector: 'app-chantier-card',
  imports: [],
  templateUrl: './chantier-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChantierCardComponent {
  readonly chantier = input.required<ChantierCardViewModel>();
  readonly edit = output<{ id: string; trigger: HTMLElement }>();

  onEdit(trigger: HTMLElement): void {
    this.edit.emit({ id: this.chantier().id, trigger });
  }
}
