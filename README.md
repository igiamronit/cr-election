# Anonymous Voting Platform 🗳️

A simple anonymous voting system for class elections. Built for my college project using React + Node.js.

## What it does
- Creates 36 unique voting keys for students
- Supports up to 3 candidates
- Anonymous voting (no one knows who voted for whom)
- Real-time results
- Admin panel to control everything

## Tech Stack
- **Frontend**: React.js (hosted on GitHub Pages)
- **Backend**: Node.js + Express (hosted on Render)
- **Database**: File storage (JSON files)
- **Authentication**: JWT tokens

## Quick Setup

1. **Clone the repo**
   ```bash
   git clone <your-repo-url>
   cd anonymous-voting
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd client && npm install && cd ..
   ```

3. **Create .env file**
   ```env
   JWT_SECRET=your_secret_key_here
   ADMIN_PASSWORD=your_admin_password
   NODE_ENV=development
   PORT=5000
   ```

4. **Run the app**
   ```bash
   # Backend
   npm run dev

   # Frontend (new terminal)
   npm run client
   ```

5. **Open browser**
   - App: http://localhost:3000
   - API: http://localhost:5000

## How to Use

### For Admin:
1. Go to `/admin` 
2. Login with your admin credentials
3. Generate 36 voting keys
4. Add candidates (max 3)
5. Start voting session
6. Share keys with students
7. Monitor results in real-time

### For Students:
1. Go to main page
2. Enter your unique voting key
3. Select a candidate
4. Vote!
5. Check results page

## Live Demo
- **Frontend**: https://igiamronit.github.io/cr-election
- **Backend**: https://cr-election-uk6a.onrender.com

## Features
- ✅ Completely anonymous voting
- ✅ One vote per key
- ✅ Real-time results
- ✅ Mobile responsive
- ✅ No database required (uses JSON files)
- ✅ Easy deployment

## Project Structure
```
anonymous-voting/
├── client/                 # React frontend
│   ├── src/
│   ├── build/             # Built files for GitHub Pages
│   └── package.json
├── routes/                # API routes
├── utils/                 # File storage utilities
├── data/                  # JSON data files (auto-created)
├── server.js              # Main server file
└── package.json
```

## Deployment

### Frontend (GitHub Pages)
1. Build: `cd client && npm run build`
2. Deploy: `npm run deploy`

### Backend (Render)
1. Connect GitHub repo to Render
2. Set environment variables in Render dashboard
3. Deploy

## Security Notes
- Each voting key is 32 characters long
- Keys are hashed when storing votes
- Admin authentication required
- No way to trace votes back to individuals

## Troubleshooting

**500 errors?** 
- Check if all routes use file storage instead of MongoDB
- Verify environment variables are set

**CORS errors?**
- Update server.js with correct frontend URLs

**Keys not working?**
- Make sure admin generated keys first
- Check if voting session is active

## Made by
Ronit Ranjan

Built with ❤️ and lots of chatgpt help!