<div align="center">
  <img src="public/logo.png" alt="CampusOlx Logo" width="200"/>
  
  # 🎓 CampusOlx
  
  ### *Buy. Sell. Reuse.*
  
  **The Exclusive Student Marketplace for SASTRA University**
  
  [![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-2.57.4-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  
  [Live Demo](https://campusolx.com) • [Report Bug](https://github.com/ladesai123/campusolx.com/issues) • [Request Feature](https://github.com/ladesai123/campusolx.com/issues)
  
</div>

---

## 📖 Table of Contents

- [🌟 About The Project](#-about-the-project)
- [✨ Key Features](#-key-features)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Technology Stack](#️-technology-stack)
- [💾 Database Schema](#-database-schema)
- [🎯 Core Features Deep Dive](#-core-features-deep-dive)
- [🔒 Security & Privacy](#-security--privacy)
- [🚀 User Journey](#-user-journey)
- [📱 Progressive Web App](#-progressive-web-app)
- [🎨 UI/UX Design Philosophy](#-uiux-design-philosophy)
- [📧 Contact & Support](#-contact--support)
- [👨‍💻 Creator](#-creator)
- [📄 License](#-license)

---

## 🌟 About The Project

<div align="center">
  <img src="public/assets/profile.png" alt="Founder - Lade Sai Teja" width="150" style="border-radius: 50%; border: 4px solid #3B82F6;"/>
  
  ### The Story Behind CampusOlx
</div>

> *"Every year, when seniors packed up and left, I'd walk through the hostels and see piles of useful things—books, lamps, cycles—just left behind or tossed away. Honestly, it hurt to watch so much go to waste, knowing that someone right here on campus could have used it."*
> 
> **— Lade Sai Teja, Founder**

**CampusOlx** is more than just a marketplace—it's a movement towards sustainability and community building within the SASTRA University campus. Built by students, for students, it bridges the gap between those leaving campus and those just arriving, ensuring nothing valuable goes to waste.

### 🎯 Mission

To create a **trusted, exclusive, and sustainable marketplace** where SASTRA students can buy, sell, and reuse campus essentials, fostering a culture of sharing and reducing waste.

### 📊 Impact

- **100+** Active Students on the Platform
- **Zero Transaction Fees** - Completely Free for Students
- **Campus-Exclusive** - Only @sastra.ac.in Email Addresses
- **Sustainable** - Reducing Campus Waste One Item at a Time

---

## ✨ Key Features

### 🔐 **Secure Authentication**
- **Google OAuth Integration** with @sastra.ac.in domain restriction
- Ensures only verified SASTRA students can access the platform
- No password management required - leverages Google's security

### 🛍️ **Smart Marketplace**
- **Category-Based Filtering**: Books, Electronics, Furniture, Cycles, Clothing, Sports, Stationery, and more
- **Live Product Listings** with real-time updates
- **Image Upload & Compression** for fast loading
- **Multiple Images Per Product** for better showcase

### 📅 **Innovative "Sell Now, Deliver Later" Feature**
- Perfect for outgoing students who want to list items before leaving
- Set future availability dates for item delivery
- Reserve items in advance for next semester
- Calendar-based scheduling system

### 💬 **Real-Time Chat System**
- Built-in messaging between buyers and sellers
- Connection-based chat rooms for each transaction
- Real-time message delivery using Supabase Realtime
- Unread message notifications

### 🔔 **Smart Notifications**
- OneSignal push notifications integration
- Instant alerts for new messages
- Product interest notifications
- Connection request updates

### 📊 **User Dashboard**
- Personal profile management
- View all your listings (Active, Sold, Pending)
- Edit or delete listings
- Share products easily with integrated share functionality
- Track connections and conversations

### 🤖 **AI-Powered Descriptions**
- Auto-generate product descriptions using AI
- Upload an image, get intelligent product details
- Powered by Google Gemini API
- Saves time and improves listing quality

### 🎨 **Beautiful UI/UX**
- Modern, responsive design with Tailwind CSS
- Mobile-first approach for on-the-go browsing
- Smooth animations and transitions
- Intuitive navigation with bottom tab bar
- Progressive Web App (PWA) support

### 🛡️ **Trust & Safety**
- Mandatory seller agreement checkbox
- Fake listing prevention policies
- Community feedback system
- Report and flag inappropriate content
- Account ban system for violations

### 📱 **Social Sharing**
- One-click product sharing to WhatsApp, Instagram, and more
- Custom share messages with product images
- Viral growth mechanisms built-in

---

## 🏗️ Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Next.js    │  │    React     │  │  TypeScript  │          │
│  │   (App       │  │   (UI/UX)    │  │  (Type       │          │
│  │   Router)    │  │              │  │   Safety)    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────────────────────────────────────────┐           │
│  │         Tailwind CSS + Radix UI Components       │           │
│  └──────────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AUTHENTICATION LAYER                        │
│  ┌──────────────────────────────────────────────────┐           │
│  │         Google OAuth 2.0 (@sastra.ac.in)         │           │
│  │              Supabase Auth Helpers                │           │
│  └──────────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ JWT Tokens
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       BACKEND SERVICES                           │
│                                                                   │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐    │
│  │   Supabase     │  │   Cloudinary   │  │   OneSignal    │    │
│  │   (Database    │  │   (Image       │  │   (Push        │    │
│  │   + Auth +     │  │   Storage &    │  │   Notifications│    │
│  │   Realtime)    │  │   CDN)         │  │   Service)     │    │
│  └────────────────┘  └────────────────┘  └────────────────┘    │
│                                                                   │
│  ┌─────────────────────────────────────────────────┐            │
│  │        Google Gemini AI API (Descriptions)      │            │
│  └─────────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ PostgreSQL + Realtime
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE LAYER                            │
│                    (Supabase PostgreSQL)                         │
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ Profiles │  │ Products │  │Connection│  │ Messages │        │
│  │  Table   │  │  Table   │  │   Table  │  │  Table   │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐                             │
│  │  Feedback    │  │Notifications │                             │
│  │   Table      │  │    Table     │                             │
│  └──────────────┘  └──────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
```

### Application Flow

```mermaid
graph TD
    A[User Visits Site] --> B{Authenticated?}
    B -->|No| C[Landing Page]
    C --> D[Google OAuth Login]
    D --> E{@sastra.ac.in?}
    E -->|Yes| F[Create Profile]
    E -->|No| G[Access Denied]
    F --> H[Home/Marketplace]
    B -->|Yes| H
    H --> I{User Action}
    I --> J[Browse Products]
    I --> K[Create Listing]
    I --> L[View Profile]
    I --> M[Open Chat]
    J --> N[View Product Details]
    N --> O[Contact Seller]
    O --> M
    K --> P[Upload Images]
    P --> Q[AI Generate Description]
    Q --> R[Submit Listing]
    R --> H
    M --> S[Real-time Messaging]
    S --> T[OneSignal Notification]
```

---

## 🛠️ Technology Stack

### **Frontend Framework**
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.5.3 | React framework with App Router, SSR, and API routes |
| **React** | 19.1.0 | UI component library for building interactive interfaces |
| **TypeScript** | 5.x | Type-safe development with enhanced IDE support |

### **Styling & UI Components**
| Technology | Version | Purpose |
|------------|---------|---------|
| **Tailwind CSS** | 4.x | Utility-first CSS framework for rapid UI development |
| **Radix UI** | Various | Unstyled, accessible component primitives |
| **Lucide React** | 0.544.0 | Beautiful, consistent icon library |
| **Keen Slider** | 6.8.6 | Touch-friendly slider for testimonials and galleries |

### **Backend & Database**
| Technology | Version | Purpose |
|------------|---------|---------|
| **Supabase** | 2.57.4 | PostgreSQL database with real-time subscriptions |
| **Supabase Auth** | 0.10.0 | Authentication with Google OAuth integration |
| **PostgreSQL** | 13.x | Relational database with Row Level Security (RLS) |

### **Media & Storage**
| Technology | Version | Purpose |
|------------|---------|---------|
| **Cloudinary** | 2.7.0 | Cloud-based image storage and CDN |
| **browser-image-compression** | 2.0.2 | Client-side image optimization before upload |
| **Next Cloudinary** | 6.16.0 | Next.js integration for Cloudinary |

### **Real-time & Notifications**
| Technology | Purpose |
|------------|---------|
| **OneSignal** | Push notifications for web and PWA |
| **Supabase Realtime** | WebSocket-based real-time data subscriptions |

### **AI Integration**
| Technology | Purpose |
|------------|---------|
| **Google Gemini API** | AI-powered product description generation |

### **Analytics & Monitoring**
| Technology | Version | Purpose |
|------------|---------|---------|
| **Vercel Analytics** | 1.5.0 | Performance and user analytics |
| **Vercel Speed Insights** | 1.2.0 | Real user monitoring and performance metrics |

### **Progressive Web App**
| Technology | Version | Purpose |
|------------|---------|---------|
| **next-pwa** | 5.6.0 | Service worker generation for offline support |

### **Development Tools**
| Technology | Purpose |
|------------|---------|
| **ESLint** | Code linting and quality enforcement |
| **Turbopack** | Fast bundler for Next.js (dev mode) |
| **PostCSS** | CSS transformations and optimizations |

---

## 💾 Database Schema

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Database Schema                          │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│      profiles        │
├──────────────────────┤
│ id (PK, UUID)        │◄──────┐
│ name                 │       │
│ university           │       │
│ profile_picture_url  │       │
└──────────────────────┘       │
         ▲                      │
         │                      │
         │                      │
         │ (FK)                 │ (FK)
         │                      │
┌────────┴───────────┐   ┌──────┴──────────┐
│     products       │   │   connections   │
├────────────────────┤   ├─────────────────┤
│ id (PK, SERIAL)    │◄──┤ product_id (FK) │
│ title              │   │ seller_id (FK)  │
│ description        │   │ requester_id(FK)│──┐
│ price              │   │ status          │  │
│ mrp                │   │ created_at      │  │
│ category           │   └─────────────────┘  │
│ image_urls[]       │            │           │
│ status             │            │ (FK)      │
│ seller_id (FK)     │◄───────────┘           │
│ available_from     │                        │
│ is_hidden          │                        │
│ created_at         │                        │
└────────────────────┘                        │
                                              │
                     ┌────────────────────────┘
                     │
                     ▼
         ┌─────────────────────┐
         │      messages       │
         ├─────────────────────┤
         │ id (PK, SERIAL)     │
         │ connection_id (FK)  │
         │ sender_id (FK)      │
         │ content             │
         │ created_at          │
         └─────────────────────┘

         ┌─────────────────────┐
         │   notifications     │
         ├─────────────────────┤
         │ id (PK, SERIAL)     │
         │ user_id (FK)        │
         │ connection_id (FK)  │
         │ type                │
         │ message             │
         │ is_read             │
         │ created_at          │
         └─────────────────────┘

         ┌─────────────────────┐
         │      feedback       │
         ├─────────────────────┤
         │ id (PK, SERIAL)     │
         │ user_id (FK)        │
         │ name                │
         │ year                │
         │ experience          │
         │ consent             │
         │ status              │
         │ created_at          │
         └─────────────────────┘
```

### Table Descriptions

#### **`profiles`** - User Profile Information
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, references auth.users |
| `name` | TEXT | User's full name from Google |
| `university` | TEXT | University name (SASTRA) |
| `profile_picture_url` | TEXT | Google profile picture URL |

#### **`products`** - Product Listings
| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Auto-incrementing primary key |
| `title` | TEXT | Product title/name |
| `description` | TEXT | Detailed product description |
| `price` | NUMERIC | Selling price in INR |
| `mrp` | NUMERIC | Original/MRP price |
| `category` | TEXT | Product category |
| `image_urls` | TEXT[] | Array of Cloudinary image URLs |
| `status` | TEXT | 'available', 'sold', 'pending_reservation', 'reserved' |
| `seller_id` | UUID | Foreign key to profiles |
| `available_from` | TIMESTAMP | Future availability date |
| `is_hidden` | BOOLEAN | Admin hide flag |
| `created_at` | TIMESTAMP | Creation timestamp |

#### **`connections`** - Buyer-Seller Connections
| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Auto-incrementing primary key |
| `product_id` | INTEGER | Foreign key to products |
| `seller_id` | UUID | Foreign key to profiles (seller) |
| `requester_id` | UUID | Foreign key to profiles (buyer) |
| `status` | TEXT | Connection status |
| `created_at` | TIMESTAMP | Creation timestamp |

#### **`messages`** - Chat Messages
| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Auto-incrementing primary key |
| `connection_id` | INTEGER | Foreign key to connections |
| `sender_id` | UUID | Foreign key to profiles |
| `content` | TEXT | Message content |
| `created_at` | TIMESTAMP | Message timestamp |

#### **`notifications`** - User Notifications
| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Auto-incrementing primary key |
| `user_id` | UUID | Foreign key to profiles |
| `connection_id` | INTEGER | Optional connection reference |
| `type` | TEXT | Notification type |
| `message` | TEXT | Notification content |
| `is_read` | BOOLEAN | Read status |
| `created_at` | TIMESTAMP | Creation timestamp |

#### **`feedback`** - User Testimonials
| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Auto-incrementing primary key |
| `user_id` | UUID | Foreign key to profiles |
| `name` | TEXT | Display name for testimonial |
| `year` | TEXT | Academic year |
| `experience` | TEXT | User experience/feedback |
| `consent` | BOOLEAN | Consent to feature on website |
| `status` | TEXT | 'pending', 'approved', 'rejected' |
| `created_at` | TIMESTAMP | Submission timestamp |

---

## 🎯 Core Features Deep Dive

### 1. **Authentication & Authorization**

**How It Works:**
```typescript
// Google OAuth with domain restriction
const supabase = createClient();
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${origin}/auth/callback`,
    queryParams: {
      hd: 'sastra.ac.in' // Restrict to SASTRA domain
    }
  }
});
```

**Key Benefits:**
- ✅ No password management required
- ✅ Leverages Google's security infrastructure
- ✅ Domain restriction ensures campus-only access
- ✅ Automatic profile creation with Google data

---

### 2. **Product Listing & Management**

**Features:**
- **Multi-Image Upload**: Up to 5 images per product
- **AI Description Generation**: Upload image, get smart descriptions
- **Category System**: 10+ predefined categories
- **Price Tracking**: Original MRP + selling price
- **Status Management**: Available, Sold, Reserved, Pending

**Image Upload Flow:**
```
User Selects Image → Client-Side Compression → Upload to Cloudinary → 
Store URL in Database → Display in Listing
```

**Product States:**
- 🟢 **Available**: Ready to sell now
- 🟡 **Pending Reservation**: Future delivery scheduled
- 🔵 **Reserved**: Buyer committed, awaiting delivery
- 🔴 **Sold**: Transaction completed

---

### 3. **Real-Time Chat System**

**Architecture:**
```
User A sends message → Supabase Database → Realtime Subscription → 
User B receives message → OneSignal Push Notification
```

**Features:**
- Connection-based chat rooms (one per product-buyer pair)
- Real-time message delivery using WebSockets
- Unread count tracking
- Message history persistence
- Push notifications for new messages

**Technical Implementation:**
```typescript
// Subscribe to new messages
const subscription = supabase
  .channel('messages')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'messages' },
    (payload) => {
      // Handle new message
    }
  )
  .subscribe();
```

---

### 4. **"Sell Now, Deliver Later" Feature**

**Use Case:** 
Outgoing seniors can list items before leaving campus, schedule delivery for future dates, allowing juniors to reserve items for next semester.

**Workflow:**
1. Seller creates listing with `available_from` date
2. Product shown with calendar badge
3. Buyers can reserve items in advance
4. Status changes: `available` → `pending_reservation` → `reserved`
5. Delivery happens on scheduled date

**UI Indicator:**
```
┌─────────────────────────────┐
│  📱 iPhone 12               │
│  ₹25,000                    │
│  ┌─────────────────────┐   │
│  │ 📅 Available: Dec 20 │   │
│  └─────────────────────┘   │
└─────────────────────────────┘
```

---

### 5. **Category-Based Filtering**

**Available Categories:**
- 📚 Books
- 💻 Electronics
- 🪑 Furniture
- 🚴 Cycles
- 👕 Clothing
- ⚽ Sports Equipment
- ✏️ Stationery
- 🎸 Musical Instruments
- 🏠 Hostel Essentials
- 🎨 Art Supplies
- 🔧 Others

**Smart Filtering:**
- Multiple category selection
- Real-time product count per category
- URL-based state management for sharing filtered views
- Persistent filter state across navigation

---

### 6. **Social Sharing System**

**Share Options:**
- WhatsApp Direct Share
- Instagram Stories
- Copy Link
- Native Web Share API

**Custom Share Messages:**
```
Check out "iPhone 12" on CampusOlx – 
the marketplace for SASTRA students! 
https://campusolx.com/product/123
```

**Viral Growth Mechanism:**
- Easy one-click sharing
- Beautiful Open Graph previews
- Product images included in shares
- Campus-specific branding in messages

---

### 7. **Admin Features**

**Admin Controls:**
- Hide/unhide products
- View all listings
- Manage user feedback
- Monitor platform activity
- Ban accounts for violations

**Safety Measures:**
- Fake listing detection
- Community reporting system
- Account suspension workflow
- Content moderation tools

---

## 🔒 Security & Privacy

### **Authentication Security**
- ✅ Google OAuth 2.0 with domain restriction
- ✅ JWT token-based session management
- ✅ Automatic token refresh
- ✅ Secure HTTP-only cookies

### **Database Security**
- ✅ **Row Level Security (RLS)** on all tables
- ✅ Users can only modify their own data
- ✅ Read-only access to others' public data
- ✅ Encrypted connections (SSL/TLS)

**Example RLS Policy:**
```sql
-- Users can only update their own products
CREATE POLICY "Users can update own products"
ON products FOR UPDATE
USING (auth.uid() = seller_id);
```

### **Data Privacy**
- ✅ **No password storage** - handled by Google
- ✅ **Minimal data collection** - only essential information
- ✅ **User control** - delete your data anytime
- ✅ **Transparent privacy policy** - clearly documented

### **Image Security**
- ✅ Client-side image compression
- ✅ Cloudinary automatic optimization
- ✅ CDN delivery for performance
- ✅ No EXIF data leakage

### **API Security**
- ✅ Environment variables for sensitive keys
- ✅ Rate limiting on API endpoints
- ✅ CORS configuration
- ✅ Input validation and sanitization

---

## 🚀 User Journey

### **New User Onboarding**

```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Landing Page                                         │
│ • View platform features                                     │
│ • See live user count                                        │
│ • Read FAQs                                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 2: Google Sign-In                                       │
│ • Click "Login" button                                       │
│ • Redirected to Google OAuth                                 │
│ • Must use @sastra.ac.in email                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 3: Profile Creation                                     │
│ • Automatic profile from Google data                         │
│ • Name and profile picture imported                          │
│ • University set to SASTRA                                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 4: Marketplace Access                                   │
│ • Browse all active listings                                 │
│ • Filter by categories                                       │
│ • Start buying or selling                                    │
└─────────────────────────────────────────────────────────────┘
```

### **Buyer Journey**

```
Browse Products → View Details → Contact Seller → 
Start Chat → Negotiate Price → Arrange Meeting → 
Complete Transaction → Mark as Sold
```

### **Seller Journey**

```
Click "Sell" → Upload Images → Enter Details → 
(Optional) Use AI Description → Set Price & Category → 
Post Listing → Receive Buyer Inquiries → Chat with Buyers → 
Finalize Deal → Mark as Sold
```

---

## 📱 Progressive Web App

### **PWA Features**

CampusOlx is a full-featured Progressive Web App that works seamlessly on mobile devices:

✅ **Install to Home Screen** - Add to your phone like a native app
✅ **Offline Support** - Service workers cache essential resources
✅ **Push Notifications** - Get notified even when app is closed
✅ **Fast Loading** - Optimized for mobile networks
✅ **App-Like Experience** - Full-screen mode without browser UI

### **Manifest Configuration**

```json
{
  "name": "CampusOlx",
  "short_name": "CampusOlx",
  "description": "Student Marketplace for SASTRA",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3B82F6",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192" },
    { "src": "/icons/icon-512.png", "sizes": "512x512" }
  ]
}
```

### **Installation Prompt**

The app intelligently prompts users to install:
- ✅ Shown on landing page for new visitors
- ✅ Respects user's previous dismissal
- ✅ One-click installation
- ✅ Works on Android, iOS, and Desktop

---

## 🎨 UI/UX Design Philosophy

### **Design Principles**

1. **Mobile-First**: 90% of students browse on phones
2. **Minimalist**: Clean, distraction-free interface
3. **Accessible**: WCAG 2.1 AA compliant
4. **Fast**: Optimized for slow campus networks
5. **Intuitive**: No learning curve required

### **Color Palette**

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Blue | `#3B82F6` | CTAs, links, brand elements |
| Slate Gray | `#64748B` | Body text, secondary content |
| White | `#FFFFFF` | Backgrounds, cards |
| Success Green | `#10B981` | Confirmations, available status |
| Warning Yellow | `#F59E0B` | Alerts, pending status |
| Danger Red | `#EF4444` | Errors, sold status |

### **Typography**

- **Primary Font**: System Font Stack (native, fast-loading)
- **Headings**: Bold, 600-700 weight
- **Body**: Regular, 400 weight
- **Scale**: 14px (mobile) to 16px (desktop) base size

### **Responsive Breakpoints**

```css
/* Mobile First */
sm:  640px  /* Small tablets */
md:  768px  /* Tablets */
lg:  1024px /* Laptops */
xl:  1280px /* Desktops */
2xl: 1536px /* Large screens */
```

### **Animation Guidelines**

- ✅ Subtle transitions (200-300ms)
- ✅ Meaningful hover states
- ✅ Loading skeletons instead of spinners
- ✅ No unnecessary motion (respects prefers-reduced-motion)

---

## 📧 Contact & Support

### **Get In Touch**

📧 **Email**: [campusolx.connect@gmail.com](mailto:campusolx.connect@gmail.com)

🐛 **Bug Reports**: [GitHub Issues](https://github.com/ladesai123/campusolx.com/issues)

💡 **Feature Requests**: [GitHub Issues](https://github.com/ladesai123/campusolx.com/issues)

📱 **Live Platform**: [campusolx.com](https://campusolx.com)

### **For Students**

- Questions about using the platform? Email us!
- Found a bug? Report it on GitHub!
- Have a feature idea? We'd love to hear it!
- Want to share feedback? Use the in-app feedback form!

### **For Developers**

- Interested in contributing? Check out our issues!
- Want to understand the codebase? This README is your guide!
- Building something similar? Feel free to learn from our approach!

---

## 👨‍💻 Creator

<div align="center">
  <img src="public/assets/profile.png" alt="Lade Sai Teja" width="150" style="border-radius: 50%;"/>
  
  ### Lade Sai Teja
  **Founder & Full-Stack Developer**
  
  [![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/ladesaiteja)
  [![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/ladesai123)
  
  *"Building solutions that make campus life better, one line of code at a time."*
</div>

---

## 📄 License

This project is built for **SASTRA University students** as a non-profit, community service platform. 

**Terms of Service**: See [terms-of-service.md](terms-of-service.md)

**Privacy Policy**: See [privacy-policy.md](privacy-policy.md)

### **Open Source Acknowledgments**

This project uses several open-source libraries and frameworks. We are grateful to the open-source community:

- Next.js by Vercel
- React by Meta
- Supabase by Supabase Inc.
- Tailwind CSS by Tailwind Labs
- Radix UI by WorkOS
- And many more amazing libraries listed in package.json

---

<div align="center">
  
  ### 🌟 Made with ❤️ for SASTRA Students
  
  **CampusOlx** - *Reducing waste, building community, one item at a time.*
  
  ---
  
  If you find CampusOlx useful, ⭐ **star this repository** to show your support!
  
</div>
