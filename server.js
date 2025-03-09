const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const cors = require('cors');
const { exec } = require('child_process');

// Initialize the app and configure CORS
const app = express();
const port = 5001;
app.use(cors()); // Allow cross-origin requests from your React Native app

// Set up multer to handle image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Save files with a unique name
  },
});

const upload = multer({ storage });

// Endpoint to handle image and query submission
app.post('/analyze-image', upload.single('image'), async (req, res) => {
  const { query } = req.body;
  const imagePath = req.file.path;

  try {
    if (!imagePath) {
      return res.status(400).json({ error: 'Image file is missing.' });
    }

    // Call Python script to get the macros
    exec(`python3 main.py ${imagePath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing Python script: ${error.message}`);
        return res.status(500).json({ error: 'Error analyzing image' });
      }

      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return res.status(500).json({ error: 'Error analyzing image' });
      }

      console.log(`stdout: ${stdout}`);
      res.json({ macros: stdout });  // Send the output (macros) back to the frontend
    });

  } catch (error) {
    console.error("Error analyzing image:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create uploads folder if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});