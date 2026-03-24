import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { environment } from '../../environments/environment';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-about-us-page',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
  <div class="about-container">

  <section>
    <section>
      <h3>{{ 'home.aboutUsTitle' | translate }}</h3>
      <p>{{ 'home.aboutUsSubtitle' | translate }}</p>
      <div class="about-videos">
        <article *ngFor="let video of sectionVideos">
          <video
            [src]="toApiUrl(video)"
            autoplay
            muted
            loop
            playsinline
            preload="metadata"
            (loadedmetadata)="silenceVideo($event)"
          ></video>
        </article>
        <article class="video-placeholder" *ngFor="let _ of placeholders">
          <span>{{ 'home.videoComingSoon' | translate }}</span>
        </article>
      </div>
    </section>

    <section class="about-grid">
      <article>
        <h3>{{ 'about.block1Title' | translate }}</h3>
        <p>{{ 'about.block1Text' | translate }}</p>
      </article>
      <article>
        <h3>{{ 'about.block2Title' | translate }}</h3>
        <p>{{ 'about.block2Text' | translate }}</p>
      </article>
      <article>
        <h3>{{ 'about.block3Title' | translate }}</h3>
        <p>{{ 'about.block3Text' | translate }}</p>
      </article>
    </section>

    <section class="map-section">
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
      <div class="pickup-points">
        <article>
          <h4>{{ 'home.officeTitle' | translate }}</h4>
          <p>{{ 'home.officeAddress' | translate }}</p>
        </article>
        <article>
          <h4>{{ 'home.airportTitle' | translate }}</h4>
          <p>{{ 'home.airportAddress' | translate }}</p>
        </article>
      </div>
    </section>
    </section>

   </div>
  `,
  styles: [
    `
      .about-container {
        width: min(1120px, 92vw);
        margin: 0 auto;
        padding: 0 4px;
      }
      .about-videos {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      }
      .about-videos article {
        padding: 0;
        overflow: hidden;
        border: 1px solid var(--border);
        border-radius: 14px;
        background: var(--panel);
        
      }
      .about-videos video {
        width: 100%;
        height: 240px;
        object-fit: cover;
        display: block;
        background: #0f172a;
      }
      .video-placeholder {
        min-height: 240px;
        display: grid;
        place-items: center;
        color: #73809a;
        font-weight: 600;
      }
      .map-section {
        margin-top: 14px;
      }
      .map-wrap {
        margin-top: 10px;
        border-radius: 14px;
        overflow: hidden;
        border: 1px solid #d8deea;
        box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
      }
      .map-wrap iframe {
        width: 100%;
        height: 360px;
        border: 0;
      }
      .pickup-points {
        margin-top: 12px;
        display: grid;
        gap: 10px;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      }
      .pickup-points article {
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 12px;
      }
      .pickup-points h4 {
        margin: 0 0 6px;
      }
      .pickup-points p {
        margin: 0;
        color: #4f5b71;
      }
      .about-grid {
        margin-top: 16px;
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      }
      .about-grid article {
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 14px;
      }
      .about-grid h3 {
        margin: 0 0 6px;
      }
      .about-grid p {
        margin: 0;
        color: #4f5c73;
      }
    `,
  ],
})
export class AboutUsPageComponent implements OnInit {
  sectionVideos: string[] = [];

  constructor(private readonly api: ApiService) {}

  get placeholders(): number[] {
    const missing = Math.max(0, 3 - this.sectionVideos.length);
    return Array.from({ length: missing }, (_, i) => i);
  }

  ngOnInit(): void {
    this.api.getHomeVideosPublic().subscribe((res) => {
      this.sectionVideos = (res.videos || []).slice(0, 3);
    });
  }

  toApiUrl(path?: string): string {
    if (!path) return '';
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
}
