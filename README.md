🛒 SnapCart — Hyperlocal Grocery Delivery Platform
A full-stack hyperlocal grocery delivery web application built with Next.js 16 (App Router), MongoDB, Socket.IO and Razorpay. Users order groceries from a local store ("Anuradha Bhandar"), track the delivery boy live on a map, and receive their order with OTP verification. The app has three roles — User, Admin, and Delivery Boy — each with its own dedicated dashboard.

📑 Table of Contents
🛒 SnapCart — Hyperlocal Grocery Delivery Platform
✨ Features
👤 User
🛠️ Admin
🛵 Delivery Boy
🧰 Tech Stack
🏗️ Architecture
📁 Project Structure
✅ Prerequisites
🚀 Getting Started
1. Clone the repository
2. Set up the Next.js app (snapcart/)
3. Set up the Socket Server (socketServer/)
4. Run both servers
🔐 Environment Variables
Next.js app — .env.local
Socket server — .env
🔑 How to get the API keys
👥 Roles & Access
📡 API Endpoints
🔌 Socket Events
💳 Payments (Razorpay Test Mode)
🤝 Contributing
📄 License
✨ Features
👤 User
Login / Register with email-password (bcrypt) or Google OAuth
Browse groceries by 10 categories (Fruits, Dairy, Snacks, Spices, Beverages, etc.)
🔥 Trending, ⭐ Popular, and 🧠 AI-based Recommended product sections
Flash Deals with live countdown timer
Search products, view product details with Flipkart-style ratings & reviews
Cart (Redux Toolkit) with quantity management
Checkout with Coupon codes, COD or Razorpay online payment
Live order tracking on a map with the delivery boy's real-time location
OTP delivery verification
Order history, invoice/PDF download
AI chat assistant (Gemini) with product suggestions
Contact/store section with embedded Google Map
🛠️ Admin
Manage groceries (add / edit / delete with Cloudinary image upload)
Manage orders — update status, view invoices
Create & manage coupons and flash deals
Manage banners
Assign delivery boys to orders
Admin dashboard with analytics (Recharts)
🛵 Delivery Boy
See assigned/current order
Accept / reject orders
Live location sharing (socket server broadcasts location to the user)
Chat with the user in real time
Earnings tracking
Mark order delivered after OTP verification
🧰 Tech Stack
Layer	Technology
Frontend	Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Motion, Embla Carousel
State	Redux Toolkit, React Redux
Backend	Next.js API Routes (Route Handlers)
Database	MongoDB (Mongoose)
Auth	NextAuth v5 (Credentials + Google), bcryptjs, JWT sessions
Payments	Razorpay
Realtime	Socket.IO (client + separate Node server)
Maps	Leaflet, Leaflet-Geosearch, GeoLocation API
AI	Google Gemini API
Files	Cloudinary
Email	Nodemailer (Gmail)
PDF	PDFKit
Other	Axios, Recharts
🏗️ Architecture
SnapCart runs as two processes:

┌──────────────────────────┐       ┌──────────────────────────┐
│  snapcart/ (Next.js)     │       │  socketServer/ (Node)    │
│  ────────────────        │       │  ──────────────          │
│  • UI (React)            │       │  • Socket.IO server      │
│  • API Routes            │  HTTP │  • Room-based chat       │
│  • MongoDB access        │◄────►│  • Broadcasts live        │
│  • Auth / Payments / AI  │       │    delivery location     │
└──────────┬───────────────┘       └──────────┬───────────────┘
           │                                  │
           └────────────── MongoDB ◄──────────┘  (via API calls)
