// src/utils/setAuthToken.ts

import axios from 'axios';

const setAuthToken = (token: string | null) => {
  if (token) {
    // Apply authorization token to every request if logged in
    axios.defaults.headers.common['x-auth-token'] = token;
  } else {
    // Delete auth header if logging out
    delete axios.defaults.headers.common['x-auth-token'];
  }
};

export default setAuthToken;