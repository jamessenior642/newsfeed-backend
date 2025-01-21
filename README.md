
# News Summarizer Backend

This is the backend application for the News Summarizer project. It is built using Node.js and Express, with an AI summarization service integrated using Python and the Hugging Face library. It is hosted on Render.

## Features
- **AI Summarization:** Uses a fine-tuned BART model to generate article summaries.
- **RESTful API:** Endpoints for article management and user authentication.
- **Google OAuth:** Secure user authentication and session management.
- **MongoDB Integration:** Stores user data, articles, and summaries.

## Prerequisites
- Node.js (version 16 or above)
- MongoDB instance (e.g., MongoDB Atlas)
- Python 3.9+ with Hugging Face Transformers library
- A `.env` file with the following:
  ```
  MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
  SESSION_SECRET=your-session-secret
  FRONTEND_URL=https://your-frontend-url.netlify.app
  BACKEND_URL=https://your-backend.onrender.com
  ```

## Getting Started
1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/news-summarizer-backend.git
   cd news-summarizer-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the server locally:**
   ```bash
   npm start
   ```

4. **Python Setup for AI Summarization:**
   - Install required Python packages:
     ```bash
     pip install transformers torch
     ```
   - Ensure the fine-tuned model files (`vocab.json`, `tokenizer_config.json`, etc.) are in the `ai_model` directory.

5. **Deploy to Render:**
   - Add environment variables in Render's dashboard.
   - Deploy the backend repository.

## API Endpoints
- **Authentication:**
  - `POST /auth/google`: Handles Google OAuth login.
  - `GET /auth/status`: Checks user authentication status.
- **Articles:**
  - `POST /api/articles`: Upload a new article (generates summary).
  - `GET /api/articles`: Retrieve all articles.
  - `GET /api/articles/:id`: Retrieve a specific article by ID.

## AI Summarization Service
1. The AI summarization runs in Python using a fine-tuned BART model.
2. When an article is uploaded, the backend sends the article content to the AI service hosted on EC2.
3. The AI service generates a summary and returns it to the backend.
4. The backend saves the article and summary to MongoDB.

### Example Python Code
```python
from transformers import BartForConditionalGeneration, BartTokenizer

# Load the fine-tuned model and tokenizer
model = BartForConditionalGeneration.from_pretrained("./fine_tuned_bart")
tokenizer = BartTokenizer.from_pretrained("./fine_tuned_bart")

def summarize_article(content):
    inputs = tokenizer.encode("summarize: " + content, return_tensors="pt", max_length=1024, truncation=True)
    summary_ids = model.generate(inputs, max_length=150, min_length=40, length_penalty=2.0, num_beams=4, early_stopping=True)
    return tokenizer.decode(summary_ids[0], skip_special_tokens=True)
```

## Folder Structure
- `routes`: Contains route handlers for authentication, articles, and users.
- `models`: Mongoose models for users and articles.
- `ai_model`: Contains the fine-tuned BART model for summarization.
- `config`: Configuration for Passport.js and other utilities.

## Troubleshooting
- Check the Render dashboard logs for backend errors.
- Verify the AI summarization service on EC2 is running and accessible.
- Use Postman or cURL to test API endpoints.
