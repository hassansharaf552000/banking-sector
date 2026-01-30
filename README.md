# Banking Portal - Angular Application

A comprehensive banking front-end portal built with Angular 21, PrimeNG, and RxJS. This application demonstrates modern Angular development practices including standalone components, signals, reactive forms, and secure data management.

## 🚀 Features

### Layer One - Foundation
- ✅ **Login Screen** with email/password validation
- ✅ **Dashboard** with customer list, search, and pagination
- ✅ **Customer Details** page with account information
- ✅ **Responsive Design** for all screen sizes
- ✅ **Angular Routing** with lazy loading and route guards

### Layer Two - Transactions & Forms
- ✅ **Transactions List** with advanced filtering
  - Filter by date range, transaction type, and category
  - Sort by date and amount (ascending/descending)
  - Pagination for large datasets
- ✅ **Create New Transaction** with reactive forms
  - Custom validators (decimal places, future date, amount range)
  - Cross-field validation (balance check)
  - Inline error messages
  - Real-time form validation
- ✅ **Business Rules Implementation**
  - Debit transactions cannot exceed account balance
  - Automatic balance updates (debit subtracts, credit adds)
  - Client-side transaction ID generation
- ✅ **LocalStorage Persistence** with encryption and integrity checks

### Layer Three - Advanced Features
- ✅ **Mini Statement** - View last N transactions
- ✅ **CSV Export** - Download transactions as CSV file
- ✅ **Monthly Insights Dashboard**
  - Total debit and credit amounts
  - Highest spending category
  - Transaction count
- ✅ **Performance Optimizations**
  - Data caching with RxJS `shareReplay`
  - State management using Angular Signals
  - Lazy loading for all routes
  - Secure storage with encryption

## 🛠️ Technology Stack

- **Angular 21** - Latest version with standalone components
- **PrimeNG** - UI component library (default Lara theme)
- **RxJS** - Reactive programming
- **Angular Signals** - Modern state management
- **Reactive Forms** - Form handling and validation
- **TypeScript** - Type-safe development
- **SCSS** - Styling with variables and mixins

## 📁 Project Structure

```
src/app/
├── core/                    # Core functionality
│   ├── guards/             # Route guards (auth.guard.ts)
│   ├── models/             # TypeScript interfaces
│   ├── services/           # Data services with caching
│   └── utils/              # Utility functions (secure storage)
├── features/               # Feature modules
│   ├── auth/              # Login component
│   ├── dashboard/         # Customer list
│   ├── customer/          # Customer details
│   └── transactions/      # Transaction management
└── shared/                # Shared resources
    ├── validators/        # Custom form validators
    └── components/        # Reusable components (future)
```

