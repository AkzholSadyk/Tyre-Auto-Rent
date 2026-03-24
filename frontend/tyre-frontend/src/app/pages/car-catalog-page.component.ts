import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { environment } from '../../environments/environment';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-car-catalog-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  template: `
    <section class="catalog-shell">
      <div class="topbar">
        <div class="search-wrap">
          <input
            [(ngModel)]="brandSearch"
            (ngModelChange)="applyFilters()"
            [placeholder]="'catalog.searchByBrand' | translate"
            name="brandSearch"
          />
        </div>
        <button class="filter-trigger" type="button" (click)="showFilters = true" [attr.aria-label]="'catalog.openFilters' | translate">
          <span class="filter-icon">
            <i class="line l1"></i><i class="line l2"></i><i class="line l3"></i>
            <i class="dot d1"></i><i class="dot d2"></i><i class="dot d3"></i>
          </span>
        </button>
      </div>

      <section class="results">
        <p class="results-count">{{ 'catalog.carsFound' | translate: { count: cars.length } }}</p>
        <div class="cards">
          <a class="car-card-link" *ngFor="let car of cars" [routerLink]="['/car', car.id]">
            <article>
              <img [src]="toApiUrl(car.images?.split(',')[0])" alt="car" />
              <h3>{{ car.brand }} {{ car.model }}</h3>
              <p>{{ car.price_per_day }} ₸ / {{ 'common.day' | translate }}</p>
            </article>
          </a>
        </div>
      </section>
    </section>

    <div class="overlay" *ngIf="showFilters" (click)="showFilters = false"></div>
    <section class="filters-modal" *ngIf="showFilters">
      <div class="panel-head">
        <button class="close-btn" type="button" (click)="showFilters = false">✕</button>
        <h3>{{ 'catalog.allFilters' | translate }}</h3>
        <button class="reset-btn" type="button" (click)="resetFilters()">{{ 'common.reset' | translate }}</button>
      </div>
      <ng-container *ngTemplateOutlet="filterContent"></ng-container>
      <div class="modal-footer">
        <button class="btn" type="button" (click)="showFilters = false">
          {{ 'catalog.viewResults' | translate: { count: cars.length } }}
        </button>
      </div>
    </section>

    <ng-template #filterContent>
      <label class="filter-label">{{ 'catalog.sortBy' | translate }}</label>
      <select class="field-control" [(ngModel)]="filters.sort" (ngModelChange)="applyFilters()" name="sort">
        <option value="relevance">{{ 'catalog.sortRelevance' | translate }}</option>
        <option value="price_asc">{{ 'catalog.sortPriceAsc' | translate }}</option>
        <option value="price_desc">{{ 'catalog.sortPriceDesc' | translate }}</option>
        <option value="year_desc">{{ 'catalog.sortYearDesc' | translate }}</option>
        <option value="horsepower_desc">{{ 'catalog.sortHorsepowerDesc' | translate }}</option>
      </select>

      <label class="filter-label">{{ 'catalog.priceRange' | translate }}</label>
      <div class="range-row">
        <input class="field-control" type="number" [(ngModel)]="filters.minPrice" (ngModelChange)="applyFilters()" name="minPrice" [placeholder]="'common.min' | translate" />
        <input class="field-control" type="number" [(ngModel)]="filters.maxPrice" (ngModelChange)="applyFilters()" name="maxPrice" [placeholder]="'common.max' | translate" />
      </div>

      <label class="filter-label">{{ 'catalog.allYears' | translate }}</label>
      <div class="range-row">
        <input class="field-control" type="number" [(ngModel)]="filters.minYear" (ngModelChange)="applyFilters()" name="minYear" [placeholder]="'common.from' | translate" />
        <input class="field-control" type="number" [(ngModel)]="filters.maxYear" (ngModelChange)="applyFilters()" name="maxYear" [placeholder]="'common.to' | translate" />
      </div>

      <label class="filter-label">{{ 'catalog.numberOfSeats' | translate }}</label>
      <select class="field-control" [(ngModel)]="filters.seats" (ngModelChange)="applyFilters()" name="seats">
        <option value="">{{ 'common.select' | translate }}</option>
        <option *ngFor="let s of seatOptions" [value]="s">{{ s }}</option>
      </select>

      <label class="filter-label">{{ 'catalog.fuelType' | translate }}</label>
      <div class="chips">
        <button
          type="button"
          class="chip"
          *ngFor="let fuel of fuelOptions"
          [class.active]="filters.fuel === fuel"
          (click)="toggleFuel(fuel)"
        >
          {{ translateOptionValue('fuel', fuel) }}
        </button>
      </div>

      <label class="filter-label">{{ 'catalog.transmission' | translate }}</label>
      <select class="field-control" [(ngModel)]="filters.transmission" (ngModelChange)="applyFilters()" name="transmission">
        <option value="">{{ 'common.select' | translate }}</option>
        <option *ngFor="let t of transmissionOptions" [value]="t">{{ translateOptionValue('transmission', t) }}</option>
      </select>

      <label class="filter-label">{{ 'catalog.vehicleType' | translate }}</label>
      <select class="field-control" [(ngModel)]="filters.car_type" (ngModelChange)="applyFilters()" name="car_type">
        <option value="">{{ 'common.select' | translate }}</option>
        <option *ngFor="let type of carTypeOptions" [value]="type">{{ translateOptionValue('carType', type) }}</option>
      </select>

      <label class="filter-label">{{ 'catalog.drive' | translate }}</label>
      <select class="field-control" [(ngModel)]="filters.drive" (ngModelChange)="applyFilters()" name="drive">
        <option value="">{{ 'common.select' | translate }}</option>
        <option *ngFor="let drive of driveOptions" [value]="drive">{{ translateOptionValue('drive', drive) }}</option>
      </select>

      <label class="filter-label">{{ 'catalog.engine' | translate }}</label>
      <select class="field-control" [(ngModel)]="filters.engine" (ngModelChange)="applyFilters()" name="engine">
        <option value="">{{ 'common.select' | translate }}</option>
        <option *ngFor="let engine of engineOptions" [value]="engine">{{ engine }}</option>
      </select>

      <label class="filter-label">{{ 'catalog.horsepower' | translate }}</label>
      <div class="range-row">
        <input class="field-control" type="number" [(ngModel)]="filters.minHorsepower" (ngModelChange)="applyFilters()" name="minHorsepower" [placeholder]="'common.min' | translate" />
        <input class="field-control" type="number" [(ngModel)]="filters.maxHorsepower" (ngModelChange)="applyFilters()" name="maxHorsepower" [placeholder]="'common.max' | translate" />
      </div>

      <label class="filter-label">{{ 'catalog.consumption' | translate }}</label>
      <select class="field-control" [(ngModel)]="filters.consumption" (ngModelChange)="applyFilters()" name="consumption">
        <option value="">{{ 'common.select' | translate }}</option>
        <option *ngFor="let consumption of consumptionOptions" [value]="consumption">{{ consumption }}</option>
      </select>

      <label class="filter-label">{{ 'catalog.color' | translate }}</label>
      <select class="field-control" [(ngModel)]="filters.color" (ngModelChange)="applyFilters()" name="color">
        <option value="">{{ 'common.select' | translate }}</option>
        <option *ngFor="let color of colorOptions" [value]="color">{{ color }}</option>
      </select>

      <label class="filter-label">{{ 'catalog.interiorColor' | translate }}</label>
      <select class="field-control" [(ngModel)]="filters.interior_color" (ngModelChange)="applyFilters()" name="interior_color">
        <option value="">{{ 'common.select' | translate }}</option>
        <option *ngFor="let color of interiorColorOptions" [value]="color">{{ color }}</option>
      </select>
    </ng-template>
  `,
    styles: [
    ` 
      .home-container {
        width: min(1120px, 92vw);
        margin: 0 auto;
        padding: 0 4px;
      }
      .catalog-shell {
        width: min(1120px, 92vw);
        margin: 0 auto;
        padding: 0 4px;
      }
      .topbar {
        display: flex;
        gap: 10px;
        margin-bottom: 14px;
        align-items: center;
      }
      .search-wrap {
        flex: 1;
      }
      .search-wrap input {
        width: 100%;
        height: 46px;
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 0 14px;
        font-size: 16px;
        background: var(--panel-2);
        color: var(--text);
      }
      .filter-trigger {
        width: 58px;
        height: 46px;
        border-radius: 14px;
        border: 1px solid var(--border);
        background: var(--panel);
        cursor: pointer;
        display: grid;
        place-items: center;
      }
      .filter-icon {
        position: relative;
        width: 26px;
        height: 18px;
        display: block;
      }
      .filter-icon .line {
        position: absolute;
        left: 0;
        right: 0;
        height: 2px;
        background: #9ca3af;
      }
      .filter-icon .l1 { top: 2px; }
      .filter-icon .l2 { top: 10px; }
      .filter-icon .l3 { top: 18px; }
      .filter-icon .dot {
        position: absolute;
        width: 7px;
        height: 7px;
        border-radius: 50%;
        border: 2px solid #9ca3af;
        background: var(--panel-2);
      }
      .filter-icon .d1 { top: -1px; left: 18px; }
      .filter-icon .d2 { top: 7px; left: 6px; }
      .filter-icon .d3 { top: 15px; left: 22px; }
      .results {
        width: 100%;
      }
      .panel-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
      }
      .panel-head h3 {
        margin: 0;
      }
      .filter-label {
        display: block;
        font-weight: 800;
        font-size: 14px;
        margin-top: 14px;
        margin-bottom: 6px;
        color: var(--muted);
      }
      .field-control {
        width: 100%;
        height: 46px;
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 0 12px;
        background: var(--panel-2);
        color: var(--text);
        font-size: 16px;
        appearance: none;
        -webkit-appearance: none;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
      }
      .field-control:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.35);
      }
      .range-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      .chips {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
      }
      .chip {
        border: 1px solid var(--border);
        border-radius: 999px;
        height: 44px;
        background: var(--panel-2);
        color: var(--text);
        cursor: pointer;
      }
      .chip.active {
        border-color: var(--primary);
        color: #bbf7d0;
        background: rgba(16, 185, 129, 0.16);
      }
      .results-count {
        margin: 0 0 8px;
        color: var(--muted);
      }
      .cards {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
        gap: 12px;
      }
      article {
        background: var(--panel);
        border-radius: 18px;
        padding: 14px;
        border: 1px solid var(--border);
        box-shadow: 0 10px 26px rgba(0, 0, 0, 0.32);
      }
      .car-card-link {
        text-decoration: none;
        color: inherit;
        display: block;
      }
      .car-card-link article {
        transition: transform 0.18s ease, box-shadow 0.18s ease;
      }
      .car-card-link:hover article {
        transform: translateY(-2px);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
      }
      img {
        width: 100%;
        height: 180px;
        object-fit: cover;
        border-radius: 16px;
      }
      .reset-btn,
      .close-btn {
        border: 0;
        background: transparent;
        color: var(--muted);
        cursor: pointer;
        font-size: 17px;
      }
      .overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.55);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        z-index: 50;
      }
      .filters-modal {
        position: fixed;
        z-index: 60;
        top: 16px;
        left: 50%;
        transform: translateX(-50%);
        width: min(1020px, 94vw);
        max-height: calc(100vh - 32px);
        overflow: auto;
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 24px;
        padding: 20px;
        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.6);
      }
      .modal-footer {
        margin-top: 16px;
        padding-top: 12px;
        border-top: 1px solid var(--border);
        display: flex;
        justify-content: flex-end;
      }
      @media (max-width: 640px) {
        .filter-trigger {
          width: 52px;
          height: 44px;
          border-radius: 14px;
        }
        .chips {
          grid-template-columns: 1fr 1fr;
        }
        .range-row {
          grid-template-columns: 1fr;
          gap: 8px;
        }
      }
    `,
  ],
})
export class CarCatalogPageComponent implements OnInit {
  allCars: any[] = [];
  cars: any[] = [];
  brandSearch = '';
  showFilters = false;

