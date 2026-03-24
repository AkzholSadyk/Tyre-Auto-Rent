import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { environment } from '../../environments/environment';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-admin-panel-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <h2>{{ 'admin.title' | translate }}</h2>

    <div class="tabs">
      <button class="btn" (click)="tab='catalog'">{{ 'admin.tabs.catalog' | translate }}</button>
      <button class="btn" (click)="tab='available'">{{ 'admin.tabs.available' | translate }}</button>
      <button class="btn" (click)="tab='home'">Home Page</button>
    </div>

    <section *ngIf="tab === 'catalog'">
      <h3>{{ 'admin.catalog.title' | translate }}</h3>
      <div class="form">
        <div class="tabs">
          <button class="btn" type="button" [class.active-tab]="videoSection === 'home'" (click)="videoSection='home'">
            {{ 'admin.videoSections.home' | translate }}
          </button>
          <button class="btn" type="button" [class.active-tab]="videoSection === 'about'" (click)="videoSection='about'">
            {{ 'admin.videoSections.about' | translate }}
          </button>
        </div>
        <h4>{{ videoSection === 'home' ? ('admin.homeVideos.title' | translate) : ('admin.aboutVideos.title' | translate) }}</h4>
        <p>{{ videoSection === 'home' ? ('admin.homeVideos.hint' | translate) : ('admin.aboutVideos.hint' | translate) }}</p>
        <input type="file" multiple accept="video/*" (change)="onSectionVideos($event)" />
        <label class="replace-toggle">
          <input type="checkbox" [(ngModel)]="replaceVideosOnUpload" name="replaceVideosOnUpload" />
          {{ videoSection === 'home' ? ('admin.homeVideos.replaceAll' | translate) : ('admin.aboutVideos.replaceAll' | translate) }}
        </label>
        <button class="btn" type="button" (click)="uploadSectionVideos()" [disabled]="uploadingVideos || selectedSectionVideos.length === 0">
          {{ uploadingVideos ? ('common.uploading' | translate) : (videoSection === 'home' ? ('admin.homeVideos.upload' | translate) : ('admin.aboutVideos.upload' | translate)) }}
        </button>
        <div class="home-videos-grid" *ngIf="currentVideos.length > 0">
          <article *ngFor="let video of currentVideos; let i = index">
            <video
              [src]="toApiUrl(video)"
              autoplay
              muted
              loop
              playsinline
              preload="metadata"
              (loadedmetadata)="silenceVideo($event)"
            ></video>
            <div class="actions">
              <button class="btn" type="button" (click)="setSectionVideoCover(i)" [disabled]="i === 0">
                {{ videoSection === 'home' ? ('admin.homeVideos.setBackground' | translate) : ('admin.aboutVideos.setBackground' | translate) }}
              </button>
              <button class="btn" type="button" (click)="moveSectionVideo(i, -1)" [disabled]="i === 0">{{ 'common.up' | translate }}</button>
              <button class="btn" type="button" (click)="moveSectionVideo(i, 1)" [disabled]="i === currentVideos.length - 1">{{ 'common.down' | translate }}</button>
              <button class="btn danger" type="button" (click)="removeSectionVideo(video)">{{ 'common.remove' | translate }}</button>
            </div>
          </article>
        </div>
      </div>

      <form class="form" (ngSubmit)="createCar()">
        <input [(ngModel)]="carForm.brand" name="brand" [placeholder]="'admin.catalog.brand' | translate" required />
        <input [(ngModel)]="carForm.model" name="model" [placeholder]="'admin.catalog.model' | translate" required />
        <input [(ngModel)]="carForm.year" name="year" type="number" [placeholder]="'admin.catalog.year' | translate" required />
        <input [(ngModel)]="carForm.price_per_day" name="price_per_day" type="number" [placeholder]="'admin.catalog.pricePerDay' | translate" required />
        <input [(ngModel)]="carForm.deposit" name="deposit" type="number" [placeholder]="'admin.catalog.deposit' | translate" required />
        <input [(ngModel)]="carForm.transmission" name="transmission" [placeholder]="'admin.catalog.transmission' | translate" required />
        <input [(ngModel)]="carForm.fuel_type" name="fuel_type" [placeholder]="'admin.catalog.fuelType' | translate" required />
        <input [(ngModel)]="carForm.seats" name="seats" type="number" [placeholder]="'admin.catalog.seats' | translate" required />
        <input [(ngModel)]="carForm.horsepower" name="horsepower" type="number" placeholder="Horsepower" />
        <input [(ngModel)]="carForm.engine" name="engine" placeholder="Engine (e.g. 3.5L)" />
        <input [(ngModel)]="carForm.car_type" name="car_type" placeholder="Type (e.g. SUV)" />
        <input [(ngModel)]="carForm.drive" name="drive" placeholder="Drive (e.g. All-Wheel Drive)" />
        <input [(ngModel)]="carForm.acceleration" name="acceleration" placeholder="Acceleration (e.g. 7.0 sec)" />
        <input [(ngModel)]="carForm.color" name="color" placeholder="Color" />
        <input [(ngModel)]="carForm.interior_color" name="interior_color" placeholder="Interior color" />
        <input [(ngModel)]="carForm.max_speed" name="max_speed" placeholder="Max speed (e.g. 175 km/h)" />
        <input [(ngModel)]="carForm.consumption" name="consumption" placeholder="Consumption (e.g. 15 L/100 km)" />
  <label>{{ 'admin.catalog.description_en' | translate }}</label>
  <textarea [(ngModel)]="carForm.description_en" name="description_en" placeholder="EN"></textarea>
  <label>{{ 'admin.catalog.description_ru' | translate }}</label>
  <textarea [(ngModel)]="carForm.description_ru" name="description_ru" placeholder="RU"></textarea>
  <label>{{ 'admin.catalog.description_kk' | translate }}</label>
  <textarea [(ngModel)]="carForm.description_kk" name="description_kk" placeholder="KK"></textarea>
  <label>{{ 'admin.catalog.description_zh' | translate }}</label>
  <textarea [(ngModel)]="carForm.description_zh" name="description_zh" placeholder="ZH"></textarea>
  <!-- Legacy single description kept for backward compatibility -->
  <textarea style="display:none" [(ngModel)]="carForm.description" name="description" [placeholder]="'admin.catalog.description' | translate"></textarea>
        <select [(ngModel)]="carForm.status" name="status">
          <option value="available">{{ 'common.available' | translate }}</option>
          <option value="unavailable">{{ 'common.unavailable' | translate }}</option>
        </select>
        <label>{{ 'admin.catalog.photos' | translate }}</label>
        <input type="file" multiple accept="image/*" (change)="onCarImages($event)" />
        <button class="btn" type="submit" [disabled]="savingCar">{{ savingCar ? ('common.uploading' | translate) : ('admin.catalog.publish' | translate) }}</button>
      </form>

      <div class="car-grid">
        <div *ngFor="let car of cars" class="card">
          <img *ngIf="car.images" [src]="toApiUrl(car.images.split(',')[0])" alt="car" />
          <p><b>#{{ car.id }}</b> {{ car.brand }} {{ car.model }}</p>
          <p>{{ car.price_per_day }} ₸ / {{ 'common.day' | translate }} | {{ 'admin.catalog.depositShort' | translate }}={{ car.deposit }} ₸ | {{ 'common.status' | translate }}={{ car.status }}</p>
          <div class="actions">
            <button class="btn" (click)="openEditCar(car)">{{ 'common.edit' | translate }}</button>
            <button class="btn" (click)="setAvailable(car.id, 'available')">{{ 'admin.catalog.setAvailable' | translate }}</button>
            <button class="btn" (click)="setAvailable(car.id, 'unavailable')">{{ 'admin.catalog.setUnavailable' | translate }}</button>
            <button class="btn danger" (click)="deleteCar(car.id)">{{ 'common.delete' | translate }}</button>
          </div>
        </div>
      </div>

      <div *ngIf="editingCar" class="editor">
        <h3>{{ 'admin.edit.title' | translate }} #{{ editingCar.id }} {{ editingCar.brand }} {{ editingCar.model }}</h3>
        <form class="form" (ngSubmit)="saveEditCar()">
          <input [(ngModel)]="editForm.price_per_day" name="edit_price" type="number" [placeholder]="'admin.catalog.pricePerDay' | translate" required />
          <input [(ngModel)]="editForm.deposit" name="edit_deposit" type="number" [placeholder]="'admin.catalog.deposit' | translate" required />
          <input [(ngModel)]="editForm.seats" name="edit_seats" type="number" [placeholder]="'admin.catalog.seats' | translate" />
          <input [(ngModel)]="editForm.horsepower" name="edit_horsepower" type="number" placeholder="Horsepower" />
          <input [(ngModel)]="editForm.engine" name="edit_engine" placeholder="Engine" />
          <input [(ngModel)]="editForm.car_type" name="edit_car_type" placeholder="Type" />
          <input [(ngModel)]="editForm.drive" name="edit_drive" placeholder="Drive" />
          <input [(ngModel)]="editForm.acceleration" name="edit_acceleration" placeholder="Acceleration" />
          <input [(ngModel)]="editForm.color" name="edit_color" placeholder="Color" />
          <input [(ngModel)]="editForm.interior_color" name="edit_interior_color" placeholder="Interior color" />
          <input [(ngModel)]="editForm.max_speed" name="edit_max_speed" placeholder="Max speed" />
          <input [(ngModel)]="editForm.transmission" name="edit_transmission" [placeholder]="'admin.catalog.transmission' | translate" />
          <input [(ngModel)]="editForm.consumption" name="edit_consumption" placeholder="Consumption" />
          <input [(ngModel)]="editForm.year" name="edit_year" type="number" [placeholder]="'admin.catalog.year' | translate" />
          <label>{{ 'admin.catalog.description_en' | translate }}</label>
          <textarea [(ngModel)]="editForm.description_en" name="edit_description_en" placeholder="EN"></textarea>
          <label>{{ 'admin.catalog.description_ru' | translate }}</label>
          <textarea [(ngModel)]="editForm.description_ru" name="edit_description_ru" placeholder="RU"></textarea>
          <label>{{ 'admin.catalog.description_kk' | translate }}</label>
          <textarea [(ngModel)]="editForm.description_kk" name="edit_description_kk" placeholder="KK"></textarea>
          <label>{{ 'admin.catalog.description_zh' | translate }}</label>
          <textarea [(ngModel)]="editForm.description_zh" name="edit_description_zh" placeholder="ZH"></textarea>
          <!-- Legacy single description kept for backward compatibility -->
          <label style="display:none">{{ 'admin.catalog.description' | translate }}</label>
          <textarea style="display:none" [(ngModel)]="editForm.description" name="edit_description" [placeholder]="'admin.catalog.description' | translate"></textarea>
          <select [(ngModel)]="editForm.status" name="edit_status">
            <option value="available">{{ 'common.available' | translate }}</option>
            <option value="unavailable">{{ 'common.unavailable' | translate }}</option>
          </select>

          <label>{{ 'admin.edit.addPhotos' | translate }}</label>
          <input type="file" multiple accept="image/*" (change)="onEditImages($event)" />
          <button class="btn" type="button" (click)="uploadEditImages()" [disabled]="uploadingEditImages">{{ uploadingEditImages ? ('common.uploading' | translate) : ('admin.edit.uploadSelected' | translate) }}</button>

          <h4>{{ 'admin.edit.photoQueue' | translate }}</h4>
          <div class="photo-list">
            <div class="photo-item" *ngFor="let img of editImages; let i = index">
              <img [src]="toApiUrl(img)" alt="car photo" />
              <div class="actions">
                <button class="btn" type="button" (click)="setCover(i)">{{ 'admin.edit.setCover' | translate }}</button>
                <button class="btn" type="button" (click)="moveImage(i, -1)" [disabled]="i===0">{{ 'common.up' | translate }}</button>
                <button class="btn" type="button" (click)="moveImage(i, 1)" [disabled]="i===editImages.length-1">{{ 'common.down' | translate }}</button>
                <button class="btn danger" type="button" (click)="removeImage(i)">{{ 'common.remove' | translate }}</button>
              </div>
            </div>
          </div>

          <h4>{{ 'admin.edit.calendarControl' | translate }}</h4>
          <div class="date-tools">
            <input type="date" [(ngModel)]="selectedBlockedFromDate" name="selectedBlockedFromDate" />
            <input type="date" [(ngModel)]="selectedBlockedToDate" name="selectedBlockedToDate" />
            <input [(ngModel)]="blockedReason" name="blockedReason" [placeholder]="'admin.edit.reasonOptional' | translate" />
            <button class="btn" type="button" (click)="addBlockedDateRange()">{{ 'admin.edit.markBusyRange' | translate }}</button>
          </div>
          <div class="blocked-list">
            <div class="blocked-item" *ngFor="let b of blockedDates">
              <span>{{ b.blocked_date }} {{ b.reason ? '- ' + b.reason : '' }}</span>
              <button class="btn danger" type="button" (click)="removeBlockedDate(b.id)">{{ 'common.remove' | translate }}</button>
            </div>
          </div>

          <div class="actions">
            <button class="btn" type="submit">{{ 'common.saveChanges' | translate }}</button>
            <button class="btn danger" type="button" (click)="closeEditCar()">{{ 'common.close' | translate }}</button>
          </div>
        </form>
      </div>
    </section>

    <section *ngIf="tab === 'available'">
      <h3>{{ 'admin.available.title' | translate }}</h3>
      <div class="date-tools">
        <label>{{ 'common.date' | translate }}:</label>
        <input type="date" [(ngModel)]="availabilityDate" name="availabilityDate" />
        <button class="btn" (click)="loadAvailableCars()">{{ 'common.check' | translate }}</button>
      </div>
      <div *ngIf="availableCars.length === 0">{{ 'admin.available.empty' | translate }}</div>
      <div class="car-grid">
        <div *ngFor="let car of availableCars" class="card">
          <img *ngIf="car.image" [src]="toApiUrl(car.image)" alt="car" />
          <p><b>#{{ car.id }}</b> {{ car.brand }} {{ car.model }}</p>
          <p>{{ car.price_per_day }} ₸ / {{ 'common.day' | translate }}</p>
        </div>
      </div>
    </section>

    <section *ngIf="tab === 'home'">
      <h3>Home page content</h3>
      <form class="form" (ngSubmit)="saveHomepageContent()">
        <h4>Quick search</h4>
        <input [(ngModel)]="homepageForm.quick_search.title" name="qs_title" placeholder="Quick search title" />
        <input [(ngModel)]="quickSearchLocationsText" name="qs_locations" placeholder="Locations (comma separated)" />
        <input [(ngModel)]="quickSearchTypesText" name="qs_types" placeholder="Car types (comma separated)" />
        <input [(ngModel)]="homepageForm.quick_search.button_text" name="qs_button" placeholder="Search button text" />

        <h4>Popular cars</h4>
        <input [(ngModel)]="homepageForm.popular.title" name="popular_title" placeholder="Popular section title" />
        <input [(ngModel)]="homepageForm.popular.button_text" name="popular_button" placeholder="View all button text" />
        <div class="range-row">
          <select [(ngModel)]="popularCarIds[0]" name="popular_1">
            <option [ngValue]="null">Select car #1</option>
            <option *ngFor="let car of cars" [ngValue]="car.id">#{{ car.id }} {{ car.brand }} {{ car.model }}</option>
          </select>
          <select [(ngModel)]="popularCarIds[1]" name="popular_2">
            <option [ngValue]="null">Select car #2</option>
            <option *ngFor="let car of cars" [ngValue]="car.id">#{{ car.id }} {{ car.brand }} {{ car.model }}</option>
          </select>
          <select [(ngModel)]="popularCarIds[2]" name="popular_3">
            <option [ngValue]="null">Select car #3</option>
            <option *ngFor="let car of cars" [ngValue]="car.id">#{{ car.id }} {{ car.brand }} {{ car.model }}</option>
          </select>
        </div>

        <h4>Why choose TYRE</h4>
        <input [(ngModel)]="homepageForm.why_choose.title" name="why_title" placeholder="Section title" />
        <div class="form" *ngFor="let item of homepageForm.why_choose.items; let i = index">
          <input [(ngModel)]="item.icon" [name]="'why_icon_' + i" placeholder="Icon (emoji)" />
          <input [(ngModel)]="item.title" [name]="'why_item_title_' + i" placeholder="Title" />
          <input [(ngModel)]="item.description" [name]="'why_item_desc_' + i" placeholder="Description" />
        </div>

        <h4>How it works</h4>
        <input [(ngModel)]="homepageForm.how_it_works.title" name="how_title" placeholder="Section title" />
        <div class="form" *ngFor="let step of homepageForm.how_it_works.steps; let i = index">
          <input [(ngModel)]="step.title" [name]="'how_step_title_' + i" placeholder="Step title" />
          <input [(ngModel)]="step.description" [name]="'how_step_desc_' + i" placeholder="Step description" />
        </div>

        <h4>Social section</h4>
        <input [(ngModel)]="homepageForm.social.title" name="social_title" placeholder="Social section title" />
        <input type="file" multiple accept="video/*" (change)="onSocialVideos($event)" />
        <label class="replace-toggle">
          <input type="checkbox" [(ngModel)]="replaceSocialVideosOnUpload" name="replaceSocialVideosOnUpload" />
          Replace all social videos
        </label>
        <button class="btn" type="button" (click)="uploadSocialVideos()" [disabled]="uploadingSocialVideos || selectedSocialVideos.length === 0">
          {{ uploadingSocialVideos ? ('common.uploading' | translate) : 'Upload social videos' }}
        </button>
        <div class="home-videos-grid" *ngIf="socialVideos.length > 0">
          <article *ngFor="let item of socialVideos; let i = index">
            <video
              [src]="toApiUrl(item.video_url)"
              autoplay
              muted
              loop
              playsinline
              preload="metadata"
              (loadedmetadata)="silenceVideo($event)"
            ></video>
            <input [(ngModel)]="item.link_url" [name]="'social_link_' + i" placeholder="Video link URL (Instagram/Threads/TikTok)" />
            <div class="actions">
              <button class="btn" type="button" (click)="moveSocialVideo(i, -1)" [disabled]="i === 0">{{ 'common.up' | translate }}</button>
              <button class="btn" type="button" (click)="moveSocialVideo(i, 1)" [disabled]="i === socialVideos.length - 1">{{ 'common.down' | translate }}</button>
              <button class="btn danger" type="button" (click)="removeSocialVideo(item.video_url)">{{ 'common.remove' | translate }}</button>
            </div>
          </article>
        </div>

        <h4>Reviews</h4>
        <input [(ngModel)]="homepageForm.reviews.title" name="reviews_title" placeholder="Reviews title" />
        <div class="form" *ngFor="let review of homepageForm.reviews.items; let i = index">
          <input [(ngModel)]="review.name" [name]="'review_name_' + i" placeholder="Customer name" />
          <input [(ngModel)]="review.rating" [name]="'review_rating_' + i" type="number" min="1" max="5" placeholder="Rating 1-5" />
          <textarea [(ngModel)]="review.text" [name]="'review_text_' + i" placeholder="Review text"></textarea>
        </div>

        <h4>CTA</h4>
        <input [(ngModel)]="homepageForm.cta.title" name="cta_title" placeholder="CTA title" />
        <input [(ngModel)]="homepageForm.cta.subtitle" name="cta_subtitle" placeholder="CTA subtitle" />
        <input [(ngModel)]="homepageForm.cta.button_text" name="cta_button_text" placeholder="CTA button text" />
        <input [(ngModel)]="homepageForm.cta.button_link" name="cta_button_link" placeholder="CTA button link" />

        <button class="btn" type="submit">Save Home page content</button>
      </form>
    </section>
  `,
  styles: [
    `
      .tabs { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 14px; }
      .table { border-collapse: collapse; width: 100%; margin-bottom: 16px; background: var(--panel); color: var(--text); }
      .table td, .table th { border: 1px solid var(--border); padding: 8px; }
      .card {
        background: var(--panel);
        color: var(--text);
        border-radius: 18px;
        padding: 12px;
        margin-bottom: 12px;
        box-shadow: 0 10px 26px rgba(0,0,0,0.45);
        border: 1px solid var(--border);
      }
      .actions { display: flex; gap: 8px; flex-wrap: wrap; }
      .links { display: flex; gap: 14px; margin-bottom: 8px; }
      .form {
        display: grid;
        gap: 8px;
        max-width: 760px;
        margin-bottom: 14px;
        background: var(--panel);
        color: var(--text);
        padding: 14px;
        border-radius: 18px;
        border: 1px solid var(--border);
        box-shadow: 0 10px 26px rgba(0,0,0,0.45);
      }
      .car-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(220px,1fr)); gap: 10px; }
      img { width: 100%; height: 170px; object-fit: cover; border-radius: 10px; margin-bottom: 8px; }
      .danger { background: #b91c1c; }
      .date-tools { display: flex; gap: 8px; align-items: center; margin-bottom: 12px; }
      .editor {
        background: var(--panel-2);
        border: 1px solid var(--border);
        border-radius: 18px;
        padding: 14px;
        margin-top: 10px;
        box-shadow: 0 10px 26px rgba(0,0,0,0.5);
      }
      .photo-list { display: grid; grid-template-columns: repeat(auto-fit,minmax(180px,1fr)); gap: 10px; }
      .photo-item { background: var(--panel); border-radius: 12px; padding: 8px; border: 1px solid var(--border); }
      .blocked-list { display: grid; gap: 6px; }
      .blocked-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: var(--panel);
        border-radius: 10px;
        padding: 8px 10px;
        border: 1px solid var(--border);
      }
      .home-videos-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(220px,1fr)); gap: 10px; }
      .home-videos-grid video { width: 100%; height: 180px; object-fit: cover; border-radius: 10px; background: #0f172a; }
      .replace-toggle { display: flex; align-items: center; gap: 8px; }
      .active-tab { box-shadow: inset 0 0 0 2px rgba(16,185,129,0.8); }
    `,
  ],
})
export class AdminPanelPageComponent implements OnInit {
  tab: 'catalog' | 'available' | 'home' = 'catalog';
  videoSection: 'home' | 'about' = 'home';
  cars: any[] = [];
  availableCars: any[] = [];
  availabilityDate = this.dateIso(new Date());
  selectedCarImages: File[] = [];
  selectedSectionVideos: File[] = [];
  homeVideos: string[] = [];
  aboutVideos: string[] = [];
  replaceVideosOnUpload = false;
  uploadingVideos = false;
  selectedSocialVideos: File[] = [];
  socialVideos: Array<{ video_url: string; link_url: string }> = [];
  replaceSocialVideosOnUpload = false;
  uploadingSocialVideos = false;
  quickSearchLocationsText = '';
  quickSearchTypesText = '';
  popularCarIds: Array<number | null> = [null, null, null];
  homepageForm: any = {
    quick_search: { title: '', locations: ['Almaty'], car_types: ['SUV', 'Sedan', 'Premium'], button_text: 'Search Car' },
    popular: { title: 'Popular Cars', car_ids: [], button_text: 'View all cars' },
    why_choose: { title: 'Why choose TYRE?', items: [] },
    how_it_works: { title: 'How it works', steps: [] },
    social: { title: 'Follow TYRE on Instagram' },
    reviews: { title: 'Customer Reviews', items: [] },
    cta: { title: 'Need a car today?', subtitle: 'Book now via WhatsApp', button_text: 'Book now', button_link: '' },
  };
  savingCar = false;

  editingCar: any = null;
  editImages: string[] = [];
  editSelectedImages: File[] = [];
  uploadingEditImages = false;
  blockedDates: any[] = [];
  selectedBlockedFromDate = this.dateIso(new Date());
  selectedBlockedToDate = this.dateIso(new Date());
  blockedReason = '';
  editForm: any = {
    price_per_day: 0,
    deposit: 0,
    seats: 5,
    horsepower: null,
    engine: '',
    car_type: '',
    drive: '',
    acceleration: '',
    color: '',
    interior_color: '',
    max_speed: '',
    transmission: '',
    consumption: '',
    year: new Date().getFullYear(),
    description: '',
    status: 'available',
  };

  carForm: any = {
    brand: '',
    model: '',
    year: 2024,
    price_per_day: 0,
    deposit: 0,
    transmission: 'automatic',
    fuel_type: 'petrol',
    seats: 5,
    horsepower: null,
    engine: '',
    car_type: '',
    drive: '',
    acceleration: '',
    color: '',
    interior_color: '',
    max_speed: '',
    consumption: '',
    description: '',
    images: '',
    status: 'available',
  };

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    this.loadAll();
    this.loadAvailableCars();
  }

  dateIso(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  loadAll(): void {
    this.api.getCars().subscribe((res) => (this.cars = res));
    this.api.getHomeVideosAdmin().subscribe((res) => (this.homeVideos = (res.videos || []).slice(0, 3)));
    this.api.getAboutVideosAdmin().subscribe((res) => (this.aboutVideos = (res.videos || []).slice(0, 3)));
    this.api.getSocialVideosAdmin().subscribe((res) => (this.socialVideos = (res.items || []).slice(0, 3)));
    this.api.getHomepageContentAdmin().subscribe((res) => {
      this.homepageForm = {
        ...this.homepageForm,
        ...res,
      };
      this.quickSearchLocationsText = (this.homepageForm.quick_search?.locations || []).join(', ');
      this.quickSearchTypesText = (this.homepageForm.quick_search?.car_types || []).join(', ');
      const ids = (this.homepageForm.popular?.car_ids || []).slice(0, 3);
      this.popularCarIds = [ids[0] || null, ids[1] || null, ids[2] || null];
      if (!Array.isArray(this.homepageForm.why_choose?.items) || this.homepageForm.why_choose.items.length === 0) {
        this.homepageForm.why_choose = {
          title: 'Why choose TYRE?',
          items: [
            { icon: '🚗', title: 'Premium cars', description: 'Only clean and new vehicles' },
            { icon: '📍', title: 'Multiple pickup points', description: 'Airport and city delivery' },
            { icon: '⚡', title: 'Fast booking', description: 'Confirm in WhatsApp in minutes' },
            { icon: '🛡', title: 'Full insurance', description: 'Safe and secure rental' },
          ],
        };
      }
      if (!Array.isArray(this.homepageForm.how_it_works?.steps) || this.homepageForm.how_it_works.steps.length === 0) {
        this.homepageForm.how_it_works = {
          title: 'How it works',
          steps: [
            { title: 'Choose your car', description: 'Browse our fleet' },
            { title: 'Book online', description: 'Select dates' },
            { title: 'Pick up car', description: 'Airport or office' },
            { title: 'Drive and enjoy', description: 'Explore Almaty' },
          ],
        };
      }
      if (!Array.isArray(this.homepageForm.reviews?.items) || this.homepageForm.reviews.items.length === 0) {
        this.homepageForm.reviews = {
          title: 'Customer Reviews',
          items: [
            { name: 'Alex', rating: 5, text: 'Great service and clean cars!' },
            { name: 'Maria', rating: 5, text: 'Very easy booking via WhatsApp' },
          ],
        };
      }
    });
  }

  loadAvailableCars(): void {
    this.api.getAdminAvailableCars(this.availabilityDate).subscribe((res) => (this.availableCars = res));
  }

  toApiUrl(path: string): string {
    if (!path) return '#';
    if (path.startsWith('http')) return path;
    return `${environment.apiUrl}${path}`;
  }

  silenceVideo(event: Event): void {
    const video = event.target as HTMLVideoElement | null;
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;
  }

  onCarImages(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.selectedCarImages = Array.from(target.files || []);
  }

  get currentVideos(): string[] {
    return this.videoSection === 'home' ? this.homeVideos : this.aboutVideos;
  }

  onSectionVideos(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.selectedSectionVideos = Array.from(target.files || []).slice(0, 3);
  }

  uploadSectionVideos(): void {
    if (this.selectedSectionVideos.length === 0) return;
    this.uploadingVideos = true;
    const req =
      this.videoSection === 'home'
        ? this.api.uploadHomeVideos(this.selectedSectionVideos, this.replaceVideosOnUpload)
        : this.api.uploadAboutVideos(this.selectedSectionVideos, this.replaceVideosOnUpload);

    req.subscribe({
      next: (res) => {
        if (this.videoSection === 'home') {
          this.homeVideos = (res.videos || []).slice(0, 3);
        } else {
          this.aboutVideos = (res.videos || []).slice(0, 3);
        }
        this.selectedSectionVideos = [];
        this.replaceVideosOnUpload = false;
        this.uploadingVideos = false;
      },
      error: () => {
        this.uploadingVideos = false;
      },
    });
  }

  moveSectionVideo(index: number, delta: number): void {
    const source = this.currentVideos;
    const nextIndex = index + delta;
    if (nextIndex < 0 || nextIndex >= source.length) return;
    const copy = [...source];
    const [moved] = copy.splice(index, 1);
    copy.splice(nextIndex, 0, moved);
    this.saveSectionVideoOrder(copy);
  }

  setSectionVideoCover(index: number): void {
    const source = this.currentVideos;
    if (index < 0 || index >= source.length) return;
    const copy = [...source];
    const [first] = copy.splice(index, 1);
    copy.unshift(first);
    this.saveSectionVideoOrder(copy);
  }

  removeSectionVideo(videoUrl: string): void {
    const req = this.videoSection === 'home' ? this.api.deleteHomeVideo(videoUrl) : this.api.deleteAboutVideo(videoUrl);
    req.subscribe((res) => {
      if (this.videoSection === 'home') {
        this.homeVideos = (res.videos || []).slice(0, 3);
      } else {
        this.aboutVideos = (res.videos || []).slice(0, 3);
      }
    });
  }

  private saveSectionVideoOrder(videos: string[]): void {
    const req = this.videoSection === 'home' ? this.api.reorderHomeVideos(videos) : this.api.reorderAboutVideos(videos);
    req.subscribe((res) => {
      if (this.videoSection === 'home') {
        this.homeVideos = (res.videos || []).slice(0, 3);
      } else {
        this.aboutVideos = (res.videos || []).slice(0, 3);
      }
    });
  }

  createCar(): void {
    this.savingCar = true;
    const finishCreate = (images: string[]) => {
      const payload = {
        ...this.carForm,
        description: this.carForm.description,
        description_en: this.carForm.description_en,
        description_ru: this.carForm.description_ru,
        description_kk: this.carForm.description_kk,
        description_zh: this.carForm.description_zh,
        images: images.join(','),
      };
      this.api.createCar(payload).subscribe({
        next: () => {
          this.savingCar = false;
          this.selectedCarImages = [];
          this.carForm = {
            brand: '', model: '', year: 2024, price_per_day: 0, deposit: 0,
            transmission: 'automatic', fuel_type: 'petrol', seats: 5,
            horsepower: null, engine: '', car_type: '', drive: '', acceleration: '',
            color: '', interior_color: '', max_speed: '', consumption: '',
            description: '', description_en: '', description_ru: '', description_kk: '', description_zh: '', images: '', status: 'available',
          };
          this.loadAll();
          this.loadAvailableCars();
        },
        error: () => (this.savingCar = false),
      });
    };

    if (this.selectedCarImages.length === 0) {
      finishCreate([]);
      return;
    }

    this.api.uploadCarImages(this.selectedCarImages).subscribe({
      next: (res) => finishCreate(res.images || []),
      error: () => (this.savingCar = false),
    });
  }

  openEditCar(car: any): void {
    this.editingCar = car;
    this.editForm = {
      price_per_day: car.price_per_day,
      deposit: car.deposit,
      seats: car.seats,
      horsepower: car.horsepower,
      engine: car.engine || '',
      car_type: car.car_type || '',
      drive: car.drive || '',
      acceleration: car.acceleration || '',
      color: car.color || '',
      interior_color: car.interior_color || '',
      max_speed: car.max_speed || '',
      transmission: car.transmission || '',
      consumption: car.consumption || '',
      year: car.year,
    description: car.description || '',
    description_en: car.description_en || '',
    description_ru: car.description_ru || '',
    description_kk: car.description_kk || '',
    description_zh: car.description_zh || '',
      status: car.status,
    };
    this.editImages = (car.images || '').split(',').filter(Boolean);
    this.editSelectedImages = [];
    this.selectedBlockedFromDate = this.dateIso(new Date());
    this.selectedBlockedToDate = this.dateIso(new Date());
    this.blockedReason = '';
    this.loadBlockedDates();
  }

  closeEditCar(): void {
    this.editingCar = null;
    this.editImages = [];
    this.editSelectedImages = [];
    this.blockedDates = [];
  }

  loadBlockedDates(): void {
    if (!this.editingCar) return;
    const from = this.dateIso(new Date());
    const to = this.dateIso(new Date(Date.now() + 1000 * 60 * 60 * 24 * 62));
    this.api.getCarBlockedDates(this.editingCar.id, from, to).subscribe((res) => (this.blockedDates = res));
  }

  addBlockedDateRange(): void {
    if (!this.editingCar || !this.selectedBlockedFromDate || !this.selectedBlockedToDate) return;
    this.api
      .addCarBlockedDate(
        this.editingCar.id,
        this.selectedBlockedFromDate,
        this.selectedBlockedToDate,
        this.blockedReason || undefined
      )
      .subscribe(() => {
      this.blockedReason = '';
      this.loadBlockedDates();
      this.loadAvailableCars();
    });
  }

  removeBlockedDate(blockedId: number): void {
    if (!this.editingCar) return;
    this.api.removeCarBlockedDate(this.editingCar.id, blockedId).subscribe(() => {
      this.loadBlockedDates();
      this.loadAvailableCars();
    });
  }

  onEditImages(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.editSelectedImages = Array.from(target.files || []);
  }

  uploadEditImages(): void {
    if (this.editSelectedImages.length === 0) return;
    this.uploadingEditImages = true;
    this.api.uploadCarImages(this.editSelectedImages).subscribe({
      next: (res) => {
        this.editImages = [...this.editImages, ...(res.images || [])];
        this.editSelectedImages = [];
        this.uploadingEditImages = false;
      },
      error: () => (this.uploadingEditImages = false),
    });
  }

  moveImage(index: number, delta: number): void {
    const newIndex = index + delta;
    if (newIndex < 0 || newIndex >= this.editImages.length) return;
    const copy = [...this.editImages];
    const [moved] = copy.splice(index, 1);
    copy.splice(newIndex, 0, moved);
    this.editImages = copy;
  }

  setCover(index: number): void {
    if (index < 0 || index >= this.editImages.length) return;
    const copy = [...this.editImages];
    const [cover] = copy.splice(index, 1);
    copy.unshift(cover);
    this.editImages = copy;
  }

  removeImage(index: number): void {
    this.editImages = this.editImages.filter((_, i) => i !== index);
  }

  saveEditCar(): void {
    if (!this.editingCar) return;
    const payload = {
      price_per_day: Number(this.editForm.price_per_day),
      deposit: Number(this.editForm.deposit),
      seats: this.editForm.seats ? Number(this.editForm.seats) : undefined,
      horsepower: this.editForm.horsepower ? Number(this.editForm.horsepower) : null,
      engine: this.editForm.engine || null,
      car_type: this.editForm.car_type || null,
      drive: this.editForm.drive || null,
      acceleration: this.editForm.acceleration || null,
      color: this.editForm.color || null,
      interior_color: this.editForm.interior_color || null,
      max_speed: this.editForm.max_speed || null,
      transmission: this.editForm.transmission || null,
      consumption: this.editForm.consumption || null,
      year: this.editForm.year ? Number(this.editForm.year) : undefined,
    description: this.editForm.description,
    description_en: this.editForm.description_en,
    description_ru: this.editForm.description_ru,
    description_kk: this.editForm.description_kk,
    description_zh: this.editForm.description_zh,
      status: this.editForm.status,
      images: this.editImages.join(','),
    };
    this.api.updateCar(this.editingCar.id, payload).subscribe(() => {
      this.closeEditCar();
      this.loadAll();
      this.loadAvailableCars();
    });
  }

  setAvailable(id: number, status: 'available' | 'unavailable'): void {
    this.api.updateCar(id, { status }).subscribe(() => {
      this.loadAll();
      this.loadAvailableCars();
    });
  }

  deleteCar(id: number): void {
    this.api.deleteCar(id).subscribe(() => {
      this.loadAll();
      this.loadAvailableCars();
    });
  }

  onSocialVideos(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.selectedSocialVideos = Array.from(target.files || []).slice(0, 3);
  }

  uploadSocialVideos(): void {
    if (this.selectedSocialVideos.length === 0) return;
    this.uploadingSocialVideos = true;
    this.api.uploadSocialVideos(this.selectedSocialVideos, this.replaceSocialVideosOnUpload).subscribe({
      next: (res) => {
        this.socialVideos = (res.items || []).slice(0, 3);
        this.selectedSocialVideos = [];
        this.replaceSocialVideosOnUpload = false;
        this.uploadingSocialVideos = false;
      },
      error: () => {
        this.uploadingSocialVideos = false;
      },
    });
  }

  moveSocialVideo(index: number, delta: number): void {
    const nextIndex = index + delta;
    if (nextIndex < 0 || nextIndex >= this.socialVideos.length) return;
    const copy = [...this.socialVideos];
    const [moved] = copy.splice(index, 1);
    copy.splice(nextIndex, 0, moved);
    this.saveSocialVideos(copy);
  }

  removeSocialVideo(videoUrl: string): void {
    this.api.deleteSocialVideo(videoUrl).subscribe((res) => {
      this.socialVideos = (res.items || []).slice(0, 3);
    });
  }

  private saveSocialVideos(items: Array<{ video_url: string; link_url: string }>): void {
    this.api.updateSocialVideos(items).subscribe((res) => {
      this.socialVideos = (res.items || []).slice(0, 3);
    });
  }

  saveHomepageContent(): void {
    const locations = this.quickSearchLocationsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const carTypes = this.quickSearchTypesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      ...this.homepageForm,
      quick_search: {
        ...this.homepageForm.quick_search,
        locations: locations.length ? locations : ['Almaty'],
        car_types: carTypes.length ? carTypes : ['SUV', 'Sedan', 'Premium'],
      },
      popular: {
        ...this.homepageForm.popular,
        car_ids: this.popularCarIds.filter((id): id is number => typeof id === 'number'),
      },
    };

    this.api.updateHomepageContent(payload).subscribe(() => {
      this.saveSocialVideos(this.socialVideos);
      this.loadAll();
    });
  }
}
