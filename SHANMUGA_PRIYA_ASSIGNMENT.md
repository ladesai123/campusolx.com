# 🎓 Hey Shanmuga Priya! Welcome to CampusOlx 🌟
### *Let's learn and build something together!*

I am so incredibly happy to have you join me on this project. You are half of my heart, and my goal is to support you completely as you take your first steps into software development. I want you to feel excited, comfortable, and confident. 

Please don't stress about this at all—there is no pressure, and I will be right here next to you to help you with every single line of code, every error, and every step! This is just a fun way for us to work together, and it will give you some great real-world experience to put on your resume for your job search.

---

## 🗺️ What is CampusOlx? (The Big Picture)

At SASTRA University, when seniors graduate, they leave behind useful things like books, cycles, and calculators. At the same time, new students arrive needing those exact items.

**CampusOlx** is a simple marketplace where students can buy, sell, and reuse these items. To keep it safe, only students with a SASTRA email (`@sastra.ac.in`) can log in.

---

## ⚡ What Happens When a User Visits `campusolx.com`?

When someone types `campusolx.com` into their browser, here is the quick journey:

1. **The Request**: Their phone/laptop browser sends a message asking our server for the homepage.
2. **Next.js (Our Frontend)**: Our server receives the request and says, *"Okay, let's build the homepage."*
3. **Supabase (Our Database)**: The server talks to our database (like a digital folder) and asks: *"Can you give me the list of active products?"*
4. **Showing the Page**: The server sends the products and layout back to the user's browser, and it pops up beautifully on their screen!

---

## 🛠️ The Tech Stack (What We Use)

We use a few simple tools to make this work:
- **Next.js & React**: This is what we use to build the pages. Think of React like Lego blocks; we write code for small parts (like a button or a card) and snap them together.
- **Tailwind CSS**: This is our styling tool. It makes it super easy to change colors, add spacing, and make things look pretty by just typing simple words in the code.
- **Supabase**: This is where we store all our data (user profiles, items for sale, etc.).
- **TypeScript**: This is a friendly spelling checker for our code. It highlights mistakes as we type so we don't crash the website.

---

## 🗄️ Our Database Tables (Made Very Simple)

We store our information in tables, which are just like Excel spreadsheets:

1. **`products`**: A sheet of all the items listed for sale.
   - `title`: The name of the item (e.g., "Math Textbook").
   - `price`: How much it costs.
   - `is_hidden`: If this is set to `true`, the item won't show up on the website.
2. **`profiles`**: A sheet of all the students who have logged in.
   - `name`: Their name.
   - `email`: Their email address.
   - `hostel_block`: Which hostel they live in.

---

## 🎯 Your First Task: A Simple Admin Page (`/admin-sp`)

Instead of building a massive dashboard, you are just going to create one simple page at `/admin-sp`. 

All we want this page to do is:
1. **Show a Warm Welcome Greeting**: Write a nice header like: *"Shanmuga Priya's CampusOlx Admin Page"* with a gradient background.
2. **Show a Simple List of Products**: Fetch the products from the database and show their names and prices in a list.
3. **Add a "Hide" Button**: Next to each product, put a simple button. If you click it, it hides the product from the main site (toggles `is_hidden`).

That’s it! No complex tabs, no graphs, just a simple list and a button. It's the perfect way to learn.

---

## 💻 Step-by-Step Local Setup

Let's get the code running on your laptop!

### 1. Download the Code
Open your terminal (PowerShell or Git Bash) and run:
```bash
git clone https://github.com/ladesai123/campusolx.com.git
cd campusolx.com
```

### 2. Install Packages
This downloads all the React and Tailwind tools we need:
```bash
npm install
```

### 3. Copy the Secret Keys
Create a file named `.env.local` in the main folder of the project, and paste these keys inside it:
```env
NEXT_PUBLIC_SUPABASE_URL="https://kgqowclwyzoaqrxepimy.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtncW93Y2x3eXpvYXFyeGVwaW15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTE2OTYsImV4cCI6MjA3MTg2NzY5Nn0.T51a6LdbKrz0CCk-rBWg_PfIPEfoLypPTNXztO-G5j4"

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="qmt6zaoy"
CLOUDINARY_CLOUD_NAME="qmt6zaoy"
NEXT_PUBLIC_CLOUDINARY_API_KEY="674411697544443"
CLOUDINARY_API_KEY="674411697544443"
CLOUDINARY_API_SECRET="WRyHL1lnfo1bL_AI0Me3gyq5XK0"
CLOUDINARY_URL="cloudinary://674411697544443:WRyHL1lnfo1bL_AI0Me3gyq5XK0@qmt6zaoy"

GOOGLE_GEMINI_API_KEY="AIzaSyDKISLJoibOsq8NSaz2CF2WrWIrZLWZDxs"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
NEXT_PUBLIC_ONESIGNAL_APP_ID="f64a7b92-a44f-49fd-ae38-3d6e788b179b"
```

### 4. Run the Website Locally
Start the server:
```bash
npm run dev
```
Now, open your web browser and go to: **[http://localhost:3000](http://localhost:3000)**. You should see the website running!

---

## 🛠️ Saving Your Work with Git

Git is like saving checkpoints in a game. Run these commands:

1. **Create your own branch** before writing code:
   ```bash
   git checkout -b feature/admin-sp
   ```
2. **Save your work**: Once you edit code, save a checkpoint:
   ```bash
   git add .
   git commit -m "added my admin page"
   ```
3. **Send it to GitHub**:
   ```bash
   git push -u origin feature/admin-sp
   ```

---

## 🤖 Vibe Coding – Letting AI Write the Code!

You do not need to write code from scratch. We use AI assistants (like Cursor, Windsurf, or Claude) to do the heavy lifting. This is called **Vibe Coding**! You explain what you want in simple English, and the AI writes the code.

### How to do it:
1. Open VS Code.
2. In the folder `src/app`, create a new folder named `admin-sp`. Inside it, make a file named `page.tsx`.
3. Open your AI assistant chat, and paste this exact prompt:

```text
I am creating a simple client component in src/app/admin-sp/page.tsx. I am a beginner, and this is my first page for CampusOlx.

Please look at @src/lib/client.ts to see how we connect to Supabase, and check @src/lib/database.types.ts for the products table.

I want to build a simple, beautiful page that does two things:
1. Displays a nice welcome header: "Welcome Shanmuga Priya to the CampusOlx Admin" with a warm design.
2. Fetches and displays a list of products (showing their title and price).
3. Next to each product, add a button that lets me hide/unhide it by updating the 'is_hidden' field in the products table.

Use Tailwind CSS to style this nicely with clean borders, rounded cards, and pretty buttons. Use Lucide icons if possible. Make the code easy for a beginner to understand.
```

The AI will write the entire file for you! If you get any errors, just copy-paste the error message back to the AI and say: *"How do I fix this error?"*

---

## 💌 A Note From Me to You

Take your time and play around with the code. Don't worry about making mistakes—breaking things is how we learn! I am super proud of you for trying this, and I am right here to help you solve anything. Let's build this together! 🚀❤️
