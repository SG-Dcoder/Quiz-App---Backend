# Quiz Application Backend API

A RESTful API for a quiz application built with Node.js, Express.js, and SQLite. This API provides endpoints for creating quizzes, adding questions, and submitting answers with scoring functionality.

## 🚀 Features

### Core Features
- **Quiz Management**  
  • Create a new quiz  
  • Retrieve all quizzes  
  • Retrieve a quiz by ID  
  • Delete a quiz  
  • Retrieve quiz statistics  

- **Question Management**  
  • Add questions to a quiz (multiple choice, single choice, text)  
  • Fetch quiz questions for taking (without revealing correct answers)  

- **Quiz Taking & Submission**  
  • Submit answers for a quiz  
  • Receive instant scoring: `{ "score": 3, "total": 5, "percentage": 60 }`

### Bonus Features
- **Validation**: Input validation with express-validator  
- **Text Limits**: 300-character limit for text-based questions  
- **Error Handling**: Global error middleware with custom messages  
- **Testing**: Unit and integration tests with Jest & Supertest  

## 🛠️ Technology Stack
- Node.js  
- Express.js  
- SQLite3  
- express-validator  
- Jest & Supertest  
- Helmet, CORS, Morgan  

## 📁 Project Structure
```
quiz-api/
├── src/
│   ├── config/        # database.js
│   ├── controllers/   # quizController.js
│   ├── middleware/    # errorHandler.js, validation.js
│   ├── models/        # Quiz.js, Question.js
│   ├── routes/        # quizRoutes.js, index.js
│   ├── services/      # quizService.js
│   └── utils/         # responseHelper.js
├── tests/
│   ├── unit/          # services & controllers tests
│   └── integration/   # API endpoint tests
├── app.js             # Express app setup
├── server.js          # Server entry point
├── .env.example       # Example environment variables
└── package.json       # Dependencies & scripts
```  

## 🚦 Quick Start

### Prerequisites
- Node.js (v14+)
- npm

### Installation
```bash
git clone <repository-url>
cd quiz-api
npm install
cp .env.example .env       # edit if necessary
npm run dev                # start development server
```

API Base URL: `http://localhost:3000/api/v1`

### Scripts
- `npm start` – start production server  
- `npm run dev` – start dev server with nodemon  
- `npm test` – run tests  
- `npm run test:watch` – watch mode  
- `npm run test:coverage` – coverage report  

---

## 📚 API Endpoints with Examples

### 1. Create a Quiz

**Request**  
POST `/api/v1/quizzes`  
```bash
curl -X POST http://localhost:3000/api/v1/quizzes \
  -H "Content-Type: application/json" \
  -d '{"title":"JavaScript 101","description":"Basic JS quiz"}'
```

**Response** (201 Created)  
```json
{
  "success": true,
  "message": "Quiz created successfully",
  "data": {
    "id": 1,
    "title": "JavaScript 101",
    "description": "Basic JS quiz",
    "created_at": "2025-09-27T...",
    "updated_at": "2025-09-27T..."
  },
  "timestamp": "2025-09-27T..."
}
```

---

### 2. Get All Quizzes

**Request**  
GET `/api/v1/quizzes`  
```bash
curl http://localhost:3000/api/v1/quizzes
```

**Response** (200 OK)  
```json
{
  "success": true,
  "message": "Quizzes fetched successfully",
  "data": [
    {
      "id": 1,
      "title": "JavaScript 101",
      "description": "Basic JS quiz",
      "created_at": "2025-09-27T...",
      "updated_at": "2025-09-27T...",
      "question_count": 0
    }
  ],
  "timestamp": "2025-09-27T..."
}
```

---

### 3. Get Quiz by ID

**Request**  
GET `/api/v1/quizzes/1`  
```bash
curl http://localhost:3000/api/v1/quizzes/1
```

