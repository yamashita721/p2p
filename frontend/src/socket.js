import { io } from 'socket.io-client';

//  Vite exposes environment variables using import.meta.env
const URL = import.meta.env.VITE_BACKEND_URL;

// This creates one single, reusable connection tunnel
export const socket = io(URL, {
    autoConnect: false //  manually connect when the app loads
});