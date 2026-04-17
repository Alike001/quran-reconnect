# QuranReconnect

QuranReconnect is a web application designed to help users sustain their connection with the Quran beyond Ramadan through reading, listening, bookmarking, and progress tracking.

## Features

- Read Quran ayahs in Arabic  
- View English translation  
- Listen to Quran recitation audio  
- Open tafsir (with fallback if unavailable)  
- Jump to any surah  
- Bookmark ayahs  
- Continue from last read ayah  
- Track reading progress  
- Dashboard for bookmarks and progress  
- Quran Foundation sign-in for user features  

## Problem

Many people reconnect deeply with the Quran during Ramadan but struggle to maintain that consistency afterward.


## Solution

QuranReconnect provides a simple and distraction-free experience that helps users:

- build a daily Quran habit  
- track their reading journey  
- easily return to where they stopped  
- engage with the Quran through reading and listening  

## Tech Stack

- React  
- Vite  
- JavaScript  
- Node.js (backend for secure API handling)  
- Quran Foundation Content API  
- Quran Foundation User API  

## API Usage

### Content API
Used for:
- Quran ayah text  
- translation  
- audio recitation  
- surah list  

### User API
Used for:
- sign-in  
- bookmarks  
- reading progress  

## Architecture

- Frontend: React + Vite  
- Backend: Node.js (handles authentication and secure API calls)  

## 🚀 Local Setup

### 1. Clone repository

git clone https://github.com/Alike001/quran-reconnect.git 
cd quran-reconnect  

### 2. Install dependencies

npm install  

### 3. Create `.env`

VITE_APP_API_BASE=/api  
VITE_USE_MOCK_FALLBACK=false  

PORT=3002  
FRONTEND_BASE_URL=http://localhost:5173  

QF_ENV=prelive  
QF_CLIENT_ID=YOUR_CLIENT_ID  
QF_CLIENT_SECRET=YOUR_CLIENT_SECRET  
QF_REDIRECT_URI=http://localhost:3002/api/auth/callback  

QF_TRANSLATION_ID=20  
QF_TAFSIR_ID=169  
QF_RECITATION_ID=2  
QF_MUSHAF_ID=1  

SESSION_SECRET=your_random_secret  

### 4. Start backend

npm run server  

### 5. Start frontend

npm run dev  


## Project Goal

QuranReconnect helps transform Quran engagement from a seasonal Ramadan habit into a consistent daily practice.


## Acknowledgement

Built for the Quran Foundation Ramadan 2026 Hackathon.