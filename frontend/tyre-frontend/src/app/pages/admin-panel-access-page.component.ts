import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { AdminPanelPageComponent } from './admin-panel-page.component';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-admin-panel-access-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, AdminPanelPageComponent],
  template: `
    <section *ngIf="!authorized" class="login-wrap">
      <h2>{{ 'adminAccess.title' | translate }}</h2>
      <p>{{ 'adminAccess.subtitle' | translate }}</p>

      <form class="form" (ngSubmit)="submit()">
        <input [(ngModel)]="email" name="email" type="email" [placeholder]="'auth.email' | translate" required />
        <input [(ngModel)]="password" name="password" type="password" [placeholder]="'auth.password' | translate" required />
        <button class="btn" type="submit" [disabled]="loading">
          {{ loading ? ('common.check' | translate) : ('auth.login' | translate) }}
        </button>
      </form>

      <p *ngIf="error" class="error">{{ error }}</p>
    </section>

    <section *ngIf="authorized">
      <div class="panel-head">
        <span></span>
        <button class="btn danger" type="button" (click)="logout()">{{ 'nav.logout' | translate }}</button>
      </div>
      <app-admin-panel-page></app-admin-panel-page>
    </section>
  `,
  styles: [
    `
      .login-wrap {
        max-width: 420px;
        background: var(--panel);
        color: var(--text);
        border-radius: 18px;
        border: 1px solid var(--border);
        padding: 18px;
        box-shadow: 0 14px 32px rgba(0,0,0,0.6);
      }
      .form { display: grid; gap: 10px; }
      .error { color: #f97373; }
      .panel-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
      .danger { background: #b91c1c; }
    `,
  ],
})
export class AdminPanelAccessPageComponent implements OnInit {
  email = '';
  password = '';
  loading = false;
  error = '';
  authorized = false;

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    this.authorized = !!this.api.getAdminPanelToken();
  }

  submit(): void {
    this.error = '';
    this.loading = true;
    this.api.adminPanelLogin(this.email, this.password).subscribe({
      next: (res) => {
        this.api.setAdminPanelToken(res.access_token);
        this.authorized = true;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.detail || 'Access denied';
        this.loading = false;
      },
    });
  }

  logout(): void {
    this.api.clearAdminPanelToken();
    this.authorized = false;
    this.password = '';
  }
}
