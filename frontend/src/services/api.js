import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000', // Adjust this if your backend runs on a different port
});

export default API;
