import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule],
  template: `
    <aside class="sidebar" [class.open]="isOpen">
      <div class="sidebar-header">
        <span class="brand">TYRE</span>
        <button type="button" class="close-btn" (click)="closeMenu()" aria-label="Close menu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <nav class="menu-nav">
        <ul>
          <li>
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="menu-item" (click)="closeMenu()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <path d="M9 22V12h6v10"/>
              </svg>
              <span>{{ 'nav.home' | translate }}</span>
            </a>
          </li>
          <li>
            <a routerLink="/cars" routerLinkActive="active" class="menu-item" (click)="closeMenu()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 17h14v-5H5v5zM5 12V7h14v5"/>
                <path d="M4 12h2M18 12h2"/>
              </svg>
              <span>{{ 'nav.cars' | translate }}</span>
            </a>
          </li>
          <li>
            <a routerLink="/about-us" routerLinkActive="active" class="menu-item" (click)="closeMenu()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4M12 8h.01"/>
              </svg>
              <span>{{ 'nav.aboutUs' | translate }}</span>
            </a>
          </li>
        </ul>
      </nav>

      <div class="menu-lang">
        <label class="lang-label">{{ 'nav.language' | translate }}</label>
        <select class="lang-select" [value]="selectedLang" (change)="langChange.emit($any($event.target).value)">
          <option value="en">EN</option>
          <option value="kk">KZ</option>
          <option value="ru">RU</option>
          <option value="zh">中文</option>
        </select>
      </div>

      <div class="menu-footer">
        <p>{{ 'footer.tagline' | translate }}</p>
      </div>
    </aside>
  `,
  styles: [
    `
      .sidebar {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        width: 280px;
        background: linear-gradient(180deg, #0f0f11 0%, #09090b 100%);
        border-right: 1px solid #27272a;
        z-index: 100;
        display: flex;
        flex-direction: column;
        transform: translateX(-100%);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }

      .sidebar.open {
        transform: translateX(0);
        box-shadow: 8px 0 32px rgba(0, 0, 0, 0.4);
      }

      .sidebar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid #27272a;
      }

      .brand {
        font-family: 'Unbounded', sans-serif;
        font-weight: 800;
        font-size: 1.5rem;
        letter-spacing: 0.02em;
        color: #10b981;
      }

      .close-btn {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        border: 1px solid #27272a;
        background: #18181b;
        color: #f5f5f5;
        cursor: pointer;
        display: grid;
        place-items: center;
        transition: background 0.2s, border-color 0.2s;
      }

      .close-btn:hover {
        background: #27272a;
        border-color: #3f3f46;
      }

      .close-btn svg {
        width: 20px;
        height: 20px;
      }

      .menu-nav {
        flex: 1;
        padding: 1.5rem;
        overflow-y: auto;
      }

      .menu-nav ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .menu-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        font-size: 1.125rem;
        text-decoration: none;
        padding: 0.625rem 1rem;
        border-radius: 12px;
        transition: all 0.3s ease;
        color: inherit;
      }

      .menu-item svg {
        color: #f5f5f5;
        flex-shrink: 0;
        width: 22px;
        height: 22px;
      }

      .menu-item span {
        color: #10b981;
        font-family: 'Unbounded', sans-serif;
        font-weight: 500;
        transition: color 0.2s;
      }

      .menu-item:hover:not(.active) {
        transform: translateX(4px);
        background: rgba(39, 39, 42, 0.6);
      }

      .menu-item:hover:not(.active) span {
        color: #059669;
      }

      .menu-item.active {
        background-color: #3d3d3d;
        font-weight: 600;
      }

      .menu-item.active span {
        color: #10b981;
      }

      .menu-lang {
        padding: 1rem 1.5rem;
        border-top: 1px solid #27272a;
      }

      .lang-label {
        display: block;
        font-size: 0.75rem;
        font-weight: 600;
        color: #71717b;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 0.5rem;
      }

      .lang-select {
        width: 100%;
        height: 44px;
        border-radius: 12px;
        border: 1px solid #27272a;
        background: #18181b;
        color: #f5f5f5;
        padding: 0 12px;
        font-size: 0.9375rem;
        cursor: pointer;
      }

      .lang-select:focus {
        outline: none;
        border-color: #10b981;
        box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.25);
      }

      .menu-footer {
        padding: 1.25rem 1.5rem;
        border-top: 1px solid #3d3d3d;
      }

      .menu-footer p {
        text-align: center;
        font-size: 0.875rem;
        color: #9ca3af;
        margin: 0;
      }

      @media (min-width: 1024px) {
        .sidebar.open {
          box-shadow: none;
        }
      }
    `,
  ],
})
export class MenuComponent {
  @Input() isOpen = false;
  @Input() selectedLang = 'en';
  @Output() langChange = new EventEmitter<string>();
  @Output() closed = new EventEmitter<void>();

  closeMenu(): void {
    this.closed.emit();
  }
}
