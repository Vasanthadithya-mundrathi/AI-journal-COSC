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
