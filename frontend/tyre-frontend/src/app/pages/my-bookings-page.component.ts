import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';

import { environment } from '../../environments/environment';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-my-bookings-page',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <h2>{{ 'bookings.title' | translate }}</h2>
    <div *ngIf="bookings.length === 0">{{ 'bookings.empty' | translate }}</div>
    <section class="booking-grid" *ngIf="bookings.length > 0">
      <article class="booking-card" *ngFor="let b of bookings">
        <img [src]="bookingImage(b)" alt="car" />
        <div class="meta">
          <h3>{{ bookingTitle(b) }}</h3>
          <p>{{ 'bookings.booking' | translate }} #{{ b.id }}</p>
          <p>{{ b.start_date }} - {{ b.end_date }}</p>
          <p>{{ b.booking_status }}</p>
          <p>{{ b.total_price }} ₸</p>
        </div>
      </article>
    </section>
  `,
  styles: [
    `
      .booking-grid {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      }
      .booking-card {
        background: #fff;
        border: 1px solid #d9dfeb;
        border-radius: 14px;
        overflow: hidden;
        box-shadow: 0 8px 20px rgba(16, 24, 40, 0.06);
      }
      .booking-card img {
        width: 100%;
        height: 180px;
        object-fit: cover;
        display: block;
      }
      .meta {
        padding: 12px;
      }
      .meta h3 {
        margin: 0 0 6px;
      }
      .meta p {
        margin: 0 0 4px;
        color: #4e5a6f;
      }
    `,
  ],
})
export class MyBookingsPageComponent implements OnInit {
  bookings: any[] = [];
  private carsById = new Map<number, any>();

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    forkJoin({
      bookings: this.api.getMyBookings(),
      cars: this.api.getCars(),
    }).subscribe(({ bookings, cars }) => {
      this.bookings = bookings;
      this.carsById.clear();
      for (const car of cars) this.carsById.set(Number(car.id), car);
    });
  }

  bookingImage(booking: any): string {
    const car = this.carsById.get(Number(booking.car_id));
    const first = (car?.images || '').split(',').filter(Boolean)[0];
    if (!first) return 'https://placehold.co/420x260';
    if (first.startsWith('http')) return first;
    return `${environment.apiUrl}${first}`;
  }

  bookingTitle(booking: any): string {
    const car = this.carsById.get(Number(booking.car_id));
    if (!car) return `${'Car'} #${booking.car_id}`;
    return `${car.brand} ${car.model}`;
  }
}
