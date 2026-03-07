import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PAGE_ROUTES_DATA } from '../../defines/constants';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  private readonly router = inject(Router);
  pages = Object.values(PAGE_ROUTES_DATA);

  isActive(page: string) {
    if (this.router.url === '/') {
      return page === PAGE_ROUTES_DATA.DASHBOARD.path;
    }
    return this.router.url === `/${page}`;
  }
  navigateTo(
    page: (typeof PAGE_ROUTES_DATA)[keyof typeof PAGE_ROUTES_DATA]['path'],
  ) {
    this.router.navigate([page]);
  }
}
