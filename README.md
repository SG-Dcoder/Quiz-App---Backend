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

## 📚 API Documentation

### Root Metadata  
**GET** `/api/`
```json
{
  "success": true,
  "message": "Quiz API v1",
  "version": "1.0.0",
  "endpoints": {
    "quizzes": {
      "POST /api/v1/quizzes": "Create a new quiz",
      "GET /api/v1/quizzes": "Get all quizzes",
      "GET /api/v1/quizzes/:id": "Get quiz by ID",
      "DELETE /api/v1/quizzes/:id": "Delete a quiz",
      "GET /api/v1/quizzes/:id/statistics": "Get quiz statistics"
    },
    "questions": {
      "POST /api/v1/quizzes/:id/questions": "Add question to quiz",
      "GET /api/v1/quizzes/:id/questions": "Get quiz questions for taking"
    },
    "submissions": {
      "POST /api/v1/quizzes/:id/submit": "Submit quiz answers and get score"
    }
  },
  "documentation": "https://github.com/your-repo/quiz-api#api-documentation"
}
```

### Quiz Management

#### Create Quiz  
**POST** `/api/v1/quizzes`  
```json
{ "title": "JavaScript 101", "description": "Basic JS quiz" }
```

#### Get All Quizzes  
**GET** `/api/v1/quizzes`

#### Get Quiz by ID  
**GET** `/api/v1/quizzes/:id`

#### Delete Quiz  
**DELETE** `/api/v1/quizzes/:id`

#### Get Quiz Statistics  
**GET** `/api/v1/quizzes/:id/statistics`

### Question Management

#### Add Question  
**POST** `/api/v1/quizzes/:id/questions`  
```json
{
  "question_text": "What is 2+2?",
  "question_type": "single_choice",
  "options": [
    { "option_text": "4", "is_correct": true },
    { "option_text": "3", "is_correct": false }
  ]
}
```

#### Get Questions (for taking)  
**GET** `/api/v1/quizzes/:id/questions`

### Quiz Submission

#### Submit Answers  
**POST** `/api/v1/quizzes/:id/submit`  
```json
{
  "answers": [
    { "question_id": 1, "selected_option_ids": [2] },
    { "question_id": 2, "text_answer": "A closure is ..." }
  ]
}
```

## 💬 Response Format
All responses:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* payload */ },
  "timestamp": "2025-09-27T...Z"
}
```

## 🧪 Testing
Run tests:
```bash
npm test
npm run test:coverage
```

## 🐛 Troubleshooting
- Ensure SQLite DB file has write permissions  
- Change `PORT` in `.env` if in use  
- Reinstall dependencies: `rm -rf node_modules && npm install`

## 👨‍💻 Author
Built with ❤️ by Suraj Ghosh

---

For support, open an issue in the repository.
