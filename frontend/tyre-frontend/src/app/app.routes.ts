import { Routes } from '@angular/router';

import { AdminPanelAccessPageComponent } from './pages/admin-panel-access-page.component';
import { AboutUsPageComponent } from './pages/about-us-page.component';
import { BookingPageComponent } from './pages/booking-page.component';
import { CarCatalogPageComponent } from './pages/car-catalog-page.component';
import { CarDetailsPageComponent } from './pages/car-details-page.component';
import { HomePageComponent } from './pages/home-page.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'cars', component: CarCatalogPageComponent },
  { path: 'catalog', component: CarCatalogPageComponent },
  { path: 'car/:id', component: CarDetailsPageComponent },
  { path: 'cars/:id', component: CarDetailsPageComponent },
  { path: 'booking', component: BookingPageComponent },
  { path: 'about-us', component: AboutUsPageComponent },
  { path: 'admin', redirectTo: 'admin/panel', pathMatch: 'full' },
  { path: 'admin/panel', component: AdminPanelAccessPageComponent },
];
