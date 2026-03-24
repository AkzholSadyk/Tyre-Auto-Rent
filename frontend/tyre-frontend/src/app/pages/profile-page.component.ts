import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <h2>{{ 'profile.title' | translate }}</h2>

    <section *ngIf="profile">
      <p><b>{{ 'profile.email' | translate }}:</b> {{ profile.user.email }}</p>
      <p><b>{{ 'profile.verification' | translate }}:</b> {{ profile.user.is_verified ? ('profile.verified' | translate) : ('profile.notVerified' | translate) }}</p>
      <p><b>{{ 'profile.licenseStatus' | translate }}:</b> {{ licenseStatusLabel(profile.driver_license?.verification_status) }}</p>
    </section>

    <form class="form" (ngSubmit)="saveProfile()">
      <input [(ngModel)]="form.first_name" name="first_name" [placeholder]="'auth.firstName' | translate" />
      <input [(ngModel)]="form.last_name" name="last_name" [placeholder]="'auth.lastName' | translate" />
      <input [(ngModel)]="form.phone" name="phone" [placeholder]="'auth.phone' | translate" />
      <button class="btn" type="submit">{{ 'profile.updateProfile' | translate }}</button>
    </form>

    <h3>{{ 'profile.uploadDocsTitle' | translate }}</h3>
    <form class="form" (ngSubmit)="uploadIdentityDocs()">
      <input type="file" (change)="onPassportFile($event)" accept="image/*" required />
      <small>{{ 'profile.optionalLicense' | translate }}</small>
      <input type="file" (change)="onDriverDocFile($event)" accept="image/*" />
      <button class="btn" type="submit">{{ 'profile.submitDocs' | translate }}</button>
    </form>

    <p *ngIf="message">{{ message }}</p>
    <p *ngIf="error" class="error">{{ error }}</p>
  `,
  styles: ['.form{display:grid;gap:10px;max-width:520px;margin-bottom:14px}.error{color:#b00020}'],
})
export class ProfilePageComponent implements OnInit {
  profile: any;
  form = { first_name: '', last_name: '', phone: '' };
  passportFile: File | null = null;
  driverDocFile: File | null = null;
  message = '';
  error = '';

  constructor(
    private readonly api: ApiService,
    private readonly auth: AuthService,
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.getProfileMe().subscribe((data) => {
      this.profile = data;
      this.form.first_name = data.user.first_name;
      this.form.last_name = data.user.last_name;
      this.form.phone = data.user.phone || '';
      this.auth.init();
    });
  }

  saveProfile(): void {
    this.api.updateProfile(this.form).subscribe({
      next: () => {
        this.message = this.translate.instant('profile.messages.profileUpdated');
        this.error = '';
        this.load();
      },
      error: (err) => (this.error = err?.error?.detail || this.translate.instant('profile.messages.failedUpdateProfile')),
    });
  }

  onPassportFile(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.passportFile = target.files?.[0] || null;
  }

  onDriverDocFile(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.driverDocFile = target.files?.[0] || null;
  }

  uploadIdentityDocs(): void {
    if (!this.passportFile) {
      this.error = this.translate.instant('profile.messages.selectPassportFile');
      return;
    }

    this.api.uploadIdentityDocs(this.passportFile, this.driverDocFile || undefined).subscribe({
      next: () => {
        this.message = this.translate.instant('profile.messages.documentsUploaded');
        this.error = '';
        this.load();
      },
      error: (err) => (this.error = err?.error?.detail || this.translate.instant('profile.messages.documentsUploadFailed')),
    });
  }

  licenseStatusLabel(status?: string): string {
    if (!status) return this.translate.instant('profile.notUploaded');
    if (status === 'pending') return this.translate.instant('common.pending');
    if (status === 'approved') return this.translate.instant('common.approved');
    if (status === 'rejected') return this.translate.instant('common.rejected');
    return status;
  }
}