The Next.js app handles everything — pages, server actions, API routes, DB access.
The socket server (plain Express + Socket.IO) handles realtime connections: identity sync, live location broadcast, and chat. It talks back to the Next.js API routes over HTTP (NEXT_PUBLIC_API_URL).
📁 Project Structure
snapCartFolder/
├── snapcart/                  # Next.js application (frontend + backend)
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/           # All API route handlers
│   │   │   ├── admin/         # Admin pages
│   │   │   ├── user/          # User pages (cart, checkout, orders, tracking)
│   │   │   ├── category/      # Category listing
│   │   │   ├── product/       # Product detail + reviews
│   │   │   ├── login/         # Login page
│   │   │   ├── register/      # Register page
│   │   │   ├── layout.tsx     # Root layout
│   │   │   └── page.tsx       # Home (role-based dashboard)
│   │   ├── components/        # Reusable React components
│   │   ├── models/            # Mongoose models (Grocery, Order, User, ...)
│   │   ├── lib/               # db, cloudinary, gemini, socket, mailer
│   │   ├── redux/             # Redux store + slices
│   │   ├── hooks/             # Custom hooks (useGetMe)
│   │   ├── auth.ts            # NextAuth configuration
│   │   └── proxy.ts           # Role-based route protection middleware
│   ├── public/                # Static assets
│   ├── .env.example           # 👈 Copy to .env.local
│   └── package.json
│
├── socketServer/              # Standalone Socket.IO server
│   ├── index.js               # Socket server entry point
│   ├── .env.example           # 👈 Copy to .env
│   └── package.json
│
└── TODO.md
✅ Prerequisites
Node.js ≥ 18 (v20 recommended)
npm (comes with Node)
A MongoDB database (local or MongoDB Atlas free tier)
🚀 Getting Started
1. Clone the repository
git clone https://github.com/your-username/snapcart.git
cd snapCartFolder
2. Set up the Next.js app (snapcart/)
cd snapcart
npm install

# create env file from example
cp .env.example .env.local
# (Windows: copy .env.example .env.local)
Fill in your real credentials in .env.local (see Environment Variables).

3. Set up the Socket Server (socketServer/)
cd ../socketServer
npm install

# create env file from example
cp .env.example .env
4. Run both servers
Terminal 1 — Socket Server (must run first):

cd socketServer
npm run dev        # Socket server on http://localhost:4000
Terminal 2 — Next.js App:

cd snapcart
npm run dev        # App on http://localhost:3000
Open http://localhost:3000 and log in.

💡 The NEXT_PUBLIC_SOCKET_URL in the app must point to the socket server's port, and NEXT_PUBLIC_API_URL in the socket server must point to the Next.js app.

