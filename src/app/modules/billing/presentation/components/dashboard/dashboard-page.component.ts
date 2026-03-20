import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardFacade } from '../../services/dashboard.facade';
import { KpiCardComponent } from './kpi-card.component';

@Component({
  selector: 'app-dashboard-page',
  imports: [RouterLink, KpiCardComponent],
  templateUrl: './dashboard-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPageComponent {
  readonly facade = inject(DashboardFacade);
}
