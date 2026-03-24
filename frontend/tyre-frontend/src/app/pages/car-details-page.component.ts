import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';

import { environment } from '../../environments/environment';
import { ApiService } from '../services/api.service';

type DayState = 'available' | 'booked' | 'out-of-range';

interface CalendarCell {
  iso: string;
  day: number;
  inMonth: boolean;
  state: DayState;
}

@Component({
  selector: 'app-car-details-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterLink],
  template: `
    <div class="page-shell" *ngIf="car">
      

      <main class="container page-content">
        <section id="car-details" class="hero-section">
          <div class="hero-left">
            <h1 class="page-title">
              {{ specValue(car.brand) }} {{ specValue(car.model) }} {{ specValue(car.year) }}
            </h1>

            <div class="about-card">
              <div class="card-label">{{ 'carDetails.aboutCar' | translate }}</div>
              <p>{{ localizedDescription() }}</p>
            </div>
          </div>

          <div class="hero-gallery-card">
            <div class="main-image-wrap">
              <img
                class="main-image"
                [src]="toApiUrl(mainImage || images[0])"
                [alt]="specValue(car.brand) + ' ' + specValue(car.model)"
                (click)="openImage(mainImage || images[0])"
              />
            </div>

            <div class="thumbs-row" *ngIf="images.length > 1">
              <button
                class="thumb-btn"
                *ngFor="let image of images"
                type="button"
                [class.active]="image === (mainImage || images[0])"
                (click)="selectImage(image)"
              >
                <img [src]="toApiUrl(image)" alt="car thumbnail" />
              </button>
            </div>
          </div>
        </section>

        <section class="section-block">
          <h2 class="section-title">{{ 'carDetails.carSpecsTitle' | translate }}</h2>

          <div class="spec-cards-grid">
            <article class="spec-card">
              <span>{{ 'carDetails.seats' | translate }}</span>
              <strong>{{ specValue(car.seats) }}</strong>
            </article>

            <article class="spec-card">
              <span>{{ 'carDetails.horsepower' | translate }}</span>
              <strong>{{ specValue(car.horsepower) }}</strong>
            </article>

            <article class="spec-card">
              <span>{{ 'carDetails.engine' | translate }}</span>
              <strong>{{ specValue(car.engine) }}</strong>
            </article>

            <article class="spec-card">
              <span>{{ 'carDetails.acceleration' | translate }}</span>
              <strong>{{ specValue(car.acceleration) }}</strong>
            </article>

            <article class="spec-card">
              <span>{{ 'carDetails.type' | translate }}</span>
              <strong>{{ displayOptionValue('carType', car.car_type) }}</strong>
            </article>

            <article class="spec-card">
              <span>{{ 'carDetails.drive' | translate }}</span>
              <strong>{{ displayOptionValue('drive', car.drive) }}</strong>
            </article>

            <article class="spec-card">
              <span>{{ 'carDetails.color' | translate }}</span>
              <strong>{{ specValue(car.color) }}</strong>
            </article>

            <article class="spec-card">
              <span>{{ 'carDetails.interiorColor' | translate }}</span>
              <strong>{{ specValue(car.interior_color) }}</strong>
            </article>

            <article class="spec-card">
              <span>{{ 'carDetails.maxSpeed' | translate }}</span>
              <strong>{{ specValue(car.max_speed) }}</strong>
            </article>

            <article class="spec-card">
              <span>{{ 'carDetails.transmission' | translate }}</span>
              <strong>{{ displayOptionValue('transmission', car.transmission) }}</strong>
            </article>

            <article class="spec-card">
              <span>{{ 'carDetails.consumption' | translate }}</span>
              <strong>{{ specValue(car.consumption) }}</strong>
            </article>

            <article class="spec-card">
              <span>{{ 'carDetails.year' | translate }}</span>
              <strong>{{ specValue(car.year) }}</strong>
            </article>
          </div>
        </section>

        <section id="rental-conditions" class="section-block">
          <h2 class="section-title">{{ 'carDetails.rentalConditionsTitle' | translate }}</h2>

          <div class="conditions-card">
            <div class="conditions-brand">TYRE AUTO RENT</div>
            <ul class="conditions-list">
              <li>{{ 'carDetails.conditionPoint1' | translate }}</li>
              <li>{{ 'carDetails.conditionPoint2' | translate }}</li>
              <li>{{ 'carDetails.conditionPoint3' | translate }}</li>
              <li>{{ 'carDetails.conditionPoint4' | translate }}</li>
              <li>{{ 'carDetails.conditionPoint5' | translate }}</li>
              <li>{{ 'carDetails.conditionPoint6' | translate }}</li>
              <li>{{ 'carDetails.conditionPoint7' | translate }}</li>
              <li>{{ 'carDetails.conditionPoint8' | translate }}</li>
              <li>{{ 'carDetails.conditionPoint9' | translate }}</li>
              <li>{{ 'carDetails.conditionPoint10' | translate }}</li>
            </ul>
            <div class="conditions-booking">
              <p>{{ 'carDetails.bookingPhoneLabel' | translate }}</p>
              <strong>{{ 'carDetails.bookingPhoneValue' | translate }}</strong>
            </div>
          </div>
        </section>

        <section id="booking" class="section-block">
          <h2 class="section-title">{{ 'carDetails.bookingTitle' | translate }}</h2>

          <div class="booking-wrapper">
            <div class="calendar-panel">
              <div class="calendar-legend">
                <div class="legend-item">
                  <span class="legend-box available-box"></span>
                  <span>{{ 'common.available' | translate }}</span>
                </div>
                <div class="legend-item">
                  <span class="legend-box selected-box"></span>
                  <span>{{ 'carDetails.selectedDays' | translate }}</span>
                </div>
                <div class="legend-item">
                  <span class="legend-box booked-box"></span>
                  <span>{{ 'common.booked' | translate }}</span>
                </div>
              </div>

              <div class="calendar-nav">
                <button class="nav-btn" type="button" (click)="prevMonth()" [disabled]="!canGoPrev">‹</button>
                <div class="month-label">{{ monthLabel }}</div>
                <button class="nav-btn" type="button" (click)="nextMonth()" [disabled]="!canGoNext">›</button>
              </div>

              <div class="weekdays">
                <span *ngFor="let w of weekDays">{{ w }}</span>
              </div>

              <div class="month-grid">
                <button
                  *ngFor="let cell of calendarCells"
                  type="button"
                  class="day-cell"
                  [class.other-month]="!cell.inMonth"
                  [class.available]="cell.state === 'available'"
                  [class.booked]="cell.state === 'booked'"
                  [class.out-range]="cell.state === 'out-of-range'"
                  [class.selected]="isSelectedDay(cell.iso)"
                  [disabled]="!isSelectableDay(cell)"
                  (click)="selectDay(cell)"
                >
                  {{ cell.day }}
                </button>
              </div>
            </div>

            <aside class="booking-summary-card">
              <h3>{{ 'carDetails.bookingTitle' | translate }}</h3>

              <div class="summary-grid">
                <div class="summary-item">
                  <span>{{ 'carDetails.selectedDays' | translate }}</span>
                  <strong>{{ selectedDaysCount }}</strong>
                </div>

                <div class="summary-item">
                  <span>{{ 'carDetails.pricePerDay' | translate }}</span>
                  <strong>{{ pricePerDay }}</strong>
                </div>
              </div>

              <div class="summary-total">
                <span>{{ 'carDetails.totalPrice' | translate }}</span>
                <strong>{{ totalPrice }}</strong>
              </div>

              <a class="wa-btn" [href]="whatsAppLink" target="_blank" rel="noopener">
                {{ 'carDetails.bookViaWhatsapp' | translate }}
              </a>
            </aside>
          </div>
        </section>
      </main>

      <div class="image-viewer-backdrop" *ngIf="selectedImage" (click)="closeImage()">
        <div class="image-viewer-card" (click)="$event.stopPropagation()">
          <button class="viewer-close" type="button" (click)="closeImage()">×</button>
          <img [src]="toApiUrl(selectedImage)" alt="car full image" />
        </div>
      </div>
    </div>

    <div class="page-shell page-shell--loading" *ngIf="!car && !loadError">
      <div class="loading-block">
        <p>{{ 'common.loading' | translate }}</p>
      </div>
    </div>

    <div class="page-shell page-shell--error" *ngIf="loadError">
      <div class="error-block">
        <p>{{ loadError }}</p>
        <a routerLink="/cars" class="btn">{{ 'nav.cars' | translate }}</a>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100dvh;
        color: #ffffff;
        /* keep a subtle green tint on the left, remove the dark right gradient */
        background:
          radial-gradient(circle at left center, rgba(16, 185, 129, 0.14), transparent 40%),
          #09090b;
        font-family: Inter, Arial, sans-serif;
        /* prevent page horizontal overflow on mobile devices */
        overflow-x: hidden;
        /* respect iOS safe area insets */
        padding-left: env(safe-area-inset-left);
        padding-right: env(safe-area-inset-right);
      }

      * {
        box-sizing: border-box;
      }

      .page-shell {
        min-height: 100dvh;
      }

      .loading-block,
      .error-block {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 40vh;
        padding: 2rem;
        text-align: center;
      }
      .loading-block p,
      .error-block p {
        margin: 0 0 1rem;
        color: var(--text, #f5f5f5);
      }
      .error-block .btn {
        margin-top: 0.5rem;
      }

      .container {
        width: min(1120px, 92vw);
        margin: 0 auto;
        padding: 0 4px;
        box-sizing: border-box;
        max-width: 100vw;
      }

      .page-header {
        position: sticky;
        top: 0;
        z-index: 40;
        backdrop-filter: blur(10px);
        background: rgba(32, 32, 36, 0.92);
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      }

      .header-inner {
        min-height: 72px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
      }

      .brand,
      .footer-brand {
        font-family: Montserrat, Arial, sans-serif;
        font-weight: 800;
        letter-spacing: 0.02em;
      }

      .brand {
        font-size: 28px;
        white-space: nowrap;
      }

      .footer-link,
      .menu-btn {
        background: transparent;
        border: 0;
        color: #ffffff;
        cursor: pointer;
      }

      .footer-link {
        font-size: 16px;
        transition: color 0.2s ease;
      }

      .footer-link:hover {
        color: #20d6a0;
      }

      .menu-wrap {
        position: relative;
      }

      .menu-btn {
        width: 42px;
        height: 42px;
        display: inline-flex;
        flex-direction: column;
        justify-content: center;
        gap: 5px;
        border-radius: 12px;
      }

      .menu-btn span {
        width: 20px;
        height: 2px;
        background: #ffffff;
        display: block;
        margin: 0 auto;
        border-radius: 999px;
      }

      .menu-dropdown {
        position: absolute;
        right: 0;
        top: calc(100% + 10px);
        min-width: 190px;
        display: grid;
        gap: 6px;
        padding: 10px;
        border-radius: 18px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: rgba(20, 20, 24, 0.97);
        box-shadow: 0 18px 36px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(14px);
        z-index: 30;
      }

      .menu-dropdown a {
        display: block;
        padding: 12px 14px;
        border-radius: 12px;
        color: #ffffff;
        text-decoration: none;
        transition: background-color 0.18s ease;
      }

      .menu-dropdown a:hover {
        background: rgba(32, 214, 160, 0.12);
      }

      .page-content {
        padding-top: 26px;
        padding-bottom: 48px;
      }

      .hero-section {
        display: grid;
        grid-template-columns: 360px minmax(0, 1fr);
        gap: 24px;
        align-items: start;
      }

      .hero-left {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .page-title,
      .section-title {
        margin: 0;
        font-family: Unbounded, Arial, sans-serif;
        line-height: 1.02;
        letter-spacing: -0.03em;
      }

      .page-title {
        font-size: clamp(32px, 4vw, 52px);
      }

      .section-block {
        margin-top: 56px;
      }

      .section-title {
        margin-bottom: 24px;
        font-size: clamp(30px, 5vw, 60px);
        font-weight: 600;
      }

      .about-card,
      .hero-gallery-card,
      .spec-card,
      .conditions-card,
      .calendar-panel,
      .booking-summary-card,
      .site-footer {
        background: linear-gradient(145deg, rgba(24, 24, 27, 0.98) 0%, rgba(9, 9, 11, 0.98) 100%);
        border: 1px solid #27272a;
        box-shadow: 0 14px 30px rgba(0, 0, 0, 0.28);
      }

      .about-card {
        border-radius: 30px;
        padding: 24px;
        min-height: 220px;
      }

      .card-label {
        font-family: Unbounded, Arial, sans-serif;
        font-size: 18px;
        margin-bottom: 14px;
        color: #ffffff;
      }

      .about-card p {
        margin: 0;
        color: #9f9fa9;
        line-height: 1.7;
        font-size: 15px;
      }

      .hero-gallery-card {
        border-radius: 34px;
        padding: 14px;
      }

      .main-image-wrap {
        border-radius: 28px;
        overflow: hidden;
      }

      .main-image {
        display: block;
        width: 100%;
        height: 420px;
        object-fit: cover;
        cursor: zoom-in;
      }

      .thumbs-row {
        margin-top: 12px;
        display: flex;
        gap: 10px;
        overflow-x: auto;
        padding-bottom: 2px;
        /* add horizontal padding so thumbnails don't hit viewport edges on mobile */
        padding-inline: 6px;
      }

      .thumb-btn {
        flex: 0 0 auto;
        width: 90px;
        height: 68px;
        border: 1px solid #27272a;
        border-radius: 14px;
        overflow: hidden;
        background: #111111;
        padding: 0;
      }

      .thumb-btn.active {
        border-color: #20d6a0;
        box-shadow: 0 0 0 2px rgba(32, 214, 160, 0.16);
      }

      .thumb-btn img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .spec-cards-grid {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: 16px;
      }

      .spec-card {
        border-radius: 18px;
        padding: 18px 16px;
        min-height: 108px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .spec-card span {
        font-family: Unbounded, Arial, sans-serif;
        font-size: 12px;
        line-height: 1.3;
        color: #71717b;
        text-transform: uppercase;
      }

      .spec-card strong {
        font-family: Unbounded, Arial, sans-serif;
        font-size: 24px;
        color: #ffffff;
        line-height: 1.12;
        word-break: break-word;
      }

      .conditions-card {
        border-radius: 30px;
        padding: 28px;
        display: grid;
        gap: 20px;
      }

      .conditions-brand {
        font-family: Unbounded, Arial, sans-serif;
        font-size: 20px;
        letter-spacing: 0.08em;
        color: #ffffff;
      }

      .conditions-list {
        margin: 0;
        padding: 0;
        list-style: none;
        display: grid;
        gap: 10px;
      }

      .conditions-list li {
        position: relative;
        padding-left: 22px;
        color: #e4e4e7;
        line-height: 1.6;
        font-size: 16px;
      }

      .conditions-list li::before {
        content: '–';
        position: absolute;
        left: 0;
        top: 0;
        color: #10b981;
        font-weight: 700;
      }

      .conditions-booking {
        padding-top: 8px;
        border-top: 1px solid #27272a;
      }

      .conditions-booking p {
        margin: 0 0 10px;
        color: #a1a1aa;
        font-family: Unbounded, Arial, sans-serif;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }

      .conditions-booking strong {
        display: block;
        font-family: Unbounded, Arial, sans-serif;
        font-size: clamp(24px, 4vw, 34px);
        margin: 0;
        color: #ffffff;
      }

      .booking-wrapper {
        border-radius: 30px;
        padding: 18px;
        background: linear-gradient(150deg, rgba(24, 24, 27, 0.98) 0%, rgba(9, 9, 11, 0.98) 100%);
        border: 1px solid #27272a;
        display: grid;
        grid-template-columns: minmax(0, 1fr) 360px;
        gap: 18px;
      }

      .calendar-panel {
        border-radius: 20px;
        padding: 22px;
      }

      .calendar-legend {
        display: flex;
        gap: 24px;
        align-items: center;
        flex-wrap: wrap;
        padding-bottom: 18px;
        margin-bottom: 18px;
        border-bottom: 1px solid #27272a;
      }

      .legend-item {
        display: flex;
        align-items: center;
        gap: 10px;
        font-family: Unbounded, Arial, sans-serif;
        font-size: 12px;
        text-transform: uppercase;
        color: #71717b;
      }

      .legend-box {
        width: 18px;
        height: 18px;
        border-radius: 6px;
        border: 1px solid #27272a;
      }

      .available-box {
        background: #10b981;
      }

      .booked-box {
        background: #8d1508;
      }

      .selected-box {
        background: #4b5563;
      }

      .calendar-nav {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 14px;
        margin-bottom: 20px;
      }

      .month-label {
        min-width: 180px;
        text-align: center;
        font-family: Unbounded, Arial, sans-serif;
        font-size: 22px;
        color: #ffffff;
        text-transform: capitalize;
      }

      .nav-btn {
        width: 38px;
        height: 38px;
        border-radius: 10px;
        border: 1px solid #27272a;
        background: rgba(39, 39, 42, 0.5);
        color: #ffffff;
        font-size: 22px;
        line-height: 1;
        cursor: pointer;
      }

      .nav-btn:disabled {
        opacity: 0.35;
        cursor: not-allowed;
      }

      .weekdays,
      .month-grid {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        gap: 10px;
      }

      .weekdays {
        margin-bottom: 12px;
      }

      .weekdays span {
        text-align: center;
        font-family: Unbounded, Arial, sans-serif;
        font-size: 12px;
        color: #71717b;
        text-transform: uppercase;
      }

      .day-cell {
        height: 72px;
        border: 1px solid #27272a;
        border-radius: 12px;
        background: #18181b;
        color: #ffffff;
        font-size: 16px;
        font-weight: 600;
      }

      .day-cell.available {
        background: #10b981;
        color: #ffffff;
      }

      .day-cell.booked {
        background: #b42318;
        color: #ffffff;
      }

      .day-cell.selected {
        background: #4b5563;
        color: #ffffff;
        border-color: #6b7280;
      }

      .day-cell.other-month,
      .day-cell.out-range {
        opacity: 0.32;
      }

      .day-cell:not(:disabled) {
        cursor: pointer;
      }

      .day-cell:not(:disabled):hover {
        transform: translateY(-1px);
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.22);
      }

      .booking-summary-card {
        border-radius: 20px;
        padding: 24px;
        height: 100%;
      }

      .booking-summary-card h3 {
        margin: 0 0 24px;
        font-family: Unbounded, Arial, sans-serif;
        font-size: 30px;
        color: #ffffff;
      }

      .summary-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 18px;
        padding-bottom: 20px;
        border-bottom: 1px solid #27272a;
      }

      .summary-item span,
      .summary-total span {
        display: block;
        margin-bottom: 8px;
        font-family: Unbounded, Arial, sans-serif;
        font-size: 12px;
        color: #71717b;
        text-transform: uppercase;
      }

      .summary-item strong,
      .summary-total strong {
        font-family: Unbounded, Arial, sans-serif;
        line-height: 1;
      }

      .summary-item strong {
        font-size: 32px;
        color: #ffffff;
      }

      .summary-total {
        padding: 20px 0 24px;
      }

      .summary-total strong {
        font-size: 44px;
        color: #10b981;
      }

      .wa-btn {
        width: 100%;
        min-height: 56px;
        border-radius: 14px;
        background: #10b981;
        color: #ffffff;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        font-family: Unbounded, Arial, sans-serif;
        font-size: 18px;
        transition: background 0.2s ease;
      }

      .wa-btn:hover {
        background: #0c9d6d;
      }

      .image-viewer-backdrop {
        position: fixed;
        inset: 0;
        z-index: 100;
        display: grid;
        place-items: center;
        padding: 24px;
        background: rgba(5, 8, 12, 0.8);
        backdrop-filter: blur(8px);
      }

      .image-viewer-card {
        width: min(1100px, 94vw);
        max-height: 92vh;
        position: relative;
      }

      .image-viewer-card img {
        width: 100%;
        max-height: 92vh;
        object-fit: contain;
        border-radius: 20px;
        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
      }

      .viewer-close {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 40px;
        height: 40px;
        border-radius: 999px;
        border: 0;
        background: rgba(255, 255, 255, 0.96);
        color: #111111;
        font-size: 24px;
        cursor: pointer;
      }

      @media (max-width: 1200px) {
        .spec-cards-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        .booking-wrapper {
          grid-template-columns: minmax(0, 1fr) 320px;
        }
      }

      @media (max-width: 992px) {
        .hero-section {
          grid-template-columns: 1fr;
        }

        .spec-cards-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .conditions-card {
          grid-template-columns: 1fr;
        }

        .booking-wrapper {
          grid-template-columns: 1fr;
        }

      }

      @media (max-width: 768px) {
        .container {
          width: min(100%, calc(100% - 24px));
        }

        .page-content {
          padding-top: 18px;
          padding-bottom: 32px;
        }

        .brand {
          font-size: 20px;
        }

        .page-title {
          font-size: 34px;
        }

        .section-title {
          margin-bottom: 18px;
          font-size: 32px;
        }

        .hero-gallery-card,
        .about-card,
        .conditions-card,
        .calendar-panel,
        .booking-summary-card {
          border-radius: 20px;
        }

        .main-image {
          height: 260px;
        }

        .thumb-btn {
          width: 72px;
          height: 58px;
        }

        .spec-cards-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .spec-card {
          min-height: 96px;
          padding: 14px;
        }

        .spec-card strong {
          font-size: 18px;
        }

        .booking-wrapper {
          padding: 12px;
        }

        .calendar-panel {
          padding: 16px;
        }

        .calendar-legend {
          gap: 14px;
        }

        .month-label {
          min-width: auto;
          font-size: 18px;
        }

        .weekdays,
        .month-grid {
          gap: 6px;
        }

        .day-cell {
          height: 48px;
          font-size: 13px;
        }

        .summary-grid {
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .summary-item strong {
          font-size: 24px;
        }

        .summary-total strong {
          font-size: 34px;
        }

        .wa-btn {
          min-height: 52px;
          font-size: 15px;
        }

      }

      @media (max-width: 480px) {
        .page-title {
          font-size: 28px;
        }

        .section-title {
          font-size: 26px;
        }

        .about-card {
          padding: 18px;
        }

        .spec-cards-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .spec-card span {
          font-size: 10px;
        }

        .spec-card strong {
          font-size: 16px;
        }

        .calendar-nav {
          gap: 8px;
        }

        .nav-btn {
          width: 34px;
          height: 34px;
          font-size: 18px;
        }

        .month-label {
          font-size: 16px;
        }

        .booking-summary-card h3 {
          font-size: 24px;
        }

        .summary-item strong {
          font-size: 20px;
        }

        .summary-total strong {
          font-size: 28px;
        }
      }

      /* Mobile tweaks (<=768px) to ensure content fits inside viewport while keeping desktop unchanged */
      @media (max-width: 768px) {
        .container {
          width: 100%;
          max-width: 100%;
          padding-left: 16px;
          padding-right: 16px;
        }

        /* Ensure long titles wrap */
        .page-title {
          word-break: break-word;
          overflow-wrap: break-word;
          font-size: 26px;
        }

        .hero-section {
          grid-template-columns: 1fr;
          gap: 12px;
        }

        .hero-left {
          order: 2;
        }

        .hero-gallery-card {
          order: 1;
          padding: 8px;
        }

        .about-card {
          padding: 12px;
          border-radius: 16px;
        }

        .main-image-wrap {
          width: 100%;
        }

        .main-image {
          width: 100%;
          height: auto;
          max-height: 50vh;
          object-fit: cover;
          border-radius: 14px;
        }

        .thumbs-row {
          padding-inline: 12px;
          gap: 8px;
        }

        .thumb-btn {
          width: 64px;
          height: 48px;
        }

        .section-title {
          font-size: 22px;
        }
      }
    `,
  ],
})
export class CarDetailsPageComponent implements OnInit, OnDestroy {
  car: any;
  loadError = '';
  menuOpen = false;
  images: string[] = [];
  mainImage = '';
  selectedImage = '';
  selectedStartIso = '';
  selectedEndIso = '';

