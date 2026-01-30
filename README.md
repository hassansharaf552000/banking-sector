# Banking Sector Application

[**Watch Video Demo**](https://drive.google.com/file/d/1NpFdcVGFB9NXHZdI1UzooE4OIaoAajZV/view?usp=sharing)

A modern banking sector application built with Angular 21+ and PrimeNG. This application provides a comprehensive interface for banking operations including account management, transactions, and user administration.

## Project Summary

This project is a single-page application (SPA) that features:
- **Authentication**: Secure login with role-based access control (Admin/User).
- **Dashboard**: Overview of account status and recent activities.
- **Transactions**: History and details of banking transactions.
- **Responsive Design**: Built with PrimeNG components for a consistent experience across devices.

## Getting Started

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- [npm](https://www.npmjs.com/) (Included with Node.js)
- [Angular CLI](https://angular.io/cli) (`npm install -g @angular/cli`)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   ```

2. **Navigate to the project directory**:
   ```bash
   cd banking-sector
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

### Running the Application

Run the development server:

```bash
ng serve -o
```

The application will automatically open in your default browser at `http://localhost:4200/`.

## Login Credentials

The application currently uses a mock authentication service. You can use any of the following credentials to log in:

| Role  | Email            | Password    |
| :--- | :--------------- | :---------- |
| **Admin** | `admin@bank.com` | `admin123`  |
| **User**  | `user@bank.com`  | `user123`   |
| **User**  | `test@example.com`| `password123`|

## Configuration

The application configuration can be found in `src/environments/environment.ts`.
- **apiUrl**: The base URL for API requests (default: `http://localhost:3000/api`)
- **tokenKey**: Local storage key for auth tokens.

## Build

To build the project for production:

```bash
ng build
```

The build artifacts will be stored in the `dist/` directory.

## Testing

Run unit tests:

```bash
ng test
```
