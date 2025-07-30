# CupNote API Design

## 🎯 Overview

RESTful API design for CupNote following BMAD Method principles. JWT-based authentication with role-based access control.

## 🔒 Authentication Endpoints

### Register

```http
POST /api/auth/register
```

**Request:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123!",
  "username": "coffeeloaver"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716",
      "email": "user@example.com",
      "username": "coffeeloaver"
    },
    "token": {
      "access_token": "eyJhbGciOiJIUzI1NiIs...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
      "expires_in": 3600
    }
  }
}
```

### Login

```http
POST /api/auth/login
```

**Request:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123!"
}
```

### Refresh Token

```http
POST /api/auth/refresh
```

**Request:**

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

## ☕ Coffee Endpoints

### List Coffees

```http
GET /api/coffees
```

**Query Parameters:**

- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 20)
- `roaster` (string): Filter by roaster name
- `origin` (string): Filter by origin
- `search` (string): Search in name and roaster

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456",
      "name": "Ethiopia Yirgacheffe",
      "roaster": "Blue Bottle Coffee",
      "origin": "Ethiopia",
      "process": "Washed",
      "roast_date": "2024-01-15",
      "tasting_notes": ["Blueberry", "Lemon", "Floral"]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

### Get Coffee Details

```http
GET /api/coffees/:id
```

### Create Coffee

```http
POST /api/coffees
Authorization: Bearer {token}
```

**Request:**

```json
{
  "name": "Colombia Geisha",
  "roaster": "Onyx Coffee Lab",
  "origin": "Colombia",
  "process": "Natural",
  "roast_date": "2024-01-20",
  "variety": "Geisha",
  "altitude": "1800-2000m",
  "tasting_notes": ["Jasmine", "Bergamot", "Honey"]
}
```

### Update Coffee

```http
PATCH /api/coffees/:id
Authorization: Bearer {token}
```

## 📝 Tasting Note Endpoints

### List My Tasting Notes

```http
GET /api/tasting-notes
Authorization: Bearer {token}
```

**Query Parameters:**

- `mode` (string): Filter by mode (cafe|brew|lab)
- `coffee_id` (string): Filter by coffee
- `start_date` (string): Filter by date range
- `end_date` (string): Filter by date range
- `sort` (string): Sort by field (created_at|-created_at|overall_score)

### Get Tasting Note

```http
GET /api/tasting-notes/:id
Authorization: Bearer {token}
```

### Create Tasting Note

```http
POST /api/tasting-notes
Authorization: Bearer {token}
```

**Request (Cafe Mode):**

```json
{
  "coffee_id": "123e4567-e89b-12d3-a456",
  "mode": "cafe",
  "cafe_name": "Blue Bottle Coffee",
  "cafe_location": "Gangnam, Seoul",
  "menu_item": "Pour Over",
  "overall_score": 4,
  "flavor_notes": ["Chocolate", "Caramel", "Nutty"],
  "aroma": 4,
  "acidity": 3,
  "body": 4,
  "aftertaste": 4,
  "balance": 5,
  "mouthfeel": 7,
  "personal_notes": "진한 바디감이 좋았고..."
}
```

**Request (Brew Mode):**

```json
{
  "coffee_id": "123e4567-e89b-12d3-a456",
  "mode": "brew",
  "brew_method": "V60",
  "water_temp": 93,
  "grind_size": "Medium",
  "brew_time": "2:30",
  "coffee_weight": 15,
  "water_weight": 250,
  "brew_ratio": "1:16.7",
  "timer_laps": [
    {
      "lap_number": 1,
      "label": "뜸들이기 (Blooming)",
      "duration": 30000,
      "total_time": 30000
    },
    {
      "lap_number": 2,
      "label": "1차 추출",
      "duration": 40000,
      "total_time": 70000
    },
    {
      "lap_number": 3,
      "label": "2차 추출",
      "duration": 50000,
      "total_time": 120000
    }
  ],
  "overall_score": 5,
  "flavor_notes": ["Fruity", "Bright", "Clean"],
  "personal_notes": "완벽한 추출! 다음에도 이 레시피로..."
}
```

### Update Tasting Note

```http
PATCH /api/tasting-notes/:id
Authorization: Bearer {token}
```

### Delete Tasting Note

```http
DELETE /api/tasting-notes/:id
Authorization: Bearer {token}
```

## 📖 Recipe Endpoints

### List My Recipes

```http
GET /api/recipes
Authorization: Bearer {token}
```

**Query Parameters:**

