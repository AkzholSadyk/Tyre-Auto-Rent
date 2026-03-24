import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
  imports: [CommonModule, TranslateModule],
  template: `
    <article *ngIf="car">
      <h2>{{ car.brand }} {{ car.model }}</h2>
      <div class="media-layout">
        <div class="main-image-wrap">
          <img class="main-image" [src]="toApiUrl(mainImage || images[0])" alt="car image" (click)="openImage(mainImage || images[0])" />
        </div>
        <div class="thumbs-col">
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

      <div class="quick-specs">
        <article class="spec-pill">
          <span class="spec-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 17h8a2 2 0 0 1 0 4H6a2 2 0 0 1 0-4zM12.5 2c1.8 0 2.8 1.2 2.8 3.2v6.2c0 1.8-1 3.1-2.7 3.6-1.5.5-3.3-.2-4.2-1.7-.8-1.3-.7-3 .2-4.2l2.2-2.8c.7-.9 1-2 .8-3.2C11.5 2.4 11.9 2 12.5 2z"/>
            </svg>
          </span>
          <b>{{ 'carDetails.seats' | translate }}</b><em>{{ specValue(car.seats) }}</em>
        </article>
        <article class="spec-pill">
          <span class="spec-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zm0 2.2A6.8 6.8 0 0 0 5.2 12h5.4l1-1.2h1l1 1.2h5.2A6.8 6.8 0 0 0 12 5.2zm-6.6 9a6.8 6.8 0 0 0 13.2 0h-4l-1.5 3.6c-.2.5-.8.5-1 0l-1.5-3.6z"/>
            </svg>
          </span>
          <b>{{ 'carDetails.transmission' | translate }}</b><em>{{ specValue(car.transmission) }}</em>
        </article>
        <article class="spec-pill">
          <span class="spec-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 10h16a1 1 0 0 1 0 2h-1v3.5a1.5 1.5 0 1 1-3 0V12H8v3.5a1.5 1.5 0 1 1-3 0V12H4a1 1 0 1 1 0-2zm6.5-2.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0z"/>
            </svg>
          </span>
          <b>{{ 'carDetails.drive' | translate }}</b><em>{{ specValue(car.drive) }}</em>
        </article>
        <article class="spec-pill">
          <span class="spec-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 3h6a1.3 1.3 0 0 1 1.3 1.3v13.4A2.3 2.3 0 0 1 12 20H8.3A2.3 2.3 0 0 1 6 17.7V4.3A1.3 1.3 0 0 1 7.3 3H7zm7.3 5H17a2 2 0 0 1 2 2v6.8a1.6 1.6 0 1 0 3.2 0V10l-2-2v8.6a.4.4 0 1 1-.8 0V10a2.8 2.8 0 0 0-2.8-2.8h-2.3z"/>
            </svg>
          </span>
          <b>{{ 'carDetails.fuel' | translate }}</b><em>{{ specValue(car.fuel_type) }}</em>
        </article>
        <article class="spec-pill">
          <span class="spec-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 2.8a1 1 0 0 1 1.2.5l.7 1.5a7.8 7.8 0 0 1 2.2 0l.7-1.5a1 1 0 0 1 1.2-.5l1.6.6a1 1 0 0 1 .6 1.3l-.6 1.5a8 8 0 0 1 1.6 1.6l1.5-.6a1 1 0 0 1 1.3.6l.6 1.6a1 1 0 0 1-.5 1.2l-1.5.7a7.8 7.8 0 0 1 0 2.2l1.5.7a1 1 0 0 1 .5 1.2l-.6 1.6a1 1 0 0 1-1.3.6l-1.5-.6a8 8 0 0 1-1.6 1.6l.6 1.5a1 1 0 0 1-.6 1.3l-1.6.6a1 1 0 0 1-1.2-.5l-.7-1.5a7.8 7.8 0 0 1-2.2 0l-.7 1.5a1 1 0 0 1-1.2.5l-1.6-.6a1 1 0 0 1-.6-1.3l.6-1.5a8 8 0 0 1-1.6-1.6l-1.5.6a1 1 0 0 1-1.3-.6l-.6-1.6a1 1 0 0 1 .5-1.2l1.5-.7a7.8 7.8 0 0 1 0-2.2l-1.5-.7a1 1 0 0 1-.5-1.2l.6-1.6a1 1 0 0 1 1.3-.6l1.5.6A8 8 0 0 1 7.4 6l-.6-1.5a1 1 0 0 1 .6-1.3l1.6-.6zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>
            </svg>
          </span>
          <b>{{ 'carDetails.engine' | translate }}</b><em>{{ specValue(car.engine) }}</em>
        </article>
        <article class="spec-pill">
          <span class="spec-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 4h14a1 1 0 0 1 1 1v3H4V5a1 1 0 0 1 1-1zm1 5h12v9a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9zm3 2h2v2H9v-2zm4 0h2v2h-2v-2zM8 2h2v2H8zm6 0h2v2h-2z"/>
            </svg>
          </span>
          <b>{{ 'carDetails.year' | translate }}</b><em>{{ specValue(car.year) }}</em>
        </article>
      </div>

      <p>{{ car.description }}</p>
      <a class="btn" [href]="whatsAppUrl" target="_blank" rel="noopener">{{ 'carDetails.bookViaWhatsapp' | translate }}</a>

      <section class="spec-table-wrap">
        <h3>{{ 'carDetails.carSpecsTitle' | translate }}</h3>
        <div class="spec-grid">
          <article><b>{{ 'carDetails.seats' | translate }}</b><span>{{ specValue(car.seats) }}</span></article>
          <article><b>{{ 'carDetails.horsepower' | translate }}</b><span>{{ specValue(car.horsepower) }}</span></article>
          <article><b>{{ 'carDetails.engine' | translate }}</b><span>{{ specValue(car.engine) }}</span></article>
          <article><b>{{ 'carDetails.type' | translate }}</b><span>{{ specValue(car.car_type) }}</span></article>
          <article><b>{{ 'carDetails.drive' | translate }}</b><span>{{ specValue(car.drive) }}</span></article>
          <article><b>{{ 'carDetails.acceleration' | translate }}</b><span>{{ specValue(car.acceleration) }}</span></article>
          <article><b>{{ 'carDetails.color' | translate }}</b><span>{{ specValue(car.color) }}</span></article>
          <article><b>{{ 'carDetails.interiorColor' | translate }}</b><span>{{ specValue(car.interior_color) }}</span></article>
          <article><b>{{ 'carDetails.maxSpeed' | translate }}</b><span>{{ specValue(car.max_speed) }}</span></article>
          <article><b>{{ 'carDetails.transmission' | translate }}</b><span>{{ specValue(car.transmission) }}</span></article>
          <article><b>{{ 'carDetails.consumption' | translate }}</b><span>{{ specValue(car.consumption) }}</span></article>
          <article><b>{{ 'carDetails.year' | translate }}</b><span>{{ specValue(car.year) }}</span></article>
        </div>
      </section>

      <section class="calendar-rules-row">
        <div>
          <h3>{{ 'carDetails.availabilityCalendar' | translate }}</h3>
          <div class="calendar-card">
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
                [class.blocked]="cell.state === 'blocked'"
                [class.out-range]="cell.state === 'out-of-range'"
                disabled
              >
                {{ cell.day }}
              </button>
            </div>
          </div>

          <p class="legend">
            <span class="dot available-dot"></span> {{ 'common.available' | translate }}
            <span class="dot booked-dot"></span> {{ 'common.booked' | translate }}
          </p>
        </div>

        <section class="warning-box">
          <h3>{{ 'carDetails.rulesTitle' | translate }}</h3>
          <ul>
            <li>{{ 'carDetails.ruleNoSmoking' | translate }}</li>
            <li>{{ 'carDetails.ruleNoAlcohol' | translate }}</li>
            <li>{{ 'carDetails.ruleNoDrift' | translate }}</li>
            <li>{{ 'carDetails.ruleNoPets' | translate }}</li>
          </ul>
        </section>
      </section>
    </article>

    <div class="image-viewer-backdrop" *ngIf="selectedImage" (click)="closeImage()">
      <div class="image-viewer-card" (click)="$event.stopPropagation()">
        <button class="viewer-close" type="button" (click)="closeImage()">×</button>
        <img [src]="toApiUrl(selectedImage)" alt="car full image" />
      </div>
    </div>
  `,
  styles: [
    `
      .media-layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 114px;
        gap: 12px;
        margin-bottom: 12px;
      }
      .main-image-wrap {
        background: #fff;
        border: 1px solid #dbe3ef;
        border-radius: 14px;
        overflow: hidden;
      }
      .main-image {
        width: 100%;
        border-radius: 0;
        height: 430px;
        object-fit: cover;
        cursor: zoom-in;
        display: block;
      }
      .thumbs-col {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .thumb-btn {
        border: 1px solid #dbe3ef;
        background: #fff;
        padding: 0;
        border-radius: 10px;
        overflow: hidden;
        cursor: pointer;
      }
      .thumb-btn.active {
        border-color: #1f4f87;
        box-shadow: 0 0 0 2px rgba(31, 79, 135, 0.2);
      }
      .thumb-btn img {
        width: 100%;
        height: 80px;
        object-fit: cover;
        display: block;
      }
      .quick-specs {
        margin: 10px 0 12px;
        display: flex;
        gap: 10px;
        flex-wrap: nowrap;
        overflow-x: auto;
        padding-bottom: 4px;
      }
      .spec-pill {
        display: grid;
        grid-template-columns: 36px 1fr;
        column-gap: 10px;
        row-gap: 4px;
        align-items: center;
        background: #ffffff;
        border: 1px solid #d6dfec;
        border-radius: 14px;
        padding: 12px 14px;
        min-width: 210px;
        flex: 0 0 210px;
      }
      .spec-icon {
        grid-row: 1 / 3;
        width: 30px;
        height: 30px;
        display: inline-grid;
        place-items: center;
        color: #1f4f87;
      }
      .spec-icon svg {
        width: 30px;
        height: 30px;
        fill: currentColor;
      }
      .spec-pill b {
        font-size: 12px;
        color: #61708b;
      }
      .spec-pill em {
        font-style: normal;
        font-weight: 700;
        color: #132033;
      }
      .btn {
        text-decoration: none !important;
      }
      .warning-box {
        margin: 0;
        background: #fff7e8;
        border: 1px solid #ffd89b;
        border-radius: 12px;
        padding: 12px;
      }
      .warning-box h3 {
        margin: 0 0 8px;
      }
      .warning-box ul {
        margin: 0;
        padding-left: 18px;
      }
      .spec-table-wrap {
        margin: 14px 0;
        background: #fff;
        border: 1px solid #dbe3ef;
        border-radius: 14px;
        padding: 12px;
      }
      .spec-table-wrap h3 {
        margin: 0 0 10px;
      }
      .spec-grid {
        display: grid;
        gap: 10px;
        grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
      }
      .spec-grid article {
        background: #f8fafc;
        border: 1px solid #e4ebf5;
        border-radius: 10px;
        padding: 8px 10px;
      }
      .spec-grid b {
        display: block;
        font-size: 12px;
        color: #627089;
        margin-bottom: 3px;
      }
      .spec-grid span {
        font-weight: 700;
      }
      .calendar-card {
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 16px;
        padding: 12px;
        max-width: 680px;
        box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
      }
      .calendar-rules-row {
        margin-top: 8px;
        display: grid;
        grid-template-columns: minmax(0, 1fr) 340px;
        gap: 12px;
        align-items: start;
      }
      .calendar-nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }
      .month-label {
        font-size: 28px;
        font-weight: 800;
      }
      .nav-btn {
        width: 44px;
        height: 44px;
        border: 1px solid #d0d3d8;
        border-radius: 12px;
        background: #fff;
        font-size: 28px;
        line-height: 1;
        cursor: pointer;
      }
      .nav-btn:disabled {
        opacity: 0.35;
        cursor: not-allowed;
      }
      .weekdays {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 8px;
        margin-bottom: 8px;
      }
      .weekdays span {
        text-align: center;
        color: #8b8f96;
        font-weight: 700;
        font-size: 14px;
      }
      .month-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 8px;
      }
      .day-cell {
        height: 42px;
        border-radius: 10px;
        border: 1px solid #e4e7ec;
        background: #f6f7f9;
        color: #111827;
        font-size: 18px;
      }
      .day-cell.other-month {
        opacity: 0.35;
      }
      .day-cell.available {
        background: #e8f8ed;
        border-color: #c0edce;
      }
      .day-cell.booked {
        background: #ffe3e3;
        border-color: #ffc5c5;
        color: #8b1e1e;
        text-decoration: line-through;
      }
      .day-cell.out-range {
        background: #f5f5f5;
        color: #b8bcc4;
      }
      .legend {
        margin-top: 10px;
        display: flex;
        gap: 14px;
        align-items: center;
        flex-wrap: wrap;
      }
      .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        display: inline-block;
        margin-right: 6px;
      }
      .available-dot { background: #7bc08f; }
      .booked-dot { background: #e05b5b; }
      .image-viewer-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(17, 22, 31, 0.4);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        z-index: 90;
        display: grid;
        place-items: center;
        padding: 20px;
      }
      .image-viewer-card {
        width: min(1000px, 94vw);
        max-height: 92vh;
        position: relative;
      }
      .image-viewer-card img {
        width: 100%;
        max-height: 92vh;
        height: auto;
        object-fit: contain;
        border-radius: 14px;
        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
        cursor: default;
      }
      .viewer-close {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 36px;
        height: 36px;
        border-radius: 999px;
        border: 0;
        background: rgba(255, 255, 255, 0.95);
        font-size: 24px;
        line-height: 1;
        cursor: pointer;
      }
      @media (max-width: 860px) {
        .media-layout {
          grid-template-columns: 1fr;
        }
        .main-image {
          height: 320px;
        }
        .thumbs-col {
          flex-direction: row;
          overflow-x: auto;
          padding-bottom: 2px;
        }
        .thumb-btn {
          min-width: 98px;
        }
        .calendar-rules-row {
          grid-template-columns: 1fr;
        }
        .warning-box {
          margin-top: 10px;
        }
      }
    `,
  ],
})
export class CarDetailsPageComponent implements OnInit {
  car: any;
  images: string[] = [];
  mainImage = '';
  whatsAppUrl = environment.whatsappBookingUrl;
  selectedImage = '';

