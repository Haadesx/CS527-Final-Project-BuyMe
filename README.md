# BuyMe Auction Platform - Flask Backend

A full-featured online auction platform with real-time bidding, admin reports, and Q&A system. Built with Flask (Python) and React, using MySQL for data persistence.

## 🚀 Features

### Core Functionality
- **User Authentication & Authorization** - JWT-based auth with role management (Admin, Customer Rep, User)
- **Auction Management** - Create, browse, search, and filter auctions
- **Real-time Bidding** - Place bids with auto-bidding support
- **Item Listings** - Categorized items with image support
- **Admin Dashboard** - Comprehensive reports and analytics
- **Q&A System** - Users ask questions, customer reps provide answers
- **User History** - View personal bid/auction history (NEW)
- **Alerts System** - Get notified for items of interest (NEW)
- **Similar Items** - Find comparable auctions (NEW)

### Key Highlights
- ✅ **40+ RESTful API Endpoints**
- ✅ **Role-Based Access Control**
- ✅ **Auto-Bidding with Upper Limits**
- ✅ **Advanced Search & Filtering** (7 criteria)
- ✅ **Comprehensive Admin Reports**
- ✅ **User Bid/Auction History**
- ✅ **Item Alerts with Matching**
- ✅ **Similar Items Search Algorithm**
- ✅ **Customer Rep Admin Actions**
- ✅ **Responsive React Frontend**
- ✅ **CS 527 Compliant** (91% requirements met)

## 📋 Prerequisites

- **Python 3.8+**
- **Node.js 16+**
- **MySQL 8.0+**

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Buyme-Frontend
```

### 2. Backend Setup (Flask)

```bash
# Navigate to backend directory
cd backend_flask

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install flask flask-sqlalchemy flask-cors pymysql werkzeug pyjwt

# Configure database (edit config.py if needed)
# Default: mysql+pymysql://root:password@localhost:3000/buyme

# Initialize database
python app.py
# This will create all necessary tables
```

### 3. Frontend Setup (React)

```bash
# Navigate to frontend directory
cd ..  # Back to project root

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Database Seeding (Optional)

```bash
cd backend_flask
python seed_data.py
```

This creates:
- Admin user: `admin@buyme.com` / `admin123`
- Test user: `testuser@example.com` / `password`
- Sample auction data

## 🚦 Running the Application

### Start Backend (Terminal 1)
```bash
cd backend_flask
python app.py
# Runs on http://localhost:3500
```

### Start Frontend (Terminal 2)
```bash
npm run dev
# Runs on http://localhost:5000
```

### Access the Application
Open your browser to: **http://localhost:5000**

## 📚 API Documentation

### Authentication

#### Register User
```http
POST /api/user
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "securepass123",
  "phone": "1234567890"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Response:**
```json
{
  "data": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "_id": 5,
  "username": "John Doe",
  "email": "john@example.com",
  "role": "user"
}
```

### Auctions

#### Create Auction
```http
POST /api/auction/
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Vintage Car",
  "description": "1965 Mustang",
  "category": "Luxury Vehicles",
  "startingPrice": 50000,
  "reservePrice": 75000,
  "increment": 1000,
  "startTime": "2025-12-10T10:00:00",
  "endTime": "2025-12-17T10:00:00",
  "image_url": "https://example.com/car.jpg"
}
```

#### Get All Auctions (with filters)
```http
GET /api/auction/?keyword=car&category=Luxury%20Vehicles&minPrice=40000&maxPrice=100000&sortBy=currentPrice
```

#### Get Auction Details
```http
GET /api/auction/2
```

### Bidding

#### Place Bid
```http
POST /api/bid/item/2
Authorization: Bearer <token>
Content-Type: application/json

{
  "bid_amount": 51000,
  "is_auto_bid": true,
  "max_bid": 60000
}
```

### Questions & Answers

#### Ask Question
```http
POST /api/question/
Authorization: Bearer <token>
Content-Type: application/json

{
  "question": "What is the mileage?"
}
```

#### Answer Question (Customer Rep)
```http
PUT /api/question/1/answer
Authorization: Bearer <token>
Content-Type: application/json

