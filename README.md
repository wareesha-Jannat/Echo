# Echo – Social Media App

![License](https://img.shields.io/badge/License-MIT-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Prisma](https://img.shields.io/badge/Prisma-ORM-blue?logo=prisma)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC?logo=tailwind-css)

Custom-authenticated social media platform featuring chat, media sharing, mood-based posts, and daily questions — powered by Next.js, Prisma, Stream Chat, and Cloudinary.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Screenshots](#screenshots)
- [License](#license)
- [Credits](#credits)

## Features

- Google and credentials login (custom authentication with Argon2 and arctic using lucia-auth the learning resource for auth)
- Real-time chat using Stream Chat with creator-only message deletion
- Media uploads (Cloudinary)
- Mood-based posts and filtering
- Daily Question feature
- Responsive UI with Tailwind CSS

## Tech Stack

- **Frontend:** Next.js 15, React 19, Tailwind CSS
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL
- **Authentication:** Custom Auth with Argon2 and arctic 
- **Chat:** Stream Chat 
- **Media Handling:** Cloudinary

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/wareesha-Jannat/echo-social-media.git

   ```

2. Navigate to project directory:
 ```bash
   cd echo-social-media 

   ```
   

3. Install dependencies:
 ```bash
   npm install --legacy-peer-deps
   
   ```
   
    
4. Start the development server:
    ```bash
   npm run dev
   
   ```

## Test Account
Use the following credentials to explore the app after running locally:

- **Username:** jorge@jim
- **Password:** deftones

## Usage

The application will be deployed soon.  
For now, clone the repository and run locally (see [Installation](#installation) section).

## Screenshots

Screenshots will be added after deployment.

## License

This project is licensed under the [MIT License](LICENSE).

## Credits

- Starter template from [Coding in Flow](https://github.com/codinginflow/nextjs-15-social-media-app/tree/0-Starting-point) (YouTube Tutorial).
- Circle icons created by [IYAHICON - Flaticon](https://www.flaticon.com/free-icons/circle).
