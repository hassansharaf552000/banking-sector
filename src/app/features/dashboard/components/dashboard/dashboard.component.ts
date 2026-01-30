import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { Customer } from '../../../../core/models';
import { CustomerService } from '../../../customer/services/customer.service';
import { StateService } from '../../../../core/services/state.service';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    TagModule,
    NavbarComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  customers = signal<Customer[]>([]);
  loading = signal(true);
  searchValue = signal('');

  constructor(
    private customerService: CustomerService,
    private stateService: StateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading.set(true);
    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        this.customers.set(customers);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.loading.set(false);
      },
    });
  }

  viewCustomer(customer: Customer): void {
    this.stateService.setSelectedCustomer(customer);
    this.router.navigate(['/customer', customer.CIF]);
  }

  getSegmentSeverity(segment: string): 'success' | 'info' | 'warn' | 'danger' {
    switch (segment) {
      case 'VIP':
        return 'danger';
      case 'Priority':
        return 'warn';
      case 'Retail':
        return 'info';
      default:
        return 'success';
    }
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchValue.set(value);
  }

  clear(table: any): void {
    table.clear();
    this.searchValue.set('');
  }
}
