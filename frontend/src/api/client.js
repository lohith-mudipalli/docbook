import axios from "axios";

// Local host still works, docker can inject VITE_API_BASE_URL
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const client = axios.create({ baseURL });


// Before the docker connection - mentioned this point for the reference only.
//const client = axios.create( {
   //  baseURL: "http://localhost:8080",
//});

client.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if(token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;

});

export default client;
