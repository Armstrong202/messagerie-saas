# Cabinet Ophtalmologie SaaS

## Lancement rapide (PowerShell)
```powershell
cd ophthalmology-saas
.\scripts\start.ps1
```

## Structure
- **Backend**: FastAPI API REST + PostgreSQL
- **Frontend**: React PWA (offline)
- **Admin**: Tableau de bord + stats
- **Offline**: IndexedDB + sync auto

## Endpoints
- `/api/patients` GET/POST
- `/api/appointments` 
- `/api/exams`
- `/api/admin/stats`

## Mode offline: PWA installable

