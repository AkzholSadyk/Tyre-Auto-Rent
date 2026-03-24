import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-user-dashboard-page',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <h2>{{ 'dashboard.title' | translate }}</h2>
    <p>{{ 'dashboard.description' | translate }}</p>
  `,
})
export class UserDashboardPageComponent {}