## 🚦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v10 or higher)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd banking-sector
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:4200`

### Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## 🔐 Security Features

### Secure Storage Implementation

The application uses a custom `SecureStorage` utility that provides:

1. **Encryption** - XOR cipher with Base64 encoding for data protection
2. **Integrity Checks** - Hash verification to detect tampering
3. **Namespacing** - Prefixed keys to avoid conflicts
4. **Automatic Cleanup** - Clear all banking data on logout

**Note:** For production use, replace the XOR cipher with Web Crypto API (AES-GCM) for stronger encryption.

### Authentication

- Simple email/password validation (demo mode)
- Route protection using Angular guards
- Session persistence with secure storage
- Automatic redirect on unauthorized access

## 📊 Data Structure

### Mock Data Files

Located in `src/assets/mock/`:

- `customers.json` - Customer information
- `accounts.json` - Account details
- `transactions.json` - Transaction history
- `transaction-types.json` - Transaction type definitions
- `transaction-categories.json` - Category list

### Data Flow

1. **Initial Load** - Data fetched from JSON files via HTTP
2. **Caching** - RxJS `shareReplay` prevents redundant requests
3. **State Management** - Angular Signals for reactive updates
4. **Persistence** - LocalStorage with encryption for transactions and accounts

## 🎯 Usage Guide

### Login

- **Email:** Any valid email format (e.g., `user@example.com`)
- **Password:** Minimum 6 characters

### Dashboard

- View all customers in a sortable, searchable table
- Click "View Details" to see customer information

### Customer Details

- View customer information and account list
- Click "View Transactions" on any account

### Transactions

1. **Filter Transactions**
   - Select date range
   - Choose transaction type (Debit/Credit)
   - Filter by category

2. **Create Transaction**
   - Click "New Transaction" button
   - Fill in the form (all fields required)
   - Validation rules:
     - Amount: 0.01 - 100,000 (max 2 decimals)
     - Date: Cannot be in the future
     - Merchant: 3-50 characters
     - Debit: Cannot exceed account balance

3. **Export Data**
   - Click "Export CSV" to download filtered transactions
   - Click "Mini Statement" to view last 5 transactions

4. **View Insights**
   - Monthly insights displayed at the top
   - Shows total debit/credit and highest spending category

## 🎨 Responsive Design

The application is fully responsive with breakpoints:

- **Desktop** - 1400px+ (full layout)
- **Tablet** - 768px - 1399px (adjusted grid)
- **Mobile** - < 768px (stacked layout)

## ✅ Validation Rules

### Transaction Form

| Field | Rules |
|-------|-------|
| Type | Required (Debit/Credit) |
| Amount | Required, > 0, ≤ 100,000, max 2 decimals |
| Date | Required, not in future |
| Merchant | Required, 3-50 characters |
| Category | Required |

### Business Rules

- **Debit Validation** - Amount cannot exceed account balance
- **Balance Update** - Automatic calculation on transaction creation
- **Transaction ID** - Auto-generated using timestamp + random number

## 🧪 Testing

### Manual Testing Checklist

- [ ] Login with valid/invalid credentials
- [ ] Navigate through all routes
- [ ] Filter transactions by all criteria
- [ ] Create debit transaction (success case)
- [ ] Create debit transaction exceeding balance (error case)
- [ ] Create credit transaction
- [ ] Export transactions to CSV
- [ ] View mini statement
- [ ] Check monthly insights calculations
- [ ] Test responsive design on mobile/tablet
- [ ] Verify localStorage persistence (refresh page)
- [ ] Logout and verify data cleared

## 📝 Assumptions & Design Decisions

1. **Authentication** - Simplified for demo purposes (any valid email/password works)
2. **Data Persistence** - LocalStorage used instead of backend API
3. **Encryption** - XOR cipher for demo; production should use Web Crypto API
4. **Transaction IDs** - Client-side generation (backend would provide in production)
5. **Date Format** - ISO format (YYYY-MM-DD) for consistency
6. **Currency** - Fixed to EGP (Egyptian Pound)
7. **Pagination** - PrimeNG default (10 rows per page)
8. **Caching** - Aggressive caching for performance (no auto-refresh)

## 🔄 Future Enhancements

- [ ] Backend API integration
- [ ] User registration and profile management
- [ ] Transaction editing and deletion
- [ ] Advanced analytics and charts
- [ ] Multi-currency support
- [ ] Real-time notifications
- [ ] Print statements
- [ ] Dark mode theme
- [ ] Internationalization (i18n)
- [ ] Unit and E2E tests

## 📄 License

This project is for evaluation purposes only.

## 👨‍💻 Development

### Code Quality

- **Clean Code** - Separated concerns (TS, HTML, SCSS)
- **Type Safety** - Full TypeScript interfaces
- **Reusability** - Shared validators and utilities
- **Maintainability** - Clear folder structure
- **Performance** - Optimized with caching and signals

### Component Architecture

- **Standalone Components** - No NgModules required
- **Signals** - Modern reactive state management
- **Reactive Forms** - Type-safe form handling
- **Lazy Loading** - Improved initial load time
- **Route Guards** - Secure navigation

---

**Built with ❤️ using Angular 21 and PrimeNG**