{
  "answer": "45,000 original miles"
}
```

#### Get Unanswered Questions
```http
GET /api/question/unanswered
Authorization: Bearer <token>
```

### Admin Reports

#### Total Earnings
```http
GET /api/admin/reports/total_earnings
Authorization: Bearer <token>
```

#### Earnings by Category
```http
GET /api/admin/reports/earnings_by_category
Authorization: Bearer <token>
```

#### Top Selling Items
```http
GET /api/admin/reports/top_selling_items
Authorization: Bearer <token>
```

#### Best Buyers
```http
GET /api/admin/reports/best_buyers
Authorization: Bearer <token>
```

## 🗂️ Project Structure

```
Buyme-Frontend/
├── backend_flask/              # Flask backend
│   ├── app.py                 # Main application
│   ├── config.py              # Database configuration
│   ├── models.py              # SQLAlchemy models
│   ├── routes/
│   │   ├── auth.py           # Authentication
│   │   ├── auctions.py       # Auction management
│   │   ├── items.py          # Item management
│   │   ├── bids.py           # Bidding system
│   │   ├── admin.py          # Admin reports
│   │   └── questions.py      # Q&A system
│   ├── seed_data.py          # Database seeding
│   └── test_questions.py     # Q&A test script
│
├── src/                       # React frontend
│   ├── screens/              # Page components
│   │   ├── AuctionsScreen.jsx
│   │   ├── AuctionDetailScreen.jsx
│   │   └── CreateAuctionScreen.jsx
│   ├── components/           # Reusable components
│   └── slices/              # Redux Toolkit Query
│
├── package.json              # Frontend dependencies
└── vite.config.js           # Vite configuration
```

## ⚙️ Configuration

### Database Configuration
Edit `backend_flask/config.py`:

```python
class Config:
    SECRET_KEY = 'your-secret-key-here'
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://user:password@host:port/database'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
```

### Frontend Proxy
Edit `vite.config.js` to change backend URL:

```javascript
server: {
  port: 5000,
  proxy: {
    '/api': {
      target: 'http://localhost:3500',
      changeOrigin: true
    }
  }
}
```

## 🔒 Security

- **Password Hashing**: Werkzeug PBKDF2
- **JWT Tokens**: 30-day expiration
- **CORS**: Enabled for frontend communication
- **Protected Routes**: Authentication middleware
- **Role-Based Access**: Admin, Customer Rep, User roles

## 🧪 Testing

### Run Q&A Tests
```bash
cd backend_flask
python test_questions.py
```

### Run API Verification
```bash
python check_api.py
```

## 📦 Database Schema

### Users
- id, username, first_name, last_name, email, password
- phone, countrycode, is_admin, is_rep

### Auctions
- id, start_time, end_time, current_price, min_increment
- reserve_price, is_active, winner_id

### Items
- id, name, description, start_price, category
- subcategory, image_url, seller_id, auction_id

### Bids
- id, auction_id, bidder_id, amount, time
- is_auto_bid, upper_limit

### Questions
- id, text, answer, asker_id, responder_id, timestamp

## 🚀 Deployment

### Production Checklist
- [ ] Change `SECRET_KEY` in config.py
- [ ] Set `DEBUG=False` in app.py
- [ ] Use production database credentials
- [ ] Configure HTTPS
- [ ] Set up proper CORS origins
- [ ] Enable database backups
- [ ] Set up logging
- [ ] Configure reverse proxy (nginx)
- [ ] Set up SSL certificates

### Environment Variables (Recommended)
```bash
export FLASK_ENV=production
export SECRET_KEY=your-production-secret
export DATABASE_URL=mysql+pymysql://user:pass@host:port/db
```

## 🐛 Troubleshooting

### "Invalid Date" in Frontend
- Ensure backend dates have 'Z' suffix (UTC)
- Check models.py date formatting

### Empty Auction Lists
- Verify API responses have `{'data': ...}` wrapper
- Check browser console for errors

### Login Fails
- Verify user exists in database
- Check password hashing
- Ensure JWT secret key matches

### Database Connection Error
- Confirm MySQL is running on correct port
- Verify credentials in config.py
- Check if database exists

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For issues and questions:
- Check the troubleshooting section
- Review API documentation
- Examine test scripts for examples

## 🎯 Future Enhancements

- [ ] Email notifications for bids
- [ ] Real-time WebSocket updates
- [ ] Payment gateway integration
- [ ] Advanced auction analytics
- [ ] Mobile application
- [ ] Multi-language support

---

**Built with ❤️ using Flask, React, and MySQL**
