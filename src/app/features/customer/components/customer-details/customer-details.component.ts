import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { Customer, Account } from '../../../../core/models';
import { CustomerService } from '../../services/customer.service';
import { AccountService } from '../../services/account.service';
import { StateService } from '../../../../core/services/state.service';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-customer-details',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    DividerModule,
    NavbarComponent,
  ],
  templateUrl: './customer-details.component.html',
  styleUrl: './customer-details.component.scss',
})
export class CustomerDetailsComponent implements OnInit {
  customer = signal<Customer | null>(null);
  accounts = signal<Account[]>([]);
  loading = signal(true);

  totalBalance = computed(() => {
    return this.accounts().reduce((sum, acc) => sum + acc.balance, 0);
  });

  activeAccountsCount = computed(() => {
    return this.accounts().filter(a => a.status === 'Active').length;
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private customerService: CustomerService,
    private accountService: AccountService,
    private stateService: StateService
  ) {}

  ngOnInit(): void {
    const cif = this.route.snapshot.paramMap.get('cif');
    if (cif) {
      this.loadCustomerData(cif);
    }
  }

  loadCustomerData(cif: string): void {
    this.loading.set(true);

    this.customerService.getCustomerByCIF(cif).subscribe({
      next: (customer) => {
        if (customer) {
          this.customer.set(customer);
          this.stateService.setSelectedCustomer(customer);
          this.loadAccounts(cif);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        console.error('Error loading customer:', error);
        this.loading.set(false);
      },
    });
  }

  loadAccounts(customerId: string): void {
    this.accountService.getAccountsByCustomerId(customerId).subscribe({
      next: (accounts) => {
        this.accounts.set(accounts);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading accounts:', error);
        this.loading.set(false);
      },
    });
  }

  viewTransactions(account: Account): void {
    this.stateService.setSelectedAccountId(account.id);
    this.router.navigate(['/customer', this.customer()?.CIF, 'account', account.id, 'transactions']);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  getAccountTypeIcon(type: string): string {
    switch (type) {
      case 'Current':
        return 'pi-wallet';
      case 'Savings':
        return 'pi-money-bill';
      default:
        return 'pi-credit-card';
    }
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' {
    return status === 'Active' ? 'success' : 'danger';
  }
}
