import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-pickup-map-page',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <h2>{{ 'pickupMap.title' | translate }}</h2>
    <p>{{ 'pickupMap.description' | translate }}</p>
    <ul>
      <li *ngFor="let loc of locations">
        {{ loc.name }} ({{ loc.type }}) - {{ loc.latitude }}, {{ loc.longitude }} - {{ loc.delivery_price }}
      </li>
    </ul>
  `,
})
export class PickupMapPageComponent implements OnInit {
  locations: any[] = [];

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    this.api.getLocations().subscribe((locations) => (this.locations = locations));
  }
}
