# Credit Card Payment System

A full-stack fintech simulation app: **React + Tailwind** frontend, **Django REST Framework** backend, **FastAPI** payment microservice, **MySQL** database.

---

## 🚀 Quick Start (Docker)

```bash
docker-compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Django API | http://localhost:8000/api/ |
| Django Swagger | http://localhost:8000/swagger/ |
| FastAPI Swagger | http://localhost:8001/docs |

---

## 🔑 Admin Credentials

| Field | Value |
|-------|-------|
| Email | `admin@creditcard.com` |
| Password | `Admin@123456` |

---

## 🛠️ Local Development Setup

### 1. MySQL Database
```sql
CREATE DATABASE creditcard_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Django Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py create_admin
python manage.py runserver   # http://localhost:8000
```

### 3. FastAPI Payment Service
```bash
cd payment_service
pip install -r requirements.txt
uvicorn payment_service.main:app --port 8001 --reload
# Swagger: http://localhost:8001/docs
```

### 4. React Frontend
```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

---

## 📡 API Endpoints (Django)

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register user |
| POST | `/api/auth/login/` | Login (returns JWT) |
| POST | `/api/auth/logout/` | Logout (blacklists token) |
| GET/PUT | `/api/auth/profile/` | User profile |
| POST | `/api/auth/change-password/` | Change password |
| POST | `/api/auth/token/refresh/` | Refresh JWT |

### Cards
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cards/` | List user's cards |
| POST | `/api/cards/` | Add card (masked) |
| GET | `/api/cards/{id}/` | Card detail |
| PATCH | `/api/cards/{id}/` | Update card |
| DELETE | `/api/cards/{id}/` | Delete card |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions/?status=SUCCESS&date_from=2024-01-01` | List + filter |
| POST | `/api/transactions/create/` | Create PENDING transaction |
| PATCH | `/api/transactions/update-status/{ref_id}/` | Update to SUCCESS/FAILED |

### Admin Panel (admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin-panel/users/` | List all users |
| PATCH | `/api/admin-panel/users/{id}/` | Update user |
| DELETE | `/api/admin-panel/users/{id}/` | Delete user |
| GET | `/api/admin-panel/cards/` | List all cards |
| GET | `/api/admin-panel/transactions/` | List all transactions |
| GET | `/api/admin-panel/transactions/export/csv/` | Export CSV |
| GET | `/api/admin-panel/summary/daily/` | Daily summary |
| GET | `/api/admin-panel/logs/` | Admin action logs |

### FastAPI Payment (port 8001)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payments/process` | Process payment |
| GET | `/health` | Health check |

---

## 🔒 Security

- ✅ **No CVV storage** — never accepted by API
- ✅ **Masked card numbers** — only last 4 digits stored
- ✅ **Hashed passwords** — PBKDF2-SHA256 via Django
- ✅ **JWT authentication** — shared secret between Django & FastAPI
- ✅ **Token blacklist** — logout invalidates refresh tokens
- ✅ **SQL Injection protection** — Django ORM only (no raw queries)
- ✅ **User-scoped access** — users can only access their own cards/transactions

---

## 🧪 Running Tests

```bash
# Django tests (accounts, cards, transactions)
cd backend
python manage.py test --verbosity=2

# FastAPI tests
cd payment_service
pip install pytest pytest-asyncio httpx
pytest tests/ -v --cov=. --cov-report=term-missing
```

---

## 📦 Project Structure

```
creditcard_payment_system/
├── backend/                    # Django REST Framework
│   ├── accounts/               # Auth: register, login, JWT, logout
│   ├── cards/                  # Card management (masked)
│   ├── transactions/           # Transaction history + filtering
│   ├── admin_panel/            # Admin: users, cards, CSV export
│   └── backend/                # Django settings, URLs
├── payment_service/            # FastAPI microservice
│   ├── main.py                 # Payment simulation endpoint
│   ├── schemas.py              # Pydantic models
│   └── tests/                  # pytest tests
├── frontend/                   # React + Tailwind CSS
│   └── src/
│       ├── pages/              # LoginPage, Dashboard, Cards, etc.
│       ├── components/         # Navbar, ProtectedRoute
│       ├── context/            # AuthContext
│       └── api.js              # Axios + JWT interceptor
├── docker-compose.yml
└── README.md
```

---

## 🗄️ Database Dump

After starting with Docker, export:
```bash
docker exec creditcard_mysql mysqldump -u root -proot123 creditcard_db > database_dump.sql
```
