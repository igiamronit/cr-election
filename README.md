# Anonymous Voting Platform

A secure, anonymous voting system built with the MERN stack that supports 36 unique voter keys and up to 3 candidates.

## 🚀 Features

- **Anonymous Voting**: Secure voting system that maintains voter anonymity
- **36 Unique Keys**: Each voter gets a unique 32-character voting key
- **3 Candidate Support**: Host up to 3 candidates in an election
- **Real-time Results**: Live vote counting and result display
- **Admin Dashboard**: Complete administrative control panel
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend**: React.js with React Router
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens
- **Styling**: Custom CSS with modern design

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd anonymous-voting
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/anonymous-voting
   JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
   ADMIN_PASSWORD=admin123
   NODE_ENV=development
   PORT=5000
   ```

5. **Start MongoDB**
   Make sure MongoDB is running on your system

## 🚀 Running the Application

### Development Mode

1. **Start the backend server**
   ```bash
   npm run dev
   ```

2. **Start the frontend (in a new terminal)**
   ```bash
   npm run client
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Production Mode

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## 📖 Usage Guide

### For Voters

1. **Get Your Voting Key**: Receive a unique 32-character key from the administrator
2. **Access Voting**: Go to the voting page and enter your key
3. **Cast Vote**: Select your preferred candidate and submit
4. **View Results**: Check the live results page anytime

### For Administrators

1. **Access Admin Panel**: Go to `/admin` and login with admin password
2. **Generate Keys**: Create 36 unique voting keys for distribution
3. **Set Up Candidates**: Add up to 3 candidates with names and descriptions
4. **Control Voting**: Start/stop voting sessions as needed
5. **Monitor Results**: View real-time statistics and vote counts

## 🔐 Security Features

- **One-time Keys**: Each voting key can only be used once
- **Anonymous Votes**: Votes are stored with hashed keys, not original keys
- **Secure Authentication**: JWT tokens for admin and voter sessions
- **Data Validation**: Input validation on both frontend and backend

## 🎨 System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │────│  Express API    │────│   MongoDB       │
│   (Port 3000)   │    │  (Port 5000)    │    │   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📊 Database Schema

### VotingKey
- `key`: Unique 32-character string
- `used`: Boolean flag
- `usedAt`: Timestamp when used

### Candidate
- `name`: Candidate name
- `description`: Candidate description
- `position`: Display order (1-3)
- `votes`: Vote count

### Vote
- `candidateId`: Reference to candidate
- `keyHash`: Hashed voting key (for anonymity)
- `timestamp`: Vote submission time

### VotingSession
- `isActive`: Session status
- `startTime`: Session start time
- `endTime`: Session end time
- `totalVotes`: Total votes in session

## 🚀 Deployment

### Heroku Deployment

1. **Create Heroku app**
   ```bash
   heroku create your-voting-app
   ```

2. **Set environment variables**
   ```bash
   heroku config:set MONGODB_URI=your_mongodb_connection_string
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set ADMIN_PASSWORD=your_admin_password
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

### Local Production

1. **Set NODE_ENV=production**
2. **Use production MongoDB instance**
3. **Change default admin password**
4. **Use strong JWT secret**

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/anonymous-voting` |
| `JWT_SECRET` | Secret key for JWT tokens | `your_super_secret_jwt_key_here_change_this_in_production` |
| `ADMIN_PASSWORD` | Admin login password | `admin123` |
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network connectivity

2. **Frontend Can't Connect to Backend**
   - Check if backend server is running on port 5000
   - Verify CORS settings
   - Check firewall settings

3. **Admin Login Not Working**
   - Verify admin password in `.env` file
   - Check JWT secret configuration
   - Clear browser localStorage

### Reset System

To reset all data (votes, keys, candidates):
1. Login to admin dashboard
2. Go to "Voting Session" tab
3. Click "Reset All Data"

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the usage guide

## 🔄 Future Enhancements

- [ ] Email integration for key distribution
- [ ] Multiple concurrent elections
- [ ] Voter registration system
- [ ] Enhanced analytics dashboard
- [ ] Mobile app development
- [ ] Blockchain integration for enhanced security
