# Fullstack Django + React Project

This project consists of a Django backend and a Vite + React frontend.

## Project Structure

- `/backend`: Django REST Framework project.
- `/frontend`: Vite + React + TypeScript project.

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. The virtual environment is already created. Activate it:
   - Windows: `.\venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`
3. The migrations have already been run. Start the server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Dependencies are already installed. Start the development server:
   ```bash
   npm run dev
   ```

## Features

- **Django REST Framework**: Configured with CORS for frontend communication.
- **Glassmorphism UI**: A modern, premium design for the React application.
- **API Integration**: Frontend is ready to fetch data from the backend.
