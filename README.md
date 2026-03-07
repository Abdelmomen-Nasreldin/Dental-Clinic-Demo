# Dental Clinic Patient Tracking System

A frontend demo application for dental clinics to track patient status, visit history, and follow-up scheduling. Built with **Angular 19** and **Tailwind CSS**.

## Features

- **Dashboard** — At-a-glance KPI cards (total patients, status breakdown) and upcoming follow-up list.
- **Patients List** — Searchable, filterable table showing every patient with their tracking status, last visit, and next follow-up date.
- **Patient Profile** — Detailed view with inline editing, status changes, follow-up scheduling, note entry, and a full history timeline.
- **Tracking Statuses** — New, In Treatment, Follow-Up Needed, Completed.
- **In-Memory Data** — All data lives in Angular signals (no backend required). Six sample patients are pre-loaded for demo purposes.

## Pages & Workflow

| Route | Page | Purpose |
|---|---|---|
| `/dashboard` | Dashboard | Overview KPIs and upcoming follow-ups |
| `/patients` | Patients List | Search, filter, add, and delete patients |
| `/patient-profile/:id` | Patient Profile | View/edit details, change status, schedule follow-ups, add notes, review history |

### Typical demo flow

1. Open the **Dashboard** to see patient counts by status.
2. Click a KPI card to jump to the **Patients List** pre-filtered by that status.
3. Click any patient row to open their **Profile**.
4. Change the tracking status, set a follow-up date, or add a clinical note — changes reflect immediately everywhere.

## Getting Started

```bash
npm install
ng serve
```

Open [http://localhost:4200](http://localhost:4200).

## Tech Stack

- Angular 19 (standalone components, signals)
- Tailwind CSS 3
- SweetAlert2 for notifications