- `is_favorite` (boolean): Filter favorites only
- `brew_method` (string): Filter by brew method
- `coffee_id` (string): Filter by coffee

### Get Recipe

```http
GET /api/recipes/:id
Authorization: Bearer {token}
```

### Create Recipe

```http
POST /api/recipes
Authorization: Bearer {token}
```

**Request:**

```json
{
  "name": "My Perfect V60",
  "description": "15g coffee with 250g water, blooming first",
  "coffee_id": "123e4567-e89b-12d3-a456",
  "brew_method": "V60",
  "water_temp": 93,
  "grind_size": "Medium",
  "coffee_weight": 15,
  "water_weight": 250,
  "brew_ratio": "1:16.7",
  "brew_time": "2:30",
  "brew_steps": [
    {
      "step_number": 1,
      "description": "Bloom with 30g water",
      "duration": 30,
      "water_amount": 30
    },
    {
      "step_number": 2,
      "description": "Pour to 120g in circular motion",
      "duration": 30,
      "water_amount": 90
    },
    {
      "step_number": 3,
      "description": "Final pour to 250g",
      "duration": 60,
      "water_amount": 130
    }
  ],
  "is_public": false,
  "is_favorite": true
}
```

### Update Recipe

```http
PATCH /api/recipes/:id
Authorization: Bearer {token}
```

### Delete Recipe

```http
DELETE /api/recipes/:id
Authorization: Bearer {token}
```

### Use Recipe (increment usage count)

```http
POST /api/recipes/:id/use
Authorization: Bearer {token}
```

## 🏆 Achievement Endpoints

### List All Achievements

```http
GET /api/achievements
```

### Get My Achievements

```http
GET /api/users/me/achievements
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "earned": [
      {
        "id": "ach_001",
        "name": "First Taste",
        "description": "Record your first tasting note",
        "icon": "🎉",
        "category": "tasting",
        "points": 10,
        "earned_at": "2024-01-15T10:30:00Z"
      }
    ],
    "in_progress": [
      {
        "id": "ach_010",
        "name": "Coffee Explorer",
        "description": "Taste 10 different coffees",
        "icon": "🌍",
        "category": "exploration",
        "requirement_value": 10,
        "current_progress": 7,
        "points": 50
      }
    ],
    "total_points": 180
  }
}
```

## 📊 Statistics Endpoints

### Get My Statistics

```http
GET /api/users/me/stats
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "total_tastings": 47,
    "total_coffees": 23,
    "favorite_roaster": "Blue Bottle Coffee",
    "favorite_origin": "Ethiopia",
    "average_score": 4.2,
    "mode_breakdown": {
      "cafe": 20,
      "brew": 25,
      "lab": 2
    },
    "flavor_profile": {
      "Fruity": 15,
      "Chocolate": 12,
      "Nutty": 8,
      "Floral": 7
    },
    "monthly_tastings": [
      { "month": "2024-01", "count": 12 },
      { "month": "2023-12", "count": 15 }
    ]
  }
}
```

## 🔍 Search Endpoints

### Global Search

```http
GET /api/search
Authorization: Bearer {token}
```

**Query Parameters:**

- `q` (string): Search query
- `type` (string): Filter by type (coffee|note|recipe)

## 📷 Photo Upload

### Upload Photo

```http
POST /api/upload/photo
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Response:**

```json
{
  "success": true,
  "data": {
    "url": "https://storage.cupnote.com/photos/123e4567.jpg",
    "thumbnail_url": "https://storage.cupnote.com/photos/123e4567_thumb.jpg"
  }
}
```

## 🔐 Error Responses

### Standard Error Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  },
  "meta": {
    "request_id": "req_123456",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Error Codes

- `UNAUTHORIZED`: 401 - Authentication required
- `FORBIDDEN`: 403 - Insufficient permissions
- `NOT_FOUND`: 404 - Resource not found
- `VALIDATION_ERROR`: 400 - Invalid input
- `CONFLICT`: 409 - Resource already exists
- `INTERNAL_ERROR`: 500 - Server error

## 🔧 Rate Limiting

- **Anonymous**: 100 requests per hour
- **Authenticated**: 1000 requests per hour
- **Premium**: 10000 requests per hour

**Headers:**

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 998
X-RateLimit-Reset: 1642255200
```

## 📋 API Versioning

**URL Versioning:**

```
/api/v1/coffees
/api/v2/coffees  # Future version
```

**Deprecation Policy:**

- 6 months notice before deprecation
- Sunset header in responses
- Migration guide provided