  seatOptions: number[] = [];
  fuelOptions: string[] = [];
  transmissionOptions: string[] = [];
  carTypeOptions: string[] = [];
  driveOptions: string[] = [];
  engineOptions: string[] = [];
  consumptionOptions: string[] = [];
  colorOptions: string[] = [];
  interiorColorOptions: string[] = [];

  filters = {
    minPrice: 0,
    maxPrice: 0,
    minYear: 0,
    maxYear: 0,
    minHorsepower: 0,
    maxHorsepower: 0,
    seats: '',
    fuel: '',
    transmission: '',
    car_type: '',
    drive: '',
    engine: '',
    consumption: '',
    color: '',
    interior_color: '',
    sort: 'relevance',
  };

  private initialRange = {
    minPrice: 0,
    maxPrice: 0,
    minYear: 0,
    maxYear: 0,
    minHorsepower: 0,
    maxHorsepower: 0,
  };

  constructor(
    private readonly api: ApiService,
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadCars();
  }

  loadCars(): void {
    this.api.getCars().subscribe((cars) => {
      this.allCars = cars;
      this.initFilterMeta();
      this.applyFilters();
    });
  }

  initFilterMeta(): void {
    if (this.allCars.length === 0) return;

    const prices = this.allCars.map((c) => Number(c.price_per_day) || 0);
    const years = this.allCars.map((c) => Number(c.year) || 0);
    const horsepowers = this.allCars.map((c) => Number(c.horsepower) || 0).filter((v) => v > 0);

    this.initialRange.minPrice = Math.min(...prices);
    this.initialRange.maxPrice = Math.max(...prices);
    this.initialRange.minYear = Math.min(...years);
    this.initialRange.maxYear = Math.max(...years);
    this.initialRange.minHorsepower = horsepowers.length ? Math.min(...horsepowers) : 0;
    this.initialRange.maxHorsepower = horsepowers.length ? Math.max(...horsepowers) : 0;

    this.filters.minPrice = this.initialRange.minPrice;
    this.filters.maxPrice = this.initialRange.maxPrice;
    this.filters.minYear = this.initialRange.minYear;
    this.filters.maxYear = this.initialRange.maxYear;
    this.filters.minHorsepower = this.initialRange.minHorsepower;
    this.filters.maxHorsepower = this.initialRange.maxHorsepower;

    this.seatOptions = [...new Set(this.allCars.map((c) => Number(c.seats)).filter(Boolean))].sort((a, b) => a - b);
    this.fuelOptions = [...new Set(this.allCars.map((c) => c.fuel_type).filter(Boolean))];
    this.transmissionOptions = [...new Set(this.allCars.map((c) => c.transmission).filter(Boolean))];
    this.carTypeOptions = [...new Set(this.allCars.map((c) => c.car_type).filter(Boolean))];
    this.driveOptions = [...new Set(this.allCars.map((c) => c.drive).filter(Boolean))];
    this.engineOptions = [...new Set(this.allCars.map((c) => c.engine).filter(Boolean))];
    this.consumptionOptions = [...new Set(this.allCars.map((c) => c.consumption).filter(Boolean))];
    this.colorOptions = [...new Set(this.allCars.map((c) => c.color).filter(Boolean))];
    this.interiorColorOptions = [...new Set(this.allCars.map((c) => c.interior_color).filter(Boolean))];
  }

