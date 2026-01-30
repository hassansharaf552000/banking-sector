import { Component, inject, computed } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { AuthService } from './features/auth/services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class AppComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  private currentUrl = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => (event as NavigationEnd).url),
      startWith(this.router.url)
    ),
    { initialValue: this.router.url }
  );
  
  isAuthenticated = this.authService.isAuthenticated;
  
  showNavAndFooter = computed(() => {
    const isAuth = this.isAuthenticated();
    const url = this.currentUrl();
    const isLoginPage = url === '/login' || url === '/' || url.startsWith('/login');
    return isAuth && !isLoginPage;
  });
}
