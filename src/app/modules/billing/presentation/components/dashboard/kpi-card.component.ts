import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type KpiCardVariant = 'danger' | 'warning' | 'neutral';

@Component({
  selector: 'app-kpi-card',
  templateUrl: './kpi-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KpiCardComponent {
  readonly title = input.required<string>();
  readonly value = input.required<string>();
  readonly icon = input.required<string>();
  readonly variant = input<KpiCardVariant>('neutral');
}

