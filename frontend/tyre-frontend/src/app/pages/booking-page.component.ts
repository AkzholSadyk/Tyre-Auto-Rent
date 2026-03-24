import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-booking-page',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <h2>{{ 'booking.title' | translate }}</h2>
    <p>{{ 'booking.description' | translate }}</p>
    <a class="btn" [href]="whatsAppUrl" target="_blank" rel="noopener">{{ 'booking.continueWhatsapp' | translate }}</a>
  `,
})
export class BookingPageComponent {
  whatsAppUrl = environment.whatsappBookingUrl;
}
