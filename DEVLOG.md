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
