<div align="center">

<div>[ CN ]</div>

# CodeNest — Personal Code & Picture Vault

<p>A private, lightweight home for college practical code snippets and pictures.</p>

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=20232A)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Realtime%20Database-FFCA28?logo=firebase&logoColor=20232A)](https://firebase.google.com/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)

</div>

## About the project

CodeNest is a private, single-user personal tool for storing college practical code snippets and pictures. It provides a lightweight alternative to repeatedly logging into a college WordPress or LMS portal, while keeping the everyday workflow focused on quickly saving, viewing, copying, downloading, and deleting personal material.

## Features

### Authentication

- Firebase email/password login and signup
- Forgot-password flow with a Firebase reset email
- Profile-backed welcome message after login

### Code Snippets

- Add, view, copy, and delete snippets
- Language tags and syntax highlighting
- Snippet metadata stored in Firebase Realtime Database
- Code content stored locally in the browser for the current device

### Pictures

- Upload pictures from a PC and give each picture a name
- Store image data as base64 in Firebase Realtime Database
- Download pictures directly from the gallery
- Delete pictures with a confirmation dialog

### Profile

- Edit name and profile photo
- Show the authenticated email address
- Use an initial-letter fallback avatar when no photo is available

### UI/UX

- Glassmorphism interface with an ocean background
- Cream and terracotta color palette
- Responsive layouts for desktop, tablet, and mobile
- Shared success and error toast notifications
- Animated 1-100% loading screen

## Tech stack

### Frontend

| Technology | Role |
| --- | --- |
| [React](https://react.dev/) | Component-based user interface |
| [TypeScript](https://www.typescriptlang.org/) | Static typing |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling |
| [Vite](https://vite.dev/) | Development server and production bundler |

### Backend/Services

| Service | Role |
| --- | --- |
| [Firebase Authentication](https://firebase.google.com/docs/auth) | Email/password accounts and password reset |
| [Firebase Realtime Database](https://firebase.google.com/docs/database) | Profiles, snippet metadata, and base64 pictures |

There is no separate backend server. CodeNest uses Firebase as a serverless BaaS architecture, with the browser communicating directly with Firebase.

## Architecture

```text
User Browser
     |
     v
React App (hosted on Vercel or Netlify)
     |
     v
Firebase (Authentication + Realtime Database)
```

## Project structure

```text
.
├── public/
│   ├── forest.jpg
│   ├── icons.svg
│   └── ocean.jpg
├── src/
│   ├── assets/
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── components/
│   │   ├── AddSnippetModal.tsx
│   │   ├── CodeEntryCard.tsx
│   │   ├── EditProfileModal.tsx
│   │   ├── ImageGallery.tsx
│   │   ├── LoadingScreen.tsx
│   │   ├── NamePictureModal.tsx
│   │   ├── ProfileDropdown.tsx
│   │   ├── Toast.tsx
│   │   └── ToastContainer.tsx
│   ├── lib/
│   │   ├── firebase.ts
│   │   ├── imageUtils.ts
│   │   └── storage.ts
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── LoginPage.tsx
│   │   └── SignupPage.tsx
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .env.example
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or newer
- A Firebase project

### Installation

```bash
git clone <repository-url>
cd codenest
npm install
```

### Firebase project setup

1. Create or open a project in the [Firebase Console](https://console.firebase.google.com/).
2. Register a web app and copy its configuration values.
3. Enable **Authentication > Sign-in method > Email/Password**.
4. Create a **Realtime Database** in the region you prefer.

### Environment variables

Copy `.env.example` to `.env.local` and fill in the Firebase web app values. Vite only exposes variables prefixed with `VITE_` to the client.

```dotenv
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Never commit `.env` or `.env.local`. The repository ignores environment variants; `.env.example` is the safe template to commit.

### Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Firebase setup

In Firebase Console, open **Realtime Database > Rules** and publish the following rules for the current app configuration:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

Also enable the Email/Password provider under **Authentication > Sign-in method** before creating an account.

## Deployment

Build the frontend with `npm run build`, then deploy the generated `dist/` directory to [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/). Add the production Firebase environment variables in the hosting provider’s project settings, and add the production domain to Firebase Authentication’s **Authorised Domains** list.

<div align="center">

Built as a simple, private space to store code and pictures — no more logging into the college portal.

</div>