  weekDays: string[] = [];
  calendarCells: CalendarCell[] = [];

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
    return this.currentMonthStart.toLocaleDateString(this.getLocale(), { month: 'long', year: 'numeric' });
  }

  get canGoPrev(): boolean {
    const minMonth = new Date(this.today.getFullYear(), this.today.getMonth(), 1);
    return this.currentMonthStart.getTime() > minMonth.getTime();
  }

  get canGoNext(): boolean {
    const maxMonth = new Date(this.maxDate.getFullYear(), this.maxDate.getMonth(), 1);
    return this.currentMonthStart.getTime() < maxMonth.getTime();
  }

  ngOnInit(): void {
    this.updateWeekDays();
    this.translate.onLangChange.subscribe(() => {
      this.updateWeekDays();
      this.buildCalendar();
    });

    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.api.getCar(id).subscribe((car) => {
      this.car = car;
      this.images = (car.images || '').split(',').filter(Boolean);
      this.mainImage = this.images[0] || '';
    });

    const from = this.toIso(this.today);
    const to = this.toIso(this.addDays(this.maxDate, 1));
    this.api.getCarAvailability(id, from, to).subscribe((res) => {
      const timeline = res.timeline || [];
      this.availabilityMap.clear();
      for (const day of timeline) {
        if (day.available) {
          this.availabilityMap.set(day.date, 'available');
        } else {
          this.availabilityMap.set(day.date, 'booked');
        }
      }
      this.buildCalendar();
    });
  }

  prevMonth(): void {
    if (!this.canGoPrev) return;
    this.currentMonthStart = new Date(this.currentMonthStart.getFullYear(), this.currentMonthStart.getMonth() - 1, 1);
    this.buildCalendar();
  }

  nextMonth(): void {
    if (!this.canGoNext) return;
    this.currentMonthStart = new Date(this.currentMonthStart.getFullYear(), this.currentMonthStart.getMonth() + 1, 1);
    this.buildCalendar();
  }

  buildCalendar(): void {
    const monthStart = new Date(this.currentMonthStart.getFullYear(), this.currentMonthStart.getMonth(), 1);
    const monthEnd = new Date(this.currentMonthStart.getFullYear(), this.currentMonthStart.getMonth() + 1, 0);

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
    if (!path) return 'https://placehold.co/420x260';
    if (path.startsWith('http')) return path;
    return `${environment.apiUrl}${path}`;
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

  openImage(path: string): void {
    this.selectedImage = path;
  }

  selectImage(path: string): void {
    this.mainImage = path;
  }

  specValue(value: unknown): string {
    if (value === null || value === undefined) return '-';
    const asText = String(value).trim();
    return asText.length ? asText : '-';
  }

  closeImage(): void {
    this.selectedImage = '';
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

  private getLocale(): string {
    const lang = this.translate.currentLang || this.translate.defaultLang || 'en';
    if (lang === 'ru') return 'ru-RU';
    if (lang === 'kk') return 'kk-KZ';
    if (lang === 'zh') return 'zh-CN';
    return 'en-US';
  }
}
