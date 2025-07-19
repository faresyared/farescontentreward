// backend/localServer.js

// This file is ONLY for local development. It is NOT used by Netlify.
require('dotenv').config(); // Load variables from backend/.env
const app = require('./functions/index.js'); // Require the actual app logic

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`✅ Backend server is live and listening on http://localhost:${PORT}`);
});