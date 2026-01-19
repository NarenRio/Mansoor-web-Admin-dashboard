# Admin Panel - Law Firm Management

A React-based admin panel for managing law firms and advocates, built with React, JavaScript, and Tailwind CSS.

## Features

- **View Firms**: Display all law firms with their details
- **View Advocates**: See all advocates associated with each firm
- **Activate Users**: Activate registered users and send activation emails
- **Deactivate Users**: Deactivate active user accounts
- **Status Management**: Clear display of user status (Pending, Active, Inactive)
- **Filtering**: Filter firms by name
- **Search**: Search advocates by name, email, or phone number

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running on `http://localhost:3000`

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The admin panel will be available at `http://localhost:5173`

## Configuration

The API base URL is configured in `src/services/api.js`. By default, it connects to:
- `http://localhost:3000/api`

To change the API URL, set the `VITE_API_BASE_URL` environment variable or modify the default in `api.js`.

## Backend API Endpoints

The admin panel uses the following backend endpoints:

- `GET /api/admin/firms` - Get all firms with advocates
- `GET /api/admin/advocates` - Get all advocates
- `PATCH /api/admin/users/:id/activate` - Activate a user
- `PATCH /api/admin/users/:id/deactivate` - Deactivate a user

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Tech Stack

- **React 18** - UI library
- **JavaScript** - Programming language
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **Vite** - Build tool
