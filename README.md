AI Quiz generator and Quiz platform

## Key Features

- Dual user roles: Educators and Students
- Real-time quiz notifications
- Secure quiz code verification
- Timed quiz sessions
- Comprehensive result tracking and analysis
- Responsive design for various devices

## Technology Stack

- Frontend: React.js with Tailwind CSS
- Backend: Node.js with Express.js
- Database: MongoDB
- Authentication: JSON Web Tokens (JWT)
- API Integration: Google Generative AI for quiz generation

## Prerequisites

Before setting up Nebula, ensure you have the following installed:

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)
- MongoDB (v4.0 or later)

## Setup Instructions

1. Clone the repository:
   ```
   git clone https://github.com/your-username/nebula.git
   cd nebula
   ```

2. Install dependencies for both frontend and backend:
   ```
   cd frontend
   npm install
   cd ../backend
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   GOOGLE_API_KEY=your_google_api_key
   ```

4. Start the backend server:
   ```
   cd backend
   npm start
   ```

5. In a new terminal, start the frontend development server:
   ```
   cd frontend
   npm run dev
   ```

## Usage Guide

### For Educators

1. Sign up or log in to your educator account.
2. Navigate to the "Create Quiz" section to generate a new quiz.
3. Set quiz parameters such as subject, duration, and number of questions.
4. Review and edit the generated questions if needed.
5. Publish the quiz and share the unique quiz code with students.
6. Access the "Results" section to view and analyze student performance.

### For Students

1. Sign up or log in to your student account.
2. View upcoming quizzes on your dashboard.
3. Receive notifications when a quiz is about to start.
4. Enter the quiz code provided by your educator to access the quiz.
5. Complete the quiz within the allocated time.
6. View your results and performance analytics after submission.

## API Integration

Nebula integrates with the Google Generative AI API for quiz generation. To use this feature:

1. Obtain an API key from the Google Cloud Console.
2. Add the API key to your backend `.env` file.
3. The application will automatically use this API when generating new quizzes.
