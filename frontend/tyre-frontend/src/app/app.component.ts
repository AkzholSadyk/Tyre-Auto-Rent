import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { MenuComponent } from './components/menu.component';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, TranslateModule, MenuComponent],
  template: `
    <div class="app-layout" [class.menu-open]="menuOpen">
      <app-menu
        [isOpen]="menuOpen"
        [selectedLang]="selectedLang"
        (langChange)="setLang($event)"
        (closed)="menuOpen = false"
      />

      <div class="overlay" *ngIf="menuOpen" (click)="menuOpen = false" role="button" tabindex="-1" aria-label="Close menu"></div>

      <header class="topbar">
      <button type="button" class="menu-toggle" (click)="menuOpen = true" aria-label="Open menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <span class="topbar-title">TYRE</span>
    </header>

    <div class="main-wrap">
      <main class="page-shell">
        <router-outlet></router-outlet>
      </main>

      <footer class="site-footer">
        <div class="container footer-grid">
          <section class="footer-brand-col">
            <h4>{{ 'footer.brand' | translate }}</h4>
            <p>{{ 'footer.tagline' | translate }}</p>
            <a class="btn" [href]="whatsAppUrl" target="_blank" rel="noopener">
              {{ 'footer.partnership' | translate }}
            </a>
          </section>
          <section>
            <h4>{{ 'footer.social' | translate }}</h4>
            <div class="social-icons">
              <a href="https://www.instagram.com/tyreautorent/" target="_blank" rel="noopener" aria-label="Instagram">
                <img src="https://cdn.simpleicons.org/instagram/ffffff" alt="Instagram" />
              </a>
              <a href="https://www.threads.com/@tyreautorent?xmt=AQF0ZhZhK0mFkmhgQEoNcQqPV6fADe6tN3xCKDHdoHSMOIE" target="_blank" rel="noopener" aria-label="Threads">
                <img src="https://cdn.simpleicons.org/threads/ffffff" alt="Threads" />
              </a>
              <a href="https://www.tiktok.com/@tyreautorent?_r=1&_t=ZS-94YYhMvi8qW" target="_blank" rel="noopener" aria-label="TikTok">
                <img src="https://cdn.simpleicons.org/tiktok/ffffff" alt="TikTok" />
              </a>
              <a [href]="whatsAppUrl" target="_blank" rel="noopener" aria-label="WhatsApp">
                <img src="https://cdn.simpleicons.org/whatsapp/ffffff" alt="WhatsApp" />
              </a>
            </div>
          </section>
          <section>
            <h4>{{ 'footer.quickLinks' | translate }}</h4>
            <div class="footer-links">
              <a routerLink="">{{ 'nav.home' | translate }}</a>
              <a routerLink="/cars">{{ 'nav.cars' | translate }}</a>
              <a routerLink="/about-us">{{ 'nav.aboutUs' | translate }}</a>
            </div>
          </section>
          <section>
            <h4>{{ 'footer.contact' | translate }}</h4>
            <p>{{ 'footer.addressLine1' | translate }}</p>
            <p>{{ 'footer.addressLine2' | translate }}</p>
            <p>{{ 'footer.support' | translate }}</p>
            <p><a [href]="whatsAppUrl" target="_blank" rel="noopener">+7 706 675 06 33</a></p>
          </section>
          <section>
            <h4>{{ 'footer.workingHours' | translate }}</h4>
            <p>{{ 'footer.hoursWeekdays' | translate }}</p>
          </section>
        </div>
        <div class="container footer-bottom">
          <span>{{ 'footer.copyright' | translate }}</span>
          <div class="footer-bottom-links">
            <a href="#">{{ 'footer.privacyPolicy' | translate }}</a>
            <a href="#">{{ 'footer.termsOfService' | translate }}</a>
          </div>
        </div>
      </footer>
    </div>

      <a class="wa-float" [href]="whatsAppUrl" target="_blank" rel="noopener" aria-label="WhatsApp">
        <svg viewBox="0 0 32 32" aria-hidden="true">
          <path d="M16 3.2A12.8 12.8 0 0 0 4.9 22.5L3.2 28.8l6.5-1.7A12.8 12.8 0 1 0 16 3.2zm0 23.2c-1.9 0-3.6-.5-5.1-1.4l-.4-.2-3.9 1 1-3.8-.2-.4A10.4 10.4 0 1 1 16 26.4zm5.7-7.8c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2s-.8 1-1 1.2c-.2.2-.4.2-.7.1-2-.9-3.3-2.9-3.4-3.1-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.4.3-.6.1-.2 0-.4 0-.6l-1-2.4c-.2-.5-.5-.4-.7-.4h-.6c-.2 0-.6.1-.9.4-.3.4-1.2 1.1-1.2 2.8s1.2 3.2 1.4 3.4c.2.2 2.4 3.7 5.9 5.1.8.3 1.5.5 2 .6.9.3 1.8.3 2.5.2.8-.1 2.3-.9 2.6-1.8.3-.9.3-1.7.2-1.8-.1-.1-.3-.2-.6-.4z"/>
        </svg>
      </a>
    </div>
  `,
  styles: [
    `
      :host {
        min-height: 100dvh;
        display: flex;
        flex-direction: column;
      }

      .app-layout {
        min-height: 100dvh;
        display: flex;
        flex-direction: column;
      }

      .overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        z-index: 90;
      }

      .topbar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 56px;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 0 1rem;
        background: rgba(9, 9, 11, 0.92);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid #27272a;
        z-index: 50;
        transition: left 0.3s ease;
      }
      @media (min-width: 1024px) {
        .app-layout.menu-open .topbar {
          left: 280px;
        }
      }

      .menu-toggle {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        border: 1px solid #27272a;
        background: #18181b;
        color: #f5f5f5;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 5px;
      }
      .menu-toggle span {
        width: 20px;
        height: 2px;
        background: currentColor;
        border-radius: 999px;
      }
      .menu-toggle:hover {
        background: #27272a;
        border-color: #3f3f46;
      }
      .topbar-title {
        font-family: 'Unbounded', sans-serif;
        font-weight: 800;
        font-size: 1.25rem;
        color: #10b981;
        letter-spacing: 0.02em;
      }

      .main-wrap {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 100dvh;
        margin-top: 56px;
        margin-left: 0;
        transition: margin-left 0.3s ease;
      }
      @media (min-width: 1024px) {
        .app-layout.menu-open .main-wrap {
          margin-left: 280px;
        }
      }

      .page-shell {
        flex: 1;
        padding: 1rem 0 28px;
      }
      .page-shell .container {
        width: min(1120px, 92vw);
        margin: 0 auto;
      }

      .container {
        width: min(1120px, 92vw);
        margin: 0 auto;
      }

      .site-footer {
        margin-top: auto;
        background: linear-gradient(180deg, rgba(18, 18, 20, 0.98), rgba(8, 8, 10, 0.98));
        border-top: 1px solid #27272a;
      }
      .footer-grid {
        padding: 24px 0 18px;
        display: grid;
        grid-template-columns: minmax(220px, 1.3fr) minmax(160px, 0.9fr) minmax(160px, 0.9fr) minmax(200px, 1fr) minmax(180px, 0.9fr);
        gap: 18px;
      }
      .footer-brand-col {
        max-width: 360px;
      }
      .site-footer h4 {
        margin: 0 0 10px;
        color: #ffffff;
      }
      .site-footer p {
        margin: 0 0 8px;
        color: #a1a1aa;
      }
      .site-footer .btn {
        margin-top: 8px;
      }
      .footer-links,
      .footer-bottom-links {
        display: grid;
        gap: 8px;
      }
      .footer-links a,
      .footer-bottom-links a {
        color: #a1a1aa;
        text-decoration: none;
      }
      .footer-links a:hover,
      .footer-bottom-links a:hover {
        color: #10b981;
      }
      .site-footer a[href^="https://wa"],
      .site-footer a[href^="http"] {
        color: #10b981;
      }
      .social-icons {
        display: flex;
        gap: 10px;
        margin: 0 0 12px;
        flex-wrap: wrap;
      }
      .social-icons a {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        border: 1px solid #27272a;
        background: #18181b;
        display: grid;
        place-items: center;
        transition: border-color 0.2s, background 0.2s;
      }
      .social-icons a:hover {
        border-color: #10b981;
        background: rgba(16, 185, 129, 0.12);
      }
      .social-icons img {
        width: 20px;
        height: 20px;
      }
      .footer-bottom {
        border-top: 1px solid #27272a;
        padding: 16px 0 22px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        color: #71717b;
      }
      .footer-bottom-links {
        display: flex;
        flex-wrap: wrap;
        gap: 18px;
      }
      .wa-float {
        position: fixed;
        right: 18px;
        bottom: 18px;
        width: 64px;
        height: 64px;
        border-radius: 999px;
        background: #10b981;
        box-shadow: 0 10px 22px rgba(16, 185, 129, 0.35);
        display: grid;
        place-items: center;
        z-index: 120;
        transition: transform 0.2s, background 0.2s;
      }
      .wa-float svg {
        width: 34px;
        height: 34px;
        fill: #ffffff;
      }
      .wa-float:hover {
        transform: translateY(-2px) scale(1.03);
        background: #059669;
      }
      @media (max-width: 1040px) {
        .footer-grid {
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        }
      }
      @media (max-width: 640px) {
        .footer-bottom {
          flex-direction: column;
          align-items: flex-start;
        }
      }
    `,
  ],
})
export class AppComponent {
  menuOpen = false;
  selectedLang = 'en';
  whatsAppUrl = environment.whatsappBookingUrl;

  constructor(private readonly translate: TranslateService) {
    this.translate.addLangs(['en', 'kk', 'ru', 'zh']);
    this.translate.setDefaultLang('en');
    const savedLang = localStorage.getItem('tyre_lang') || 'en';
    this.selectedLang = ['en', 'kk', 'ru', 'zh'].includes(savedLang) ? savedLang : 'en';
    this.translate.use(this.selectedLang);
  }

  setLang(lang: string): void {
    this.selectedLang = lang;
    localStorage.setItem('tyre_lang', lang);
    this.translate.use(lang);
  }
}
