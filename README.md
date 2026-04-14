# AdminPro — React Admin Panel Dashboard

A modern, fully-featured SaaS-style Admin Panel built with **React** (no Tailwind dependency — pure inline styles for portability).

---

## Features

- **Dashboard** — Analytics cards (Total Users, Active Users, Today's Registrations) + recent users table
- **Users Page** — Full data table with 20+ columns, search, status/role filters, sorting, pagination, bulk actions, add/delete modals, CSV export
- **Coupon Page** — Coupon management with status toggle (Activate/Deactivate), create/delete
- **Plan Page** — Subscription plan management with create/delete
- **Permission Page** — Role-based permission management with create/delete
- **Reusable DataTable** — Single component powering all 4 data pages
- **Toast Notifications** — Success/error feedback for every action
- **Confirm Modal** — Delete confirmation dialog
- **CSV Export** — Export any filtered table to CSV
- **Bulk Actions** — Multi-select rows for batch delete/activate/deactivate

---

## Project Structure

```
src/
├── components/
│   ├── Badge.jsx          # Status badges, bool tags, mono tags
│   ├── ConfirmModal.jsx   # Reusable delete confirmation modal
│   ├── DataTable.jsx      # Core reusable table with search/sort/pagination/bulk
│   ├── Sidebar.jsx        # Left navigation sidebar
│   ├── Toast.jsx          # Toast notification system (Context + Provider)
│   └── Topbar.jsx         # Top header with search & notifications
├── data/
│   └── mockData.js        # Mock data generators for all entities
├── pages/
│   ├── DashboardPage.jsx  # Overview with stat cards + recent users
│   ├── UsersPage.jsx      # Full users management
│   ├── CouponPage.jsx     # Coupon management
│   ├── PlanPage.jsx       # Plan management
│   └── PermissionPage.jsx # Permission management
├── utils/
│   └── helpers.js         # exportCSV, sortData, filterData utilities
├── App.jsx                # Root component, state management, routing
└── main.jsx               # React entry point
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open in browser
# http://localhost:5173
```

### Build for Production

```bash
npm run build
npm run preview
```

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite 5 | Build tool & dev server |
| React Context | Toast notification state |
| Inline Styles | Styling (zero CSS dependencies) |

---

## Customization

### Adding a New Page
1. Create `src/pages/YourPage.jsx`
2. Add a nav item in `src/components/Sidebar.jsx`
3. Import and render in `src/App.jsx`

### Adding Table Columns
In your page file, add to the `COLS` array:
```js
{ key: 'your_field', label: 'Your Label' }
```
Then render the cell in your `renderRow` function.

### Changing the Brand Color
Search and replace `#534AB7` (primary purple) across the codebase with your color.

---

## Status Badge Colors

| Status | Color |
|---|---|
| Active | Green |
| Inactive | Red |
| Away | Amber/Yellow |
| Admin | Purple |
| Manager | Blue |
| User | Gray |