  weekDays: string[] = [];
  calendarCells: CalendarCell[] = [];

  whatsAppUrl = environment.whatsappBookingUrl;

  private readonly destroy$ = new Subject<void>();
  private availabilityMap = new Map<string, DayState>();
  private readonly today = this.startOfDay(new Date());
  private readonly maxDate = this.addDays(this.today, 61);
  private currentMonthStart = new Date(this.today.getFullYear(), this.today.getMonth(), 1);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly api: ApiService,
    private readonly translate: TranslateService
  ) {}

  get monthLabel(): string {
    return this.currentMonthStart.toLocaleDateString(this.getLocale(), {
      month: 'long',
      year: 'numeric',
    });
  }

  get canGoPrev(): boolean {
    const minMonth = new Date(this.today.getFullYear(), this.today.getMonth(), 1);
    return this.currentMonthStart.getTime() > minMonth.getTime();
  }

  get canGoNext(): boolean {
    const maxMonth = new Date(this.maxDate.getFullYear(), this.maxDate.getMonth(), 1);
    return this.currentMonthStart.getTime() < maxMonth.getTime();
  }

  get pricePerDay(): string {
    return this.formatPrice(this.car?.price_per_day ?? this.car?.price);
  }

  get totalPrice(): string {
    const perDay = Number(this.car?.price_per_day ?? this.car?.price ?? 0);
    return this.formatPrice(perDay * this.selectedDaysCount);
  }

  get selectedDaysCount(): number {
    if (!this.selectedStartIso) return 0;
    if (!this.selectedEndIso) return 1;
    const start = new Date(this.selectedStartIso);
    const end = new Date(this.selectedEndIso);
    const diff = Math.round((end.getTime() - start.getTime()) / 86400000);
    return diff + 1;
  }

  get whatsAppLink(): string {
    const carName = `${this.specValue(this.car?.brand)} ${this.specValue(this.car?.model)} ${this.specValue(this.car?.year)}`.trim();

    // Format dates (use ru-RU as requested). If end is not set, show start for both.
    const startDate = this.selectedStartIso ? new Date(this.selectedStartIso).toLocaleDateString('ru-RU') : 'не указана';
    const endDate = this.selectedEndIso ? new Date(this.selectedEndIso).toLocaleDateString('ru-RU') : (this.selectedStartIso ? new Date(this.selectedStartIso).toLocaleDateString('ru-RU') : 'не указана');

    const days = this.selectedDaysCount || 0;
    const price = this.totalPrice || '-';

    const text = `Здравствуйте! Хочу забронировать ${carName}.\n\nДаты: ${startDate} – ${endDate}\nКоличество дней: ${days}\nЦена: ${price}`;

    const base = this.whatsAppUrl?.trim();

    const encoded = encodeURIComponent(text);

    if (!base) {
      return `https://wa.me/?text=${encoded}`;
    }

    if (base.includes('?')) {
      return `${base}&text=${encoded}`;
    }

    return `${base}?text=${encoded}`;
  }

  ngOnInit(): void {
    this.updateWeekDays();

    this.translate.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateWeekDays();
        this.buildCalendar();
      });

    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.api.getCar(id).subscribe({
      next: (car) => {
        this.loadError = '';
        this.car = car;
        this.images = (car?.images || '')
          .split(',')
          .map((item: string) => item.trim())
          .filter(Boolean);
        this.mainImage = this.images[0] || '';
      },
      error: (err) => {
        this.loadError = err?.error?.detail || this.translate.instant('carDetails.loadError') || 'Car not found';
      },
    });

    const from = this.toIso(this.today);
    const to = this.toIso(this.addDays(this.maxDate, 1));

    this.api.getCarAvailability(id, from, to).subscribe((res) => {
      const timeline = res.timeline || [];
      this.availabilityMap.clear();

      for (const day of timeline) {
        this.availabilityMap.set(day.date, day.available ? 'available' : 'booked');
      }

      this.buildCalendar();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  prevMonth(): void {
    if (!this.canGoPrev) return;
    this.currentMonthStart = new Date(
      this.currentMonthStart.getFullYear(),
      this.currentMonthStart.getMonth() - 1,
      1
    );
    this.buildCalendar();
  }

  nextMonth(): void {
    if (!this.canGoNext) return;
    this.currentMonthStart = new Date(
      this.currentMonthStart.getFullYear(),
      this.currentMonthStart.getMonth() + 1,
      1
    );
    this.buildCalendar();
  }

  buildCalendar(): void {
    const monthStart = new Date(
      this.currentMonthStart.getFullYear(),
      this.currentMonthStart.getMonth(),
      1
    );

    const monthEnd = new Date(
      this.currentMonthStart.getFullYear(),
      this.currentMonthStart.getMonth() + 1,
      0
    );

    const gridStart = this.addDays(monthStart, -monthStart.getDay());
    const gridEnd = this.addDays(monthEnd, 6 - monthEnd.getDay());

    const cells: CalendarCell[] = [];
    let cursor = this.startOfDay(gridStart);

    while (cursor <= gridEnd) {
      const iso = this.toIso(cursor);
      const inMonth = cursor.getMonth() === monthStart.getMonth();
      const outOfRange = cursor < this.today || cursor > this.maxDate;
      const state: DayState = outOfRange ? 'out-of-range' : this.availabilityMap.get(iso) || 'available';

      cells.push({
        iso,
        day: cursor.getDate(),
        inMonth,
        state,
      });

      cursor = this.addDays(cursor, 1);
    }

    this.calendarCells = cells;
  }

  toApiUrl(path: string): string {
    if (!path) return 'https://placehold.co/1200x800';
    if (path.startsWith('http')) return path;
    return `${environment.apiUrl}${path}`;
  }

  openImage(path: string): void {
    this.selectedImage = path;
  }

  closeImage(): void {
    this.selectedImage = '';
  }

  selectImage(path: string): void {
    this.mainImage = path;
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  isSelectableDay(cell: CalendarCell): boolean {
    return cell.state === 'available';
  }

  isSelectedDay(iso: string): boolean {
    if (!this.selectedStartIso) return false;
    if (!this.selectedEndIso) return iso === this.selectedStartIso;
    return iso >= this.selectedStartIso && iso <= this.selectedEndIso;
  }

  selectDay(cell: CalendarCell): void {
    if (!this.isSelectableDay(cell)) return;

    // No start selected -> set start
    if (!this.selectedStartIso) {
      this.selectedStartIso = cell.iso;
      this.selectedEndIso = '';
      return;
    }

    // Start selected, no end -> try to set end or adjust start
    if (this.selectedStartIso && !this.selectedEndIso) {
      if (cell.iso < this.selectedStartIso) {
        // choose an earlier start
        this.selectedStartIso = cell.iso;
        return;
      }

      // if the full range is available, set end
      if (this.isRangeAvailable(this.selectedStartIso, cell.iso)) {
        this.selectedEndIso = cell.iso;
        return;
      }

      // otherwise start from this cell
      this.selectedStartIso = cell.iso;
      this.selectedEndIso = '';
      return;
    }

    // Both start and end are selected -> allow extending/shrinking the end
    if (this.selectedStartIso && this.selectedEndIso) {
      // if clicked before start -> reset start
      if (cell.iso < this.selectedStartIso) {
        this.selectedStartIso = cell.iso;
        this.selectedEndIso = '';
        return;
      }

      // if clicked after or equal start, try to set/extend end
      if (cell.iso >= this.selectedStartIso) {
        if (this.isRangeAvailable(this.selectedStartIso, cell.iso)) {
          this.selectedEndIso = cell.iso;
          return;
        }

        // otherwise make clicked day the new start
        this.selectedStartIso = cell.iso;
        this.selectedEndIso = '';
        return;
      }
    }
  }

  specValue(value: unknown): string {
    if (value === null || value === undefined) return '-';
    const asText = String(value).trim();
    return asText.length ? asText : '-';
  }

  localizedDescription(): string {
    if (!this.car) return '-';
    const lang = this.translate.currentLang || this.translate.defaultLang || 'en';
    // prefer per-language fields, fallback to legacy description or other languages
    const order = [
      `description_${lang}`,
      'description_en',
      'description_ru',
      'description_kk',
      'description_zh',
      'description',
    ];

    for (const key of order) {
      const val = (this.car as any)[key];
      if (val && String(val).trim().length) return String(val).trim();
    }

    return '-';
  }

  displayOptionValue(kind: 'carType' | 'drive' | 'transmission', value: unknown): string {
    const raw = String(value ?? '').trim();
    if (!raw) return '-';
    const key = `optionValues.${kind}.${this.toOptionKey(raw)}`;
    const translated = this.translate.instant(key);
    return translated !== key ? translated : raw;
  }

  private toOptionKey(value: string): string {
    return value
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  private formatPrice(value: unknown): string {
    const raw = this.specValue(value);
    if (raw === '-') return raw;

    const normalized = Number(String(value).toString().replace(/[^\d.-]/g, ''));
    if (Number.isNaN(normalized)) return raw;

    return `${normalized.toLocaleString('ru-RU')} ₸`;
  }

  private updateWeekDays(): void {
    this.weekDays = [
      this.translate.instant('calendar.su'),
      this.translate.instant('calendar.mo'),
      this.translate.instant('calendar.tu'),
      this.translate.instant('calendar.we'),
      this.translate.instant('calendar.th'),
      this.translate.instant('calendar.fr'),
      this.translate.instant('calendar.sa'),
    ];
  }

  private toIso(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = `${date.getMonth() + 1}`.padStart(2, '0');
    const dd = `${date.getDate()}`.padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private addDays(date: Date, days: number): Date {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + days);
    return this.startOfDay(copy);
  }

  private isRangeAvailable(startIso: string, endIso: string): boolean {
    let cursor = new Date(startIso);
    const end = new Date(endIso);

    while (cursor <= end) {
      const iso = this.toIso(cursor);
      if ((this.availabilityMap.get(iso) || 'available') !== 'available') {
        return false;
      }
      cursor = this.addDays(cursor, 1);
    }

    return true;
  }

  private getLocale(): string {
    const lang = this.translate.currentLang || this.translate.defaultLang || 'en';
    if (lang === 'ru') return 'ru-RU';
    if (lang === 'kk') return 'kk-KZ';
    if (lang === 'zh') return 'zh-CN';
    return 'en-US';
  }
}