🔐 Environment Variables
Next.js app — .env.local
Variable	Description	Required
MONGODB_URL	MongoDB connection string (Atlas/local)	✅
AUTH_SECRET	Secret for JWT sessions — openssl rand -base64 32	✅
GOOGLE_CLIENT_ID	Google OAuth client ID	✅
GOOGLE_CLIENT_SECRET	Google OAuth client secret	✅
NEXT_PUBLIC_BASE_URL	Public base URL of the app (http://localhost:3000)	✅
NEXT_PUBLIC_SOCKET_URL	Socket server URL (http://localhost:4000)	✅
CLOUDINARY_CLOUD_NAME	Cloudinary cloud name	✅ (image upload)
CLOUDINARY_API_KEY	Cloudinary API key	✅ (image upload)
CLOUDINARY_API_SECRET	Cloudinary API secret	✅ (image upload)
MAIL_USER	Gmail address used by Nodemailer	✅ (contact form)
MAIL_PASS	Gmail App Password (not the normal password)	✅ (contact form)
NEXT_PUBLIC_GEMINI_API_KEY	Google Gemini API key (AI chat suggestions)	Optional
GEMINI_API_KEY	Server-side Gemini key (product descriptions)	Optional
NEXT_PUBLIC_RAZORPAY_KEY_ID	Razorpay public key (test mode: rzp_test_...)	✅ (online payment)
RAZORPAY_KEY_ID	Razorpay key ID (server side)	✅ (online payment)
RAZORPAY_KEY_SECRET	Razorpay key secret (server side)	✅ (online payment)
Socket server — .env
Variable	Description	Required
NEXT_PUBLIC_API_URL	Base URL of the Next.js app (http://localhost:3000)	✅
PORT	Port for the socket server (defaults to 4000)	Optional
⚠️ Never commit real .env / .env.local files. They are git-ignored. Only the .env.example files are committed.

🔑 How to get the API keys
Service	Where to get it
MongoDB Atlas	https://www.mongodb.com/atlas → create a free cluster → copy the connection string
Google OAuth	https://console.cloud.google.com/apis/credentials → create OAuth 2.0 Client ID (Web app)
Cloudinary	https://cloudinary.com → Dashboard shows cloud name, API key & secret
Gemini	https://aistudio.google.com → Get API key
Razorpay	https://dashboard.razorpay.com → Settings → API Keys (use test mode keys)
Gmail App Password	Google account → Security → 2-Step Verification → App Passwords
👥 Roles & Access
Role	Access
user	Shopping, cart, checkout, orders, live tracking, chat
admin	Manage products, orders, coupons, flash deals, banners, assign delivery boys
deliveryBoy	Accept orders, share live location, chat, OTP delivery, earnings
Routes are protected via src/proxy.ts — unauthenticated users are redirected to /login, and each role is locked to its own area (/user, /admin, /delivery).

First-time users: after registration you'll be asked to choose your role and enter a mobile number (EditRoleMobile screen). An admin can change any user's role from the dashboard. The database is seeded for the demo with an admin user.

📡 API Endpoints
Method	Endpoint	Purpose
POST	/api/auth/register	Register a new user
POST	/api/auth/[...nextauth]	NextAuth handlers (login, Google, session)
GET	/api/flash-deal	Active flash deals
GET	/api/trending	Trending products
GET	/api/recommended	Recommended products
GET	/api/frequently	Frequently bought products
GET	/api/product/description	AI product description (Gemini)
GET/POST	/api/reviews	Product reviews
POST	/api/upload	Cloudinary image upload
POST	/api/coupons/apply	Validate & apply a coupon
POST	/api/razorpay/create-order	Create Razorpay order
POST	/api/razorpay/verify	Verify Razorpay payment signature
GET/POST	/api/user/order	Create / list user orders
GET	/api/user/order/[id]	Order details + invoice PDF
GET	/api/user/track/[orderId]	Order tracking info
POST	/api/order/[orderId]/send-otp	Send delivery OTP
POST	/api/order/[orderId]/verify-otp	Verify delivery OTP
GET	/api/order/[orderId]/deliveryBoy-location	Get delivery boy live location
POST	/api/update-location	Save user/delivery-boy location
POST	/api/socket/connect	Save user ↔ socket id mapping
POST	/api/socket/disconnect	Remove socket mapping
POST	/api/chat/create	Create a chat room
GET	/api/chat/messages/[id]	Get chat messages
POST	/api/chat/save	Save a chat message
GET	/api/chat/suggestions	AI chat suggestions (Gemini)
POST	/api/contact	Contact form (Nodemailer)
...	/api/admin/*	Admin CRUD (grocery, banner, coupons, flash-deal, orders)
...	/api/delivery-boy/*	Delivery boy assignment, accept/reject, earnings
🔌 Socket Events
Event	Direction	Purpose
identity	Client → Server	Register userId ↔ socketId
updateLocation	Client → Server	Delivery boy shares live location
update-delivery-location	Server → All	Broadcast live delivery location
join-room	Client → Server	Join a chat room
chat-message	Both	Send/receive realtime chat
disconnect	Client → Server	Mark user offline
The socket server also exposes a POST /notify HTTP endpoint ({ socketId, event, data }) so the Next.js backend can push custom events to a specific user (or broadcast to all).

💳 Payments (Razorpay Test Mode)
Razorpay is configured with test-mode keys (prefix rzp_test_). To test a successful payment use the test card:

Card Number : 4111 1111 1111 1111
Expiry      : any future date
CVV         : any 3 digits
Name        : any name
Payments are verified server-side via signature verification (/api/razorpay/verify).

🤝 Contributing
Fork the repository.
Create a feature branch: git checkout -b feature/my-feature
Commit your changes: git commit -m "Add my feature"
Push to the branch: git push origin feature/my-feature
Open a Pull Request.
Please make sure your code passes the linter before submitting:

cd snapcart
npm run lint
📄 License
This project is for academic / final-year project purposes. Feel free to use and modify it for learning.