  applyFilters(): void {
    const q = this.brandSearch.trim().toLowerCase();

    let filtered = this.allCars.filter((c) => {
      const brandOk = !q || String(c.brand || '').toLowerCase().includes(q);
      const price = Number(c.price_per_day) || 0;
      const year = Number(c.year) || 0;
      const seats = Number(c.seats) || 0;
      const horsepower = Number(c.horsepower) || 0;

      const priceOk = price >= Number(this.filters.minPrice) && price <= Number(this.filters.maxPrice);
      const yearOk = year >= Number(this.filters.minYear) && year <= Number(this.filters.maxYear);
      const hpOk =
        (!this.filters.minHorsepower && !this.filters.maxHorsepower) ||
        (horsepower >= Number(this.filters.minHorsepower) && horsepower <= Number(this.filters.maxHorsepower));
      const seatsOk = !this.filters.seats || seats === Number(this.filters.seats);
      const fuelOk = !this.filters.fuel || c.fuel_type === this.filters.fuel;
      const transOk = !this.filters.transmission || c.transmission === this.filters.transmission;
      const typeOk = !this.filters.car_type || c.car_type === this.filters.car_type;
      const driveOk = !this.filters.drive || c.drive === this.filters.drive;
      const engineOk = !this.filters.engine || c.engine === this.filters.engine;
      const consumptionOk = !this.filters.consumption || c.consumption === this.filters.consumption;
      const colorOk = !this.filters.color || c.color === this.filters.color;
      const interiorColorOk = !this.filters.interior_color || c.interior_color === this.filters.interior_color;

      return (
        brandOk &&
        priceOk &&
        yearOk &&
        hpOk &&
        seatsOk &&
        fuelOk &&
        transOk &&
        typeOk &&
        driveOk &&
        engineOk &&
        consumptionOk &&
        colorOk &&
        interiorColorOk
      );
    });

    if (this.filters.sort === 'price_asc') {
      filtered = filtered.sort((a, b) => (a.price_per_day || 0) - (b.price_per_day || 0));
    } else if (this.filters.sort === 'price_desc') {
      filtered = filtered.sort((a, b) => (b.price_per_day || 0) - (a.price_per_day || 0));
    } else if (this.filters.sort === 'year_desc') {
      filtered = filtered.sort((a, b) => (b.year || 0) - (a.year || 0));
    } else if (this.filters.sort === 'horsepower_desc') {
      filtered = filtered.sort((a, b) => (Number(b.horsepower) || 0) - (Number(a.horsepower) || 0));
    }

    this.cars = filtered;
  }

  toggleFuel(fuel: string): void {
    this.filters.fuel = this.filters.fuel === fuel ? '' : fuel;
    this.applyFilters();
  }

  resetFilters(): void {
    this.filters = {
      minPrice: this.initialRange.minPrice,
      maxPrice: this.initialRange.maxPrice,
      minYear: this.initialRange.minYear,
      maxYear: this.initialRange.maxYear,
      minHorsepower: this.initialRange.minHorsepower,
      maxHorsepower: this.initialRange.maxHorsepower,
      seats: '',
      fuel: '',
      transmission: '',
      car_type: '',
      drive: '',
      engine: '',
      consumption: '',
      color: '',
      interior_color: '',
      sort: 'relevance',
    };
    this.applyFilters();
  }

  toApiUrl(path?: string): string {
    if (!path) return 'https://placehold.co/420x260';
    if (path.startsWith('http')) return path;
    return `${environment.apiUrl}${path}`;
  }

  translateOptionValue(kind: 'fuel' | 'transmission' | 'carType' | 'drive', value: unknown): string {
    const raw = String(value || '').trim();
    if (!raw) return '';

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
}
