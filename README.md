# What's In My Plate? 🍽️  

This project allows users to take a picture of food using a React Native app (built with Expo) and analyze its macronutrients using the Gemini API.  

## 📌 Prerequisites  

- **Node.js** installed
- **Python 3** installed
- **Google** installed (`pip install google`)
- **Pillow** installed (`pip install pillow`)
- **Genai** installed (`pip install -q -U google-genai`)
- **Expo CLI** installed (`npm install -g expo-cli`)  

## 🚀 How to Run  

### 1️⃣ Start the Backend Server  
Before running the backend, **update the IP address** in `server.js` to match your local machine's IP, then run:
```bash
node server.js
```

**Find your local IP:**  
Run the following command in your terminal:  
- **macOS/Linux:** `ifconfig | grep "inet "` (use `192.168.x.x`)  
- **Windows:** `ipconfig` (look for "IPv4 Address")