# UI/UX Specification — ISP Management System

## Design Goal
Arabic-first, premium SaaS-style ISP operations dashboard. The product must feel professional, modern, calm, clear, fast, and easy for a business owner who is also the technician.

Avoid old accounting-program aesthetics, generic admin templates, excessive gradients, glassmorphism, neon colors, excessive cards, dense tables, and decorative UI that hurts usability.

## Primary User
The primary user is the owner/admin/technician. Optimize the UX for one powerful user who manages customers, subscriptions, payments, support tickets, network operations, technical work, and reports.

Role support can exist technically for future expansion, but the current UX must stay simple.

## Language
- Arabic-first and RTL by default.
- Technical values such as IP, MAC, serial numbers and device models may remain in standard technical format.
- Handle mixed RTL/LTR strings correctly.
- Localize dates, numbers and currency appropriately.

## Visual Direction
Target: premium modern SaaS / ISP operations platform.

Prioritize hierarchy, whitespace, typography, consistency and speed over decoration.

Use a restrained neutral base with one strong primary accent and semantic colors for success, warning, danger and info.

## Design System
Create reusable tokens/components for:
- colors
- typography
- spacing
- radius
- shadows
- borders
- icons
- buttons
- inputs
- selects
- dropdowns
- cards
- tables
- badges
- alerts
- dialogs/drawers
- tabs
- breadcrumbs
- pagination
- empty/loading/error states

Do not create unrelated one-off styles.

## Typography
Use one high-quality Arabic UI font, preferably IBM Plex Sans Arabic or Noto Sans Arabic. Maintain a clear hierarchy for page titles, sections, body text, labels, metadata and technical values.

## Application Shell
Main layout:
- Sidebar navigation
- Top header
- Main content area

Sidebar should be clean, compact, scannable, collapsible on smaller screens, and clearly highlight the active section.

Suggested navigation:
- لوحة التحكم
- المشتركين
- الشبكة
  - نقاط التوزيع
  - الأبنية
  - الأجهزة
  - السويتشات
- الاشتراكات
  - الباقات
- المالية
  - الدفعات
  - الديون
  - التقارير
- الدعم
  - الأعطال
  - الفنيين
- المخزون
- الإعدادات

## Dashboard
The dashboard must immediately answer:
1. How many customers?
2. How many active?
3. How much collected?
4. Who has overdue payments?
5. What subscriptions are expiring?
6. Are there network problems?
7. What technical work needs attention?

Suggested sections:
- Overview metrics
- Network health
- Attention needed
- Recent activity

Do not fill the dashboard with low-value charts.

## Global Search
Provide prominent global search for:
- customer name
- phone
- customer number
- IP
- MAC
- building
- device
- switch
- ticket number

Results should identify the entity and allow direct navigation.

## Customer Profile
Make this one of the strongest screens.

Header:
- customer name
- customer number
- status
- phone
- quick actions

Quick actions:
- record payment
- renew subscription
- open ticket
- diagnose
- edit

Sections/tabs:
- overview
- subscription
- payments
- network
- tickets
- history

Future network visualization:
Customer → CPE/device → Switch port → Switch → Distribution point

## Fast Actions
Frequent actions should require very few interactions:
- record payment
- renew subscription
- open ticket
- diagnose customer

Use drawers/modals when they improve speed without making workflows cramped.

## Network UI
Present the network as an understandable hierarchy:
Distribution Point → Devices → Switch → Ports → Customers

Show status clearly. Future topology visualization must remain usable with many nodes, not merely decorative.

## Customer Diagnosis
Future diagnosis should show:
Account → Subscription → Customer Device → Switch → Distribution Point → Upstream/Core

Each stage should show status, last seen and relevant evidence. End with a plain-language conclusion. Never claim certainty when data is insufficient.

## Tables
Tables should support search, filters, sorting and pagination. Show important information first and move secondary data to detail pages. On mobile, use responsive layouts, cards or intelligent horizontal scrolling.

## Forms
Group related fields, use clear Arabic labels, validate near the relevant field, minimize unnecessary fields, use sensible defaults, preserve entered data after validation errors, and clearly distinguish required/optional fields.

## Alerts
Prioritize:
- Critical: network outage, major affected customers
- Important: expired subscriptions, high-priority tickets
- Informational: successful payment, renewal

Avoid notification noise.

## Empty/Loading/Error States
Every important page needs useful empty states and clear loading states. Errors must be human-readable; do not expose raw database/framework errors in the UI.

## Responsive Design
Desktop: full sidebar and multi-column information.
Tablet: collapsible sidebar and flexible cards.
Mobile: compact navigation, primary actions easy to access, stacked content, usable tables.

Mobile must not be an afterthought.

## Accessibility
Use sufficient contrast, semantic HTML, visible focus states, proper labels, keyboard navigation where practical, and do not rely on color alone.

## Motion
Use subtle motion only when it improves comprehension. Avoid excessive animation. The product should feel fast.

## MCP / UI Tools
Claude Code should inspect available UI/UX MCP tools before major UI work and use them when appropriate. Reuse established patterns, keep output aligned with this document, and never let generated UI override business, accessibility or architecture requirements.

## Design Review Rule
Before implementing a major page, describe:
- page purpose
- primary user action
- information hierarchy
- main components
- responsive behavior

For major UI work, prefer building the visual shell first, reviewing it, then connecting business data.

## Quality Bar
A page is not visually complete if spacing is inconsistent, typography is unclear, components look unrelated, RTL is broken, mobile is unusable, colors are excessive, the main action is hard to find, or important information is buried.

Target a polished, cohesive, professional ISP operations product.
