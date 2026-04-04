# Development Log

Chronological record of development work.

| Date | Commit | Summary | Files |
|------|--------|---------|-------|
| 2026-04-03 | f6a92c3 | feat: add Prisma schema — all 13 models with enums and relations | prisma/schema.prisma |
| 2026-04-03 | 0aabd2a | chore: add prisma.config.ts — Prisma 7 config with env DATABASE_URL | prisma.config.ts |
| 2026-04-03 | b392266 | feat: add auth system — NextAuth v5 with credentials, Prisma client singleton | src/app/api/auth/[...nextauth]/route.ts, src/lib/auth.ts, src/lib/prisma.ts, src/types/next-auth.d.ts |
| 2026-04-03 | fadaf7a | feat: add seed script — admin/staff users, service categories | package-lock.json, package.json, prisma/seed.ts |
| 2026-04-03 | c2e3842 | feat: add login page — Hebrew UI, credentials form | src/app/(auth)/layout.tsx, src/app/(auth)/login/page.tsx |
| 2026-04-03 | 8d347ae | feat: add dashboard layout — RTL sidebar, navbar, auth guard | src/app/(dashboard)/layout.tsx, src/app/(dashboard)/page.tsx, src/app/page.tsx, src/components/layout/dashboard-client.tsx, src/components/layout/navbar.tsx, +1 more |
| 2026-04-03 | ec0ecf6 | feat: add services module — CRUD with categories and cost breakdown | src/app/(dashboard)/services/[id]/page.tsx, src/app/(dashboard)/services/new/page.tsx, src/app/(dashboard)/services/page.tsx, src/components/services/cost-breakdown.tsx, src/components/services/service-form.tsx, +3 more |
| 2026-04-03 | 018713f | feat: add clients module — list, detail, contacts, activity feed | src/app/(dashboard)/clients/[id]/page.tsx, src/app/(dashboard)/clients/page.tsx, src/components/clients/activity-feed.tsx, src/components/clients/add-activity-dialog.tsx, src/components/clients/add-client-dialog.tsx, +7 more |
| 2026-04-03 | e35ec91 | feat: add quotes module — list, form with line items, detail with status flow | src/app/(dashboard)/quotes/[id]/page.tsx, src/app/(dashboard)/quotes/new/page.tsx, src/app/(dashboard)/quotes/page.tsx, src/components/quotes/quote-detail.tsx, src/components/quotes/quote-form.tsx, +3 more |
| 2026-04-03 | 70088c0 | feat: add orders module — list, form, detail with payment tracking | src/app/(dashboard)/orders/[id]/page.tsx, src/app/(dashboard)/orders/new/page.tsx, src/app/(dashboard)/orders/page.tsx, src/components/orders/add-payment-dialog.tsx, src/components/orders/order-detail.tsx, +4 more |
| 2026-04-03 | 0db1b6f | feat: add dashboard — KPIs, pipeline kanban, attention list, revenue chart | src/app/(dashboard)/page.tsx, src/components/dashboard/attention-list.tsx, src/components/dashboard/kpi-cards.tsx, src/components/dashboard/pipeline-kanban.tsx, src/components/dashboard/revenue-chart.tsx, +1 more |
| 2026-04-03 | 1c43152 | feat: add settings page — user management, categories (admin only) | src/app/(dashboard)/settings/page.tsx, src/components/settings/category-management.tsx, src/components/settings/user-management.tsx, src/lib/actions/settings-actions.ts |
| 2026-04-03 | 8bd4d13 | feat: add PDF quote generation — RTL Hebrew, grouped by category | src/app/api/pdf/quote/[id]/document.tsx, src/app/api/pdf/quote/[id]/route.tsx |
| 2026-04-03 | e9ebef7 | fix: update seed script for Prisma 7 adapter, add seed config to prisma.config.ts | .claude/commands/update-architecture.md, .gitignore, ARCHITECTURE.md, DECISIONS.md, DEVLOG.md, +2 more |
| 2026-04-03 | fed2e95 | feat: seed 82 clients from Oren's Excel — with contacts, status, source | prisma/seed.ts |
| 2026-04-03 | c0c2dda | feat: seed Q1 2026 income data — 15 orders with payments from Oren's revenue CSV | prisma/seed.ts |
| 2026-04-03 | f8f1d12 | fix: add "use client" to service-list — buttonVariants requires client context | src/components/services/service-list.tsx |
| 2026-04-03 | 88f573c | fix: serialize Decimal/Date objects before passing to client components | src/app/(dashboard)/clients/[id]/page.tsx, src/app/(dashboard)/clients/page.tsx, src/app/(dashboard)/orders/[id]/page.tsx, src/app/(dashboard)/orders/new/page.tsx, src/app/(dashboard)/orders/page.tsx, +7 more |
| 2026-04-03 | 7b5b525 | fix: serialize Decimal/Date objects before passing to client components | DEVLOG.md |
| 2026-04-03 | 90eee51 | feat: add Expense model to schema | prisma/schema.prisma |
| 2026-04-03 | a8a8110 | feat: apply InHealthy design system — teal sidebar, color palette, status badges | src/app/(dashboard)/layout.tsx, src/app/globals.css, src/components/clients/client-list.tsx, src/components/dashboard/kpi-cards.tsx, src/components/dashboard/pipeline-kanban.tsx, +5 more |
| 2026-04-03 | c5137e5 | feat: add expenses module — CRUD with categories, monthly summary | src/app/(dashboard)/expenses/page.tsx, src/components/expenses/add-expense-dialog.tsx, src/components/expenses/edit-expense-dialog.tsx, src/components/expenses/expense-list.tsx, src/components/layout/sidebar.tsx, +2 more |
| 2026-04-03 | 6f32b43 | feat: add client editing — edit dialog on client detail page | src/app/(dashboard)/clients/[id]/page.tsx, src/components/clients/client-detail.tsx, src/components/clients/edit-client-dialog.tsx |
| 2026-04-03 | c9a3642 | feat: add sortable table columns — clients, quotes, orders, expenses | src/components/clients/client-list.tsx, src/components/expenses/expense-list.tsx, src/components/orders/order-list.tsx, src/components/quotes/quote-list.tsx, src/components/ui/sortable-header.tsx |
| 2026-04-03 | 5d53c5d | fix: robust Decimal detection in serialize, add missing serialize to settings and services/new | DEVLOG.md, src/app/(dashboard)/services/new/page.tsx, src/app/(dashboard)/settings/page.tsx, src/lib/utils.ts |
| 2026-04-03 | 4c3ba26 | feat: comprehensive design overhaul — match Stitch design system across all pages | src/app/(dashboard)/expenses/page.tsx, src/app/(dashboard)/layout.tsx, src/app/(dashboard)/page.tsx, src/app/(dashboard)/settings/page.tsx, src/app/globals.css, +12 more |
| 2026-04-03 | d1735fc | feat: seed real service catalog from actual quotes, fix kanban overflow | prisma/seed.ts, src/components/dashboard/pipeline-kanban.tsx |
| 2026-04-03 | b7b52ea | feat: rebuild seed with real 2026 data — correct categories, products, and sales from PDF | prisma/seed.ts |
| 2026-04-03 | 16d8101 | feat: add 2025 historical sales data — 44 sales, 15 months of revenue history | prisma/seed.ts |
| 2026-04-03 | b9ca280 | fix: UX improvements — searchable dropdowns, chart labels, quick-add lead, date pickers, KPI context | src/components/dashboard/kpi-cards.tsx, src/components/dashboard/pipeline-kanban.tsx, src/components/dashboard/quick-add-lead.tsx, src/components/dashboard/revenue-chart.tsx, src/components/expenses/add-expense-dialog.tsx, +5 more |
| 2026-04-03 | aa37275 | chore: add Stitch design reference files | .stitch-designs/screen-1.html, .stitch-designs/screen-2.html, .stitch-designs/screen-3.html, .stitch-designs/screen-4.html, DEVLOG.md |
| 2026-04-03 | 5a85743 | feat: replace attention list with action stream + mini calendar on dashboard | src/app/(dashboard)/page.tsx, src/components/dashboard/action-stream.tsx, src/components/dashboard/mini-calendar.tsx, src/lib/queries/dashboard-queries.ts |
| 2026-04-03 | 83b7e10 | feat: add service interest chips to quick-add lead dialog | src/components/dashboard/quick-add-lead.tsx, src/lib/actions/client-actions.ts |
| 2026-04-03 | a557e49 | feat: add calendar view — monthly grid with color-coded events and capacity indicators | DEVLOG.md, src/app/(dashboard)/calendar/page.tsx, src/components/calendar/event-calendar.tsx, src/components/layout/sidebar.tsx, src/lib/queries/calendar-queries.ts |
| 2026-04-03 | fa02506 | feat: add provider directory — Prisma models, CRUD, service linkage with margin tracking | prisma/schema.prisma, src/app/(dashboard)/providers/[id]/edit/page.tsx, src/app/(dashboard)/providers/[id]/page.tsx, src/app/(dashboard)/providers/new/page.tsx, src/app/(dashboard)/providers/page.tsx, +6 more |
| 2026-04-04 | 75be017 | fix: extract delete button to client component — fixes onClick in server component | src/app/(dashboard)/services/[id]/page.tsx, src/components/services/delete-service-button.tsx |
| 2026-04-04 | cb71490 | feat: add isOnMailingList boolean to Client model | prisma/migrations/add_client_mailing_list/migration.sql, prisma/schema.prisma |
| 2026-04-04 | 7900adb | feat: add reusable ConfirmDeleteDialog component | src/components/ui/alert-dialog.tsx, src/components/ui/confirm-delete-dialog.tsx |
| 2026-04-04 | a162a2b | feat: add clickable contact channel icons and mailing list toggle to client detail | src/components/clients/client-detail.tsx, src/components/clients/edit-client-dialog.tsx, src/lib/actions/client-actions.ts, src/lib/phone-utils.ts |
| 2026-04-04 | 0300a4e | feat: add activity edit/delete with hover icons and confirmation dialog | src/components/clients/activity-feed.tsx, src/components/clients/client-detail.tsx, src/components/clients/edit-activity-dialog.tsx, src/lib/actions/activity-actions.ts |
| 2026-04-04 | b9628dc | feat: add contact channel icons (tel/mail/whatsapp), edit contact dialog | src/components/clients/contact-list.tsx, src/components/clients/edit-contact-dialog.tsx, src/lib/actions/client-actions.ts |
| 2026-04-04 | 19b78d1 | feat: add last-contact and pending-quotes filters to client list | src/components/clients/client-list.tsx, src/lib/queries/client-queries.ts |
| 2026-04-04 | df16a42 | feat: add edit/delete actions to quote list and client detail quotes tab | src/components/clients/client-detail.tsx, src/components/quotes/quote-list.tsx, src/lib/actions/quote-actions.ts |
| 2026-04-04 | f447dcf | feat: add delete confirmation to client list and detail pages | src/components/clients/client-detail.tsx, src/components/clients/client-list.tsx |
| 2026-04-04 | 9a6ea19 | feat: add edit/delete action icons to provider list | src/components/providers/provider-list.tsx |
| 2026-04-04 | 978bcb2 | feat: add source type filter (in-house / external) to service list | src/components/services/service-list.tsx |
| 2026-04-04 | 708946d | feat: add edit/delete to order list, payment edit dialog, order actions in client detail | src/components/clients/client-detail.tsx, src/components/orders/edit-payment-dialog.tsx, src/components/orders/order-detail.tsx, src/components/orders/order-list.tsx, src/lib/actions/order-actions.ts |
| 2026-04-04 | bf80bbe | feat: add historical data import script skeleton (blocked on Oren's XLSX) | package-lock.json, package.json, prisma/import-history.ts |
| 2026-04-04 | 9e7cb17 | feat: implement full Excel data import — 12 sheets, 809 activities, 123 contacts | prisma/import-history.ts |
| 2026-04-04 | e65ee81 | fix: default descending sort on lists, contact icons fallback to primary contact | src/components/clients/client-detail.tsx, src/components/clients/client-list.tsx |
| 2026-04-04 | 790fc0f | refactor: simplify KPI cards to 4 financial metrics | src/components/dashboard/action-stream.tsx, src/components/dashboard/kpi-cards.tsx |
| 2026-04-04 | b70a2ec | feat: add recent activity feed component for dashboard | src/components/dashboard/recent-activity.tsx |
| 2026-04-04 | f3e6851 | feat: replace action stream with focused action items (pending quotes + upcoming events) | src/components/dashboard/action-items.tsx |
| 2026-04-04 | d35e323 | refactor: rewrite dashboard queries for action-first layout | src/lib/queries/dashboard-queries.ts |
| 2026-04-04 | 342054a | feat: add report queries — revenue, suppliers, funnel, payments | src/lib/queries/report-queries.ts |
