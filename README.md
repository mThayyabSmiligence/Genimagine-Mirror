

# 🌟 Genimagine – AI Image Generation Platform

Genimagine is a full-stack AI-powered image generation platform that allows users to create, store, and explore AI-generated images using modern web technologies.

---

## 🧩 Tech Stack

**Frontend:** React.js
**Backend:** Node.js + Express.js
**Database:** MySQL
**Cache & Queue:** Redis
**AI Integration:** Cloudflare AI, Stability AI, OpenAI, Mistral, Hugging Face
**Storage:** AWS S3
**Payments:** Razorpay
**Other Dependencies:** FFmpeg

---

## 📁 Folder Structure

```
Genimagine/
│
├── backend/                     # Node.js + Express API
│   ├── src/
│   ├── config/config.env
│   ├── package.json
│
├── frontend/                    # React frontend
│   ├── src/
│   ├── .env
│   ├── package.json
│
└── README.md
```

---

## ⚙️ Backend Setup (Node.js + Express)

### 1️⃣ Navigate to backend folder

```bash
cd backend
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Environment Variables

Your backend configuration file is located at:
📄 `src/config/config.env`

Below is the reference structure:

```env
PORT = 3001
NODE_ENV = development

DB_HOST = localhost
DB_PORT = 3306
DB_USER = root
DB_PASSWORD =
DATABASE = genimagin2

JWT_SECRET_KEY =
JWT_REFRESH_SECRET_KEY =

EMAIL_USER =
EMAIL_PASS =

CLOUD_FLARE_ACC_ID =
CLOUD_FLARE_API_KEY =

FULL_DESCRIPTION_API_MODEL = @cf/meta/llama-3-8b-instruct
IMAGE_TO_IMAGE_API_MODEL = @cf/runwayml/stable-diffusion-v1-5-img2img
CLOUD_FLARE_LLAMA_3_8B_INSTRUCT = @cf/meta/llama-3-8b-instruct

RAZOR_PAY_KEY =
RAZOR_PAY_SECRET =

MODEL_1 = @cf/stabilityai/stable-diffusion-xl-base-1.0
MODEL_2 = @cf/stabilityai/stable-diffusion-xl-base-1.0
MODEL_3 = @cf/stabilityai/stable-diffusion-xl-base-1.0
MODEL_4 = D

ASD = @cf/stabilityai/stable-diffusion-xl-base-1.0
ASD2 = @cf/lykon/dreamshaper-8-lcm
ASD3 = @cf/bytedance/stable-diffusion-xl-lightning

SECRET_KEY_EMAIL =

FRONTEND_BASE_URL = http://localhost:3000
STORAGE_SERVER_BASE_URL = http://localhost:3002/files/storage-server

FILESYSTEM_DISK = s3
AWS_ACCESS_KEY_ID =
AWS_SECRET_ACCESS_KEY =
AWS_DEFAULT_REGION =
AWS_BUCKET =
AWS_USE_PATH_STYLE_ENDPOINT =

PROMPT_ENCRYPTION_SECRET_KEY =

STABILITY_API_URL = https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0
STABILITY_API_KEY =
OPENAI_API_KEY =
MISTRAL_API_KEY =
HUGGINGFACE_API_KEY =
REPLICATE_API_TOKEN =

REDIS_URL = redis://default:AVRhAAIncDJjMWJiOGZjZjUyZjE0YzNiYTJiNTM0ZWZiZDRjNTM5OXAyMjE2MDE@amusing-seasnail-21601.upstash.io:6379
```

---

## 🎥 FFmpeg Installation (Required)

Genimagine uses **FFmpeg** for audio/video-related features (like narration video generation).

### 🧠 Ubuntu / Linux:

```bash
sudo apt update
sudo apt install ffmpeg
```

### 🪟 Windows:

1. Download from: [https://ffmpeg.org/download.html](https://ffmpeg.org/download.html)
2. Extract and add the `bin` folder to your **System PATH**.
3. Verify installation:

   ```bash
   ffmpeg -version
   ```

---

## 🧠 Redis Setup (Required)

Redis is used for caching, queues, and job management. You can use a **cloud Redis (Upstash)** or **local Redis server**.

### 🟢 Option 1: Use Upstash Redis 

1. Visit [Upstash](https://upstash.com/)
2. Create a Redis database.
3. Copy the connection URL and update your `.env`:

   ```env
   REDIS_URL=redis://default:<your_password>@<your_upstash_instance>.upstash.io:6379
   ```

### ⚙️ Option 2: Local Redis Server (Recommended)

#### On Ubuntu/Linux:

```bash
sudo apt update
sudo apt install redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

Test with:

```bash
redis-cli ping
```

Expected Output:

```
PONG
```

#### On Windows (via WSL):

```bash
sudo apt update
sudo apt install redis-server
sudo service redis-server start
```

---

## ▶️ Run the Backend Server

```bash
cd .\backend\
npm start
```
## ▶️ Run the Backend Worker
needed to run some feature(auto story generation , story to video)

```bash
cd .\backend\
node .\src\worker\index.js
```

The backend should now be running at:
👉 **[http://localhost:3001](http://localhost:3001)**

---

## 💻 Frontend Setup (React.js)

### 1️⃣ Navigate to frontend folder

```bash
cd frontend
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Environment Files

📄 `.env` and `.env.prod`

```env
REACT_APP_SECRET_KEY_EMAIL=
REACT_APP_API_URL=http://localhost:3001/api/v1
REACT_APP_BASE_URL=http://localhost:3000
```

Make sure there are **no extra spaces** around the equals (`=`) sign.

---

### 4️⃣ Run the Frontend

For development:

```bash
npm start
```

For production build:

```bash
npm run build
```

The frontend runs on:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🔗 Connecting Frontend & Backend

Ensure your **frontend `.env`** points correctly to the backend API:

```env
REACT_APP_API_URL=http://localhost:3001/api/v1
```

If using a deployed server (e.g., AWS / Oracle Cloud), replace `localhost` with your public domain or IP.

---

## ⚠️ Common Issues

| Problem                     | Cause                                  | Fix                                     |
| --------------------------- | -------------------------------------- | --------------------------------------- |
| `Error: ffmpeg not found`   | FFmpeg not installed or not in PATH    | Install FFmpeg using instructions above |
| `Redis connection refused`  | Redis not running or bad credentials   | Start Redis locally or fix `REDIS_URL`  |
| `CORS Error`                | Missing CORS headers in Express        | Add proper CORS configuration           |
| `Cannot connect to backend` | Wrong `REACT_APP_API_URL`              | Update `.env` file in frontend          |
| `AWS upload fails`          | Incorrect credentials or bucket config | Verify AWS keys and permissions         |

---

## 🧰 Available Scripts Summary

| Location | Command         | Description                               |
| -------- | --------------- | ----------------------------------------- |
| Backend  | `npm run dev`   | Starts backend server in development mode |
| Backend  | `npm start`     | Starts backend in production mode         |
| Frontend | `npm start`     | Runs React dev server                     |
| Frontend | `npm run build` | Builds optimized React app                |

---

## 🛠️ Tips

* Start **backend first**, then frontend.
* Never commit your `.env` files to GitHub.
* For production, consider using **NGINX** + **PM2** to serve both frontend and backend.
* Ensure ports `3000`, `3001`, and `6379` are open if hosted on a server.


