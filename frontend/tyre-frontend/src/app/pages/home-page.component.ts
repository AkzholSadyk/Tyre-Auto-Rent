import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { environment } from '../../environments/environment';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  template: `
    <div class="home-container">
    <section class="home-hero">
      <video
        *ngIf="featuredVideo"
        class="hero-video"
        [src]="toApiUrl(featuredVideo)"
        autoplay
        muted
        loop
        playsinline
        preload="metadata"
        (loadedmetadata)="silenceVideo($event)"
      ></video>
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h2>{{ 'home.heroTitle' | translate }}</h2>
        <p>{{ 'home.heroSubtitle' | translate }}</p>
        <a class="btn" routerLink="/cars">{{ 'home.searchButton' | translate }}</a>
      </div>
    </section>

    <section class="search-card">
      <h3>{{ 'home.quickSearchTitle' | translate }}</h3>
      <div class="search-grid">
        <label class="field">
          <span class="field-label">{{ 'home.pickupLocation' | translate }}</span>
          <select [(ngModel)]="search.pickup">
            <option *ngFor="let location of content.quick_search.locations" [value]="location">
              {{ translateOptionValue('location', location) }}
            </option>
          </select>
        </label>
        <label class="field">
          <span class="field-label">{{ 'home.pickupDate' | translate }}</span>
          <input type="date" [(ngModel)]="search.pickupDate" />
        </label>
        <label class="field">
          <span class="field-label">{{ 'home.returnDate' | translate }}</span>
          <input type="date" [(ngModel)]="search.returnDate" />
        </label>
        <label class="field">
          <span class="field-label">{{ 'home.carType' | translate }}</span>
          <select [(ngModel)]="search.carType">
            <option *ngFor="let type of content.quick_search.car_types" [value]="type">
              {{ translateOptionValue('carType', type) }}
            </option>
          </select>
        </label>
      </div>
      <a class="btn" routerLink="/cars">{{ 'home.quickSearchButton' | translate }}</a>
    </section>

    <section>
      <div class="section-head">
        <h3>{{ 'home.popularTitle' | translate }}</h3>
        <a routerLink="/cars">{{ 'home.popularViewAll' | translate }}</a>
      </div>
      <div class="popular-grid">
        <article *ngFor="let car of popularCars">
          <img [src]="toApiUrl((car.images || '').split(',')[0])" alt="car" />
          <h4>{{ car.brand }} {{ car.model }}</h4>
          <p>{{ car.price_per_day }} ₸ / {{ 'common.day' | translate }}</p>
        </article>
      </div>
    </section>

    <section class="why-section">
      <h2 class="why-title">{{ 'home.whyTitle' | translate }}</h2>
      <p class="why-sub">{{ 'home.whySubtitle' | translate }}</p>

      <div class="why-list">
        <div class="vline" aria-hidden="true"></div>
        <ng-container *ngFor="let item of whyItems; let i = index">
          <div class="why-row" [class.right]="i % 2 === 1">
            <div class="slot left">
              <div *ngIf="i % 2 === 0" class="why-content">
                <h3>{{ item.title }}</h3>
                <p>{{ item.description }}</p>
              </div>
            </div>

            <div class="slot center">
              <div class="why-badge">{{ i + 1 }}</div>
            </div>

            <div class="slot right">
              <div *ngIf="i % 2 === 1" class="why-content">
                <h3>{{ item.title }}</h3>
                <p>{{ item.description }}</p>
              </div>
            </div>
          </div>
        </ng-container>
      </div>
    </section>

    <section class="why-section how-section">
      <h2 class="why-title">{{ 'home.howTitle' | translate }}</h2>
      <p class="why-sub">{{ 'home.howSubtitle' | translate }}</p>

      <div class="why-list">
        <div class="vline" aria-hidden="true"></div>
        <ng-container *ngFor="let step of howSteps; let i = index">
          <div class="why-row" [class.right]="i % 2 === 1">
            <div class="slot left">
              <div *ngIf="i % 2 === 0" class="why-content">
                <h3>{{ step.title }}</h3>
                <p>{{ step.description }}</p>
              </div>
            </div>

            <div class="slot center">
              <div class="why-badge">{{ i + 1 }}</div>
            </div>

            <div class="slot right">
              <div *ngIf="i % 2 === 1" class="why-content">
                <h3>{{ step.title }}</h3>
                <p>{{ step.description }}</p>
              </div>
            </div>
          </div>
        </ng-container>
      </div>
    </section>

    <section>
      <h3>{{ 'home.socialTitle' | translate }}</h3>
      <div class="social-videos">
        <a *ngFor="let item of socialVideos" [href]="toExternalUrl(item.link_url)" target="_blank" rel="noopener">
          <video
            [src]="toApiUrl(item.video_url)"
            autoplay
            muted
            loop
            playsinline
            preload="metadata"
            (loadedmetadata)="silenceVideo($event)"
          ></video>
        </a>
      </div>
    </section>

    <section>
      <h3>{{ 'home.reviewsTitle' | translate }}</h3>
      <div class="reviews-grid">
        <article *ngFor="let review of reviews">
          <div class="stars">{{ stars(review.rating) }}</div>
          <p>"{{ review.text }}"</p>
          <span>— {{ review.name }}</span>
        </article>
      </div>
    </section>

    <section>
      <h3>{{ 'home.mapTitle' | translate }}</h3>
      <p>{{ 'home.mapSubtitle' | translate }}</p>
      <div class="map-wrap">
        <iframe
          title="TYRE pickup points map"
          src="https://yandex.com/map-widget/v1/?ll=76.953628%2C43.274361&z=10&pt=76.895797%2C43.200720%2Cpm2rdm~77.011460%2C43.348002%2Cpm2blm"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </section>

    <section class="cta-card">
      <h3>{{ 'home.ctaTitle' | translate }}</h3>
      <p>{{ 'home.ctaSubtitle' | translate }}</p>
      <a class="btn" [href]="whatsAppUrl" target="_blank" rel="noopener">
        {{ 'home.ctaButton' | translate }}
      </a>
    </section>
    </div>
  `,
    styles: [
    `
      .home-container {
        width: min(1120px, 92vw);
        margin: 0 auto;
        padding: 0 4px;
      }
      section {
        margin-top: 16px;
        color: var(--text);
      }
      .home-hero {
        position: relative;
        min-height: 420px;
        overflow: hidden;
        border-radius: 28px;
        background:
          radial-gradient(circle at 20% 20%, rgba(16, 185, 129, 0.32), transparent 52%),
          linear-gradient(135deg, #020617, #020713 45%, #020617);
        border: 1px solid var(--border);
      }
      .hero-video {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        filter: saturate(1.1) contrast(1.05);
        z-index: 1;
      }
      .hero-overlay {
        position: absolute;
        inset: 0;
        /* keep only the green left tint; remove the dark right-side overlays */
        background: radial-gradient(circle at 0% 50%, rgba(22, 163, 74, 0.6), transparent 60%);
        z-index: 2;
      }
      .hero-content {
        position: relative;
        z-index: 3;
        padding: 34px;
        max-width: 620px;
        color: #fff;
      }
      .hero-content h2 {
        margin: 0 0 10px;
        font-size: clamp(32px, 5.2vw, 56px);
        letter-spacing: 0.3px;
      }
      .hero-content p {
        margin: 0 0 14px;
        font-size: 22px;
        line-height: 1.35;
        color: rgba(226, 232, 240, 0.96);
      }
      .hero-content .btn {
        text-decoration: none;
        display: inline-block;
      }
      .search-card {
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 24px;
        padding: 18px;
        box-shadow: 0 14px 30px rgba(0, 0, 0, 0.35);
      }
      .search-card h3 {
        margin: 0 0 12px;
      }
      .search-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(160px, 1fr));
        gap: 10px;
        margin-bottom: 12px;
      }
      .field {
        display: grid;
        gap: 6px;
      }
      .field-label {
        font-size: 12px;
        font-weight: 700;
        color: var(--muted);
        letter-spacing: 0.2px;
      }
      .search-grid select,
      .search-grid input {
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
        box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.5);
        transition: border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
      }
      .search-grid select:focus,
      .search-grid input:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.35);
      }
      .search-grid input[type='date'] {
        min-width: 0;
      }
      .section-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
      }
      .section-head h3 {
        margin: 0;
      }
      /* Make the 'View all' link green and remove underline/bottom border */
      .section-head a {
        color: #10b981;
        text-decoration: none;
        border-bottom: none;
        font-weight: 700;
      }
      .section-head a:hover {
        color: #05a66f;
      }
      .popular-grid {
        margin-top: 10px;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 10px;
      }
      .popular-grid article {
        background: var(--panel);
        border-radius: 18px;
        border: 1px solid var(--border);
        padding: 14px;
        box-shadow: 0 10px 26px rgba(0, 0, 0, 0.32);
      }
      .popular-grid img {
        width: 100%;
        height: 160px;
        object-fit: cover;
        border-radius: 10px;
      }
      .popular-grid h4 {
        margin: 10px 0 4px;
      }
      .popular-grid p {
        margin: 0;
      }
      .feature-grid,
      .steps-grid,
      .reviews-grid {
        margin-top: 10px;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 10px;
      }
      .feature-grid article,
      .steps-grid article,
      .reviews-grid article {
        background: var(--panel);
        border-radius: 18px;
        border: 1px solid var(--border);
        padding: 14px;
        box-shadow: 0 10px 26px rgba(0, 0, 0, 0.28);
      }
      .icon-badge {
        width: 38px;
        height: 38px;
        border-radius: 999px;
        background: rgba(15, 23, 42, 0.9);
        border: 1px solid rgba(16, 185, 129, 0.45);
        display: grid;
        place-items: center;
      }
      .icon-badge svg {
        width: 20px;
        height: 20px;
        fill: #10b981;
      }
      .feature-grid h4,
      .steps-grid b {
        display: block;
        margin: 8px 0 4px;
      }
      .step-badge {
        display: inline-grid;
        place-items: center;
        width: 22px;
        height: 22px;
        border-radius: 999px;
        font-size: 12px;
        margin-right: 6px;
        background: rgba(16, 185, 129, 0.12);
        border: 1px solid rgba(16, 185, 129, 0.6);
        color: #bbf7d0;
      }
      .feature-grid p,
      .steps-grid p {
        margin: 0;
        color: var(--muted);
      }
      .social-videos {
        margin-top: 10px;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 10px;
      }
      .social-videos a {
        display: block;
        border-radius: 18px;
        overflow: hidden;
        border: 1px solid var(--border);
        background: #000;
      }
      .social-videos video {
        width: 100%;
        height: 220px;
        object-fit: cover;
        display: block;
      }
      .reviews-grid .stars {
        color: #f59e0b;
        margin-bottom: 6px;
      }
      .reviews-grid p {
        margin: 0 0 6px;
      }
      .reviews-grid span {
        color: var(--muted);
      }
      .map-wrap {
        margin-top: 10px;
        border-radius: 18px;
        overflow: hidden;
        border: 1px solid var(--border);
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.35);
      }
      .map-wrap iframe {
        width: 100%;
        height: 300px;
        border: 0;
      }
      .why-section {
        padding: 18px 0 6px;
      }
      .why-section .why-sub {
        color: var(--muted);
        margin: 6px 0 18px;
        text-align: center;
        font-size: 14px;
      }
      .why-grid {
        display: grid;
        grid-template-columns: 1fr 84px 1fr;
        gap: 18px;
        align-items: start;
        margin-top: 8px;
      }
      .why-grid .col ul {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .why-grid .col.left li,
      .why-grid .col.right li {
        margin: 22px 0;
      }
      .timeline-card {
        max-width: 320px;
        margin: 0 auto;
        text-align: left;
        color: rgba(235,241,244,0.95);
      }
      .timeline-card h4 {
        margin: 0 0 6px;
      }
      .col.center {
        position: relative;
      }
      .col.center .line {
        position: absolute;
        left: 50%;
        top: 0;
        bottom: 0;
        width: 2px;
        background: rgba(255,255,255,0.06);
        transform: translateX(-50%);
      }
      .col.center ul {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 28px;
        padding: 8px 0;
      }
      .col.center .badge {
        width: 44px;
        height: 44px;
        border-radius: 999px;
        background: #06b37f;
        color: #052018;
        display: grid;
        place-items: center;
        font-weight: 800;
      }
      /* New why-list styles */
      .why-section {
        padding: 36px 0;
      }
      .why-title {
        text-align: center;
        margin: 0 0 6px;
        font-size: clamp(28px, 4.8vw, 48px);
      }
      /* Timeline: centered vertical line with alternating content */
      .why-list {
        position: relative;
        max-width: 980px;
        margin: 28px auto 0;
        padding: 12px 16px;
      }

      /* single center vertical line */
      .why-list > .vline {
        position: absolute;
        left: 50%;
        top: 0;
        bottom: 0;
        width: 2px;
        background: rgba(255,255,255,0.04);
        transform: translateX(-50%);
        z-index: 1;
      }

      .why-row {
        display: grid;
        grid-template-columns: 1fr 84px 1fr;
        gap: 12px 28px;
        align-items: center;
        margin: 28px 0;
        position: relative;
        z-index: 2; /* sits above vline */
      }

      .why-row .slot { min-height: 1px; }
      .slot.left { text-align: right; }
      .slot.right { text-align: left; }
      .slot.center { display: flex; flex-direction: column; align-items: center; position: relative; }

      .why-badge {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: #10b981; /* accent green */
        color: #ffffff;
        display: grid;
        place-items: center;
        font-weight: 800;
        font-size: 16px;
        box-shadow: 0 6px 18px rgba(16,185,129,0.12);
        z-index: 3;
      }

  .why-content h3 { margin: 0 0 8px; font-size: 20px; font-weight: 800; }
  /* constrain text blocks so they extend toward the center line */
  .slot.left .why-content { max-width: 420px; margin-left: auto; text-align: right; }
  .slot.right .why-content { max-width: 420px; margin-right: auto; text-align: left; }
  .why-content p { margin: 0; color: var(--muted); }

      .why-row.right .slot.left .why-content { display: none; }
      .why-row.right .slot.right .why-content { display: block; }
      .why-row:not(.right) .slot.right .why-content { display: none; }
      .why-row:not(.right) .slot.left .why-content { display: block; }

      /* Responsive: single column timeline on small screens */
      @media (max-width: 720px) {
        /* Mobile: stacked timeline - badge above each block */
        .why-list {
          padding: 18px 16px 24px;
        }
        /* hide center vertical line on small screens to avoid layout issues */
        .why-list > .vline { display: none; }
        .why-row {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          margin: 20px 0;
          text-align: center;
        }
        /* place the badge first for every row */
        .slot.center { order: -1; display: block; margin-bottom: 8px; }
        .slot.left, .slot.right { order: 0; display: block; }
        .why-badge {
          width: 44px;
          height: 44px;
          margin: 0 auto 10px;
          position: relative;
          z-index: 1; /* ensure header stays above */
        }
        .slot.left .why-content, .slot.right .why-content { display: block; text-align: center; max-width: 100%; margin: 0 auto; }
      }
      .cta-card {
        background:
          radial-gradient(circle at 0% 0%, rgba(16, 185, 129, 0.35), transparent 60%),
          linear-gradient(135deg, #020617, #020617);
        color: #fff;
        border-radius: 24px;
        padding: 20px;
        border: 1px solid rgba(16, 185, 129, 0.55);
        box-shadow: 0 14px 32px rgba(0, 0, 0, 0.4);
      }
      .cta-card h3 {
        margin: 0 0 6px;
      }
      .cta-card p {
        margin: 0 0 10px;
      }
      .cta-card .btn {
        text-decoration: none;
      }
      @media (max-width: 820px) {
        .search-grid {
          grid-template-columns: 1fr 1fr;
          gap: 9px;
        }
      }
      @media (max-width: 520px) {
        .search-card {
          border-radius: 14px;
          padding: 12px;
        }
        .search-grid {
          grid-template-columns: 1fr;
          gap: 8px;
        }
        .field-label {
          font-size: 11px;
        }
        .search-grid select,
        .search-grid input {
          height: 44px;
          font-size: 15px;
          border-radius: 10px;
        }
      }
    `,
  ],
})
export class HomePageComponent implements OnInit {
  featuredVideo = '';
  popularCars: any[] = [];
  socialVideos: { video_url: string; link_url: string }[] = [];
  whatsAppUrl = environment.whatsappBookingUrl;
  instagramUrl = 'https://www.instagram.com/tyreautorent/';
  whyItems: Array<{ icon: 'car' | 'pin' | 'bolt' | 'shield'; title: string; description: string }> = [];
  howSteps: Array<{ title: string; description: string }> = [];
  reviews: Array<{ name: string; rating: number; text: string }> = [];
  content: any = {
    quick_search: { title: '', locations: ['Almaty'], car_types: ['SUV', 'Sedan', 'Premium'], button_text: 'Search Car' },
    popular: { title: 'Popular Cars', car_ids: [], button_text: 'View all cars' },
    why_choose: { title: 'Why choose TYRE?', items: [] },
    how_it_works: { title: 'How it works', steps: [] },
    social: { title: 'Follow TYRE on Instagram' },
    reviews: { title: 'Customer Reviews', items: [] },
    cta: { title: 'Need a car today?', subtitle: 'Book now via WhatsApp', button_text: 'Book now', button_link: '' },
  };
  search = {
    pickup: 'Almaty',
    pickupDate: '',
    returnDate: '',
    carType: 'SUV',
  };

