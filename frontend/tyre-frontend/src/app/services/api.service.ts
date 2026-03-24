import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = `${environment.apiUrl}/api/v1`;
  private readonly adminPanelTokenKey = 'tyre_admin_panel_token';

  constructor(private readonly http: HttpClient) {}

  setAdminPanelToken(token: string): void {
    localStorage.setItem(this.adminPanelTokenKey, token);
  }

  getAdminPanelToken(): string {
    return localStorage.getItem(this.adminPanelTokenKey) || '';
  }

  clearAdminPanelToken(): void {
    localStorage.removeItem(this.adminPanelTokenKey);
  }

  private adminHeaders(): HttpHeaders {
    const token = this.getAdminPanelToken();
    return token ? new HttpHeaders({ 'X-Admin-Panel-Token': token }) : new HttpHeaders();
  }

  adminPanelLogin(email: string, password: string): Observable<{ access_token: string; token_type: string }> {
    return this.http.post<{ access_token: string; token_type: string }>(`${this.baseUrl}/admin/panel/login`, {
      email,
      password,
    });
  }

  getCars(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/cars`);
  }

  getCar(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/cars/${id}`);
  }

  getCarAvailability(id: number, dateFrom?: string, dateTo?: string): Observable<any> {
    let params = new HttpParams();
    if (dateFrom) params = params.set('date_from', dateFrom);
    if (dateTo) params = params.set('date_to', dateTo);
    return this.http.get<any>(`${this.baseUrl}/cars/${id}/availability`, { params });
  }

  createCar(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/cars`, payload, { headers: this.adminHeaders() });
  }

  updateCar(id: number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/cars/${id}`, payload, { headers: this.adminHeaders() });
  }

  deleteCar(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/cars/${id}`, { headers: this.adminHeaders() });
  }

  uploadCarImages(files: File[]): Observable<{ images: string[] }> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return this.http.post<{ images: string[] }>(`${this.baseUrl}/admin/cars/upload-images`, formData, {
      headers: this.adminHeaders(),
    });
  }

  getHomeVideosPublic(): Observable<{ videos: string[] }> {
    return this.http.get<{ videos: string[] }>(`${this.baseUrl}/admin/home-videos/public`);
  }

  getAboutVideosPublic(): Observable<{ videos: string[] }> {
    return this.http.get<{ videos: string[] }>(`${this.baseUrl}/admin/about-videos/public`);
  }

  getHomeVideosAdmin(): Observable<{ videos: string[] }> {
    return this.http.get<{ videos: string[] }>(`${this.baseUrl}/admin/home-videos`, {
      headers: this.adminHeaders(),
    });
  }

  getAboutVideosAdmin(): Observable<{ videos: string[] }> {
    return this.http.get<{ videos: string[] }>(`${this.baseUrl}/admin/about-videos`, {
      headers: this.adminHeaders(),
    });
  }

  uploadHomeVideos(files: File[], replace = false): Observable<{ videos: string[] }> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return this.http.post<{ videos: string[] }>(`${this.baseUrl}/admin/home-videos?replace=${replace}`, formData, {
      headers: this.adminHeaders(),
    });
  }

  reorderHomeVideos(videos: string[]): Observable<{ videos: string[] }> {
    return this.http.put<{ videos: string[] }>(`${this.baseUrl}/admin/home-videos`, { videos }, {
      headers: this.adminHeaders(),
    });
  }

  deleteHomeVideo(videoUrl: string): Observable<{ videos: string[] }> {
    return this.http.delete<{ videos: string[] }>(`${this.baseUrl}/admin/home-videos`, {
      headers: this.adminHeaders(),
      params: { video_url: videoUrl },
    });
  }

  uploadAboutVideos(files: File[], replace = false): Observable<{ videos: string[] }> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return this.http.post<{ videos: string[] }>(`${this.baseUrl}/admin/about-videos?replace=${replace}`, formData, {
      headers: this.adminHeaders(),
    });
  }

  reorderAboutVideos(videos: string[]): Observable<{ videos: string[] }> {
    return this.http.put<{ videos: string[] }>(`${this.baseUrl}/admin/about-videos`, { videos }, {
      headers: this.adminHeaders(),
    });
  }

  deleteAboutVideo(videoUrl: string): Observable<{ videos: string[] }> {
    return this.http.delete<{ videos: string[] }>(`${this.baseUrl}/admin/about-videos`, {
      headers: this.adminHeaders(),
      params: { video_url: videoUrl },
    });
  }

  getSocialVideosPublic(): Observable<{ items: { video_url: string; link_url: string }[] }> {
    return this.http.get<{ items: { video_url: string; link_url: string }[] }>(`${this.baseUrl}/admin/social-videos/public`);
  }

  getSocialVideosAdmin(): Observable<{ items: { video_url: string; link_url: string }[] }> {
    return this.http.get<{ items: { video_url: string; link_url: string }[] }>(`${this.baseUrl}/admin/social-videos`, {
      headers: this.adminHeaders(),
    });
  }

  uploadSocialVideos(files: File[], replace = false): Observable<{ items: { video_url: string; link_url: string }[] }> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return this.http.post<{ items: { video_url: string; link_url: string }[] }>(
      `${this.baseUrl}/admin/social-videos?replace=${replace}`,
      formData,
      { headers: this.adminHeaders() }
    );
  }

  updateSocialVideos(items: { video_url: string; link_url: string }[]): Observable<{ items: { video_url: string; link_url: string }[] }> {
    return this.http.put<{ items: { video_url: string; link_url: string }[] }>(
      `${this.baseUrl}/admin/social-videos`,
      { items },
      { headers: this.adminHeaders() }
    );
  }

  deleteSocialVideo(videoUrl: string): Observable<{ items: { video_url: string; link_url: string }[] }> {
    return this.http.delete<{ items: { video_url: string; link_url: string }[] }>(`${this.baseUrl}/admin/social-videos`, {
      headers: this.adminHeaders(),
      params: { video_url: videoUrl },
    });
  }

  getHomepageContentPublic(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/admin/homepage/public`);
  }

  getHomepageContentAdmin(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/admin/homepage`, {
      headers: this.adminHeaders(),
    });
  }

  updateHomepageContent(payload: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/admin/homepage`, payload, {
      headers: this.adminHeaders(),
    });
  }

  getAdminAvailableCars(targetDate: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/cars/available`, {
      params: { target_date: targetDate },
      headers: this.adminHeaders(),
    });
  }

  getCarBlockedDates(carId: number, dateFrom: string, dateTo: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/cars/${carId}/blocked-dates`, {
      params: { date_from: dateFrom, date_to: dateTo },
      headers: this.adminHeaders(),
    });
  }

  addCarBlockedDate(carId: number, blockedDateFrom: string, blockedDateTo: string, reason?: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/admin/cars/${carId}/blocked-dates`, {
      blocked_date_from: blockedDateFrom,
      blocked_date_to: blockedDateTo,
      reason,
    }, { headers: this.adminHeaders() });
  }

  removeCarBlockedDate(carId: number, blockedId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/admin/cars/${carId}/blocked-dates/${blockedId}`, {
      headers: this.adminHeaders(),
    });
  }

  createBooking(payload: { car_id: number; start_date: string; end_date: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/bookings`, payload);
  }

  getMyBookings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/bookings`);
  }

  getProfileMe(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/profile/me`);
  }

  updateProfile(payload: { first_name?: string; last_name?: string; phone?: string }): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/profile/update`, payload);
  }

  uploadLicense(licenseNumber: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('license_number', licenseNumber);
    formData.append('license_image', file);
    return this.http.post<any>(`${this.baseUrl}/profile/license-upload`, formData);
  }

  uploadIdentityDocs(passportOrIdImage: File, driverLicenseImage?: File): Observable<any> {
    const formData = new FormData();
    formData.append('passport_or_id_image', passportOrIdImage);
    if (driverLicenseImage) {
      formData.append('driver_license_image', driverLicenseImage);
    }
    return this.http.post<any>(`${this.baseUrl}/profile/document-upload`, formData);
  }

  getAdminUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/users`, { headers: this.adminHeaders() });
  }

  getAdminDocuments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/documents`, { headers: this.adminHeaders() });
  }

  approveDocument(id: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/admin/documents/${id}/approve`, {}, { headers: this.adminHeaders() });
  }

  rejectDocument(id: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/admin/documents/${id}/reject`, {}, { headers: this.adminHeaders() });
  }
}
