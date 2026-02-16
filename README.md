Due to cloud deployment configuration issues in the production environment, the backend service could not be hosted successfully.
However, the complete application was tested locally and is fully functional.

 **Watch the working demo here (running on localhost):**  
https://drive.google.com/file/d/1xquN3nC-9Fl2MZ4sKRh6YhW-inFGKMPY/view?usp=sharing

The demo video demonstrates:
- User login & authentication
- Product browsing
- Add to cart
- Wishlist functionality
- Order placement
- Database connectivity

## ⚙️ How To Run Locally

### 1. Clone the Repository
git clone https://github.com/harshitadhaiphule/myntra-clone.git


### 2. Backend Setup
cd backend
npm install


Create a `.env` file:
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key


Run backend:
npm start


### 3. Frontend Setup
cd myntra
npm install
npx expo start


---

## 📌 Note on Deployment

Production deployment was attempted using cloud platforms.  
The core functionality of the application has been validated in the local development environment and demonstrated via the recorded video above.

---
Author:
Harshita Dhaiphule  
GitHub: https://github.com/harshitadhaiphule