  constructor(
    private readonly api: ApiService,
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.api.getHomepageContentPublic().subscribe((res) => {
      this.content = { ...this.content, ...res };
      this.search.pickup = this.content.quick_search?.locations?.[0] || 'Almaty';
      this.search.carType = this.content.quick_search?.car_types?.[0] || 'SUV';
      this.loadPopularCars();
    });
    this.api.getAboutVideosPublic().subscribe((res) => {
      this.featuredVideo = (res.videos || [])[0] || '';
    });
    this.api.getSocialVideosPublic().subscribe((res) => {
      this.socialVideos = (res.items || []).slice(0, 3);
    });
    this.loadLocalizedContent();
    this.translate.onLangChange.subscribe(() => this.loadLocalizedContent());
  }

  private loadPopularCars(): void {
    this.api.getCars().subscribe((cars) => {
      const ids: number[] = this.content.popular?.car_ids || [];
      const byId = new Map<number, any>(cars.map((car) => [Number(car.id), car]));
      this.popularCars = ids.map((id) => byId.get(Number(id))).filter(Boolean).slice(0, 3);
      if (this.popularCars.length === 0) {
        this.popularCars = cars.slice(0, 3);
      }
    });
  }

  stars(value: number): string {
    const n = Math.max(1, Math.min(5, Number(value || 5)));
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }

