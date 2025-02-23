Equipment Management API
This API allows users to manage equipment records, including adding, retrieving, updating, and deleting equipment. Authentication is required for all endpoints.

Authentication
All routes require a valid JWT token in the Authorization header as Bearer <token>.

Endpoints
1. Create Equipment
POST /api/equipment

Request Body (JSON):
{
  "name": "Laptop",
  "category": "Electronics",
  "price": 50000,
  "supplier_id": "12345",
  "availability": true
}

Response:
{
  "message": "Equipment added successfully",
  "equipment": { ... }
}

2. Get All Equipment (with Filters & Pagination)
GET /api/equipment?category=Electronics&minPrice=1000&page=1&limit=10

Response:
{
  "page": 1,
  "limit": 10,
  "total": 50,
  "totalPages": 5,
  "equipments": [ ... ]
}

3. Get Equipment by ID
GET /api/equipment/{id}

Response:
{
  "name": "Laptop",
  "category": "Electronics",
  "price": 50000,
  "supplier_id": "12345",
  "availability": true
}

4. Update Equipment
PUT /api/equipment/{id}

Request Body (Partial updates allowed):
{
  "price": 45000
}
Response:
{
  "message": "Equipment updated successfully",
  "equipment": { ... }
}

5. Delete Equipment
DELETE /api/equipment/{id}

Response:
{
  "message": "Equipment deleted successfully"
}

Caching
List and single equipment retrievals are cached using Redis for performance optimization.
Cache expires in 60 seconds or is cleared on updates/deletions.
Error Responses
400 Bad Request – Missing or invalid fields
401 Unauthorized – Invalid or missing JWT
404 Not Found – Equipment does not exist
500 Internal Server Error – Server issues
Include the JWT token in your requests for authentication.


set up .env file and then node index.js to start