**Response** (200 OK)  
```json
{
  "success": true,
  "message": "Quiz fetched successfully",
  "data": {
    "id": 1,
    "title": "JavaScript 101",
    "description": "Basic JS quiz",
    "created_at": "2025-09-27T...",
    "updated_at": "2025-09-27T...",
    "question_count": 0
  },
  "timestamp": "2025-09-27T..."
}
```

---

### 4. Delete a Quiz

**Request**  
DELETE `/api/v1/quizzes/1`  
```bash
curl -X DELETE http://localhost:3000/api/v1/quizzes/1
```

**Response** (200 OK)  
```json
{
  "success": true,
  "message": "Quiz deleted successfully",
  "timestamp": "2025-09-27T..."
}
```

---

### 5. Get Quiz Statistics

**Request**  
GET `/api/v1/quizzes/1/statistics`  
```bash
curl http://localhost:3000/api/v1/quizzes/1/statistics
```

**Response** (200 OK)  
```json
{
  "success": true,
  "message": "Quiz statistics fetched successfully",
  "data": {
    "total_submissions": 0,
    "average_score": 0,
    "highest_score": 0,
    "lowest_score": 0
  },
  "timestamp": "2025-09-27T..."
}
```

---

### 6. Add a Question to a Quiz

**Request**  
POST `/api/v1/quizzes/1/questions`  
```bash
curl -X POST http://localhost:3000/api/v1/quizzes/1/questions \
  -H "Content-Type: application/json" \
  -d '{
    "question_text":"What is 2+2?",
    "question_type":"single_choice",
    "options":[
      {"option_text":"4","is_correct":true},
      {"option_text":"3","is_correct":false}
    ]
  }'
```

**Response** (201 Created)  
```json
{
  "success": true,
  "message": "Question added to quiz successfully",
  "data": {
    "id": 1,
    "quiz_id": 1,
    "question_text": "What is 2+2?",
    "question_type": "single_choice",
    "created_at": "2025-09-27T...",
    "options": [
      {"id":1,"option_text":"4","is_correct":true},
      {"id":2,"option_text":"3","is_correct":false}
    ]
  },
  "timestamp": "2025-09-27T..."
}
```

---

### 7. Get Quiz Questions for Taking

**Request**  
GET `/api/v1/quizzes/1/questions`  
```bash
curl http://localhost:3000/api/v1/quizzes/1/questions
```

**Response** (200 OK)  
```json
{
  "success": true,
  "message": "Quiz questions fetched successfully",
  "data": [
    {
      "id": 1,
      "quiz_id": 1,
      "question_text": "What is 2+2?",
      "question_type": "single_choice",
      "options": [
        {"id":1,"option_text":"4"},
        {"id":2,"option_text":"3"}
      ]
    }
  ],
  "timestamp": "2025-09-27T..."
}
```

---

### 8. Submit Quiz Answers

**Request**  
POST `/api/v1/quizzes/1/submit`  
```bash
curl -X POST http://localhost:3000/api/v1/quizzes/1/submit \
  -H "Content-Type: application/json" \
  -d '{
    "answers":[
      {"question_id":1,"selected_option_ids":[1]}
    ]
  }'
```

**Response** (200 OK)  
```json
{
  "success": true,
  "message": "Quiz submitted successfully",
  "data": {
    "score": 1,
    "total": 1,
    "percentage": 100,
    "results": [
      {
        "question_id": 1,
        "question_text": "What is 2+2?",
        "is_correct": true,
        "user_answer": [1]
      }
    ]
  },
  "timestamp": "2025-09-27T..."
}
```

---

## 🐛 Troubleshooting
- Ensure SQLite DB file has write permissions  
- Change `PORT` in `.env` if in use  
- Reinstall dependencies if tests fail:
  ```bash
  rm -rf node_modules
  npm install
  ```

## 🧪 Testing
```bash
npm test
npm run test:coverage
```

## 👨‍💻 Author
Built with ❤️ by Suraj Ghosh