  toApiUrl(path?: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${environment.apiUrl}${path}`;
  }

  toExternalUrl(raw?: string): string {
    const val = String(raw || '').trim();
    if (!val) return this.instagramUrl;
    if (val.startsWith('http://') || val.startsWith('https://')) return val;
    return `https://${val}`;
  }

  silenceVideo(event: Event): void {
    const video = event.target as HTMLVideoElement | null;
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;
  }

  translateOptionValue(kind: 'location' | 'carType', value: unknown): string {
    const raw = String(value || '').trim();
    if (!raw) return '';

    const key = `optionValues.${kind}.${this.toOptionKey(raw)}`;
    const translated = this.translate.instant(key);
    return translated !== key ? translated : raw;
  }

  private loadLocalizedContent(): void {
    this.whyItems = [
      {
        icon: 'car',
        title: this.translate.instant('home.why1Title'),
        description: this.translate.instant('home.why1Desc'),
      },
      {
        icon: 'pin',
        title: this.translate.instant('home.why2Title'),
        description: this.translate.instant('home.why2Desc'),
      },
      {
        icon: 'bolt',
        title: this.translate.instant('home.why3Title'),
        description: this.translate.instant('home.why3Desc'),
      },
      {
        icon: 'shield',
        title: this.translate.instant('home.why4Title'),
        description: this.translate.instant('home.why4Desc'),
      },
    ];

    this.howSteps = [
      {
        title: this.translate.instant('home.step1Title'),
        description: this.translate.instant('home.step1Desc'),
      },
      {
        title: this.translate.instant('home.step2Title'),
        description: this.translate.instant('home.step2Desc'),
      },
      {
        title: this.translate.instant('home.step3Title'),
        description: this.translate.instant('home.step3Desc'),
      },
      {
        title: this.translate.instant('home.step4Title'),
        description: this.translate.instant('home.step4Desc'),
      },
    ];

    this.reviews = [
      {
        name: this.translate.instant('home.review1Name'),
        rating: 5,
        text: this.translate.instant('home.review1Text'),
      },
      {
        name: this.translate.instant('home.review2Name'),
        rating: 5,
        text: this.translate.instant('home.review2Text'),
      },
    ];
  }

  private toOptionKey(value: string): string {
    return value
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }
}
