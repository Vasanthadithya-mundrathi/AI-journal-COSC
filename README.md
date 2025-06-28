# AI-Powered Journal App

This is a simple journal application that uses the Gemini API to analyze the mood of your journal entries and provide a summary. The application is built with a React frontend and a Python (FastAPI) backend.

## Features

*   **Create, Read, and Delete Journal Entries:** Basic CRUD functionality for your journal entries.
*   **AI-Powered Mood Analysis:** Automatically detects the mood of your journal entries.
*   **AI-Powered Summarization:** Provides a short summary of your journal entries.
*   **In-Memory Storage:** Journal entries are stored in memory and will be cleared when the server restarts.

## Technologies Used

*   **Frontend:** React
*   **Backend:** Python, FastAPI
*   **AI:** Google Gemini

## Sample Journal Entries

| Title         | Content                                                                                                  | Mood         | Summary                                 |
|---------------|----------------------------------------------------------------------------------------------------------|--------------|------------------------------------------|
| A Great Day   | Today was a great day. I went to the park and had a picnic with my friends. The weather was perfect.     | happy        | A happy day spent with friends at the park. |
| A Tough Day   | Today was a tough day. I had a lot of work to do and I felt overwhelmed. I hope tomorrow is better.      | overwhelmed  | A tough day with a lot of work.          |

## Setup and Installation

1.  **Clone the repository:**
    ```
    git clone https://github.com/Vasanthadithya-mundrathi/AI-journal-COSC.git
    ```
2.  **Navigate to the project directory:**
    ```
    cd AI-journal-COSC
    ```
3.  **Install backend dependencies:**
    ```
    pip install -r backend/requirements.txt
    ```
4.  **Install frontend dependencies:**
    ```
    cd frontend
    npm install
    ```
5.  **Create a `.env` file in the `backend` directory and add your Gemini API key:**
    ```
    GEMINI_API_KEY=your_api_key
    ```
6.  **Start the backend server:**
    ```
    cd backend
    python3 server.py
    ```
7.  **Start the frontend server:**
    ```
    cd frontend
    npm start
    ```

## Deployment on Render

To deploy this application on Render, you will need to create two services: a **Web Service** for the backend and a **Static Site** for the frontend.

### Backend Deployment (Web Service)

1.  **Create a new Web Service on Render.**
2.  **Connect your GitHub repository.**
3.  **Use the following settings:**
    *   **Name:** `ai-journal-backend` (or any name you prefer)
    *   **Root Directory:** `backend`
    *   **Environment:** `Python 3`
    *   **Build Command:** `pip install -r requirements.txt`
    *   **Start Command:** `uvicorn server:app --host 0.0.0.0 --port 10000`
4.  **Add an environment variable:**
    *   **Key:** `GEMINI_API_KEY`
    *   **Value:** Your Gemini API key

### Frontend Deployment (Static Site)

1.  **Create a new Static Site on Render.**
2.  **Connect your GitHub repository.**
3.  **Use the following settings:**
    *   **Name:** `ai-journal-frontend` (or any name you prefer)
    *   **Root Directory:** `frontend`
    *   **Build Command:** `npm install && npm run build`
    *   **Publish Directory:** `build`
4.  **Add an environment variable:**
    *   **Key:** `REACT_APP_BACKEND_URL`
    *   **Value:** The URL of your backend service (e.g., `https://ai-journal-backend.onrender.com`)
