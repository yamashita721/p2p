# P2P Chat application
A real time anonymous chat application that randomly matches users for one-to-one conversations.

## Features
- Random 1-1 user matchmaking
- Real time messaging
- Anonymous conversation
- Automatic session handling

## Tech Stack
# Frontend
-React.js
# Backend

-Node.js
-Express.js
-Socket.io

## How it works

- A user joins the application
- The server places the user in a matchmaking queue
- when another user joins, it paired both of them
- user then start exchanging messages
- when a user disconnects, the session is automatically handle by the server

## Project Stucture
```text
p2p/
|--client/
|    |-React frontend
|--server/
|    |-Express server
|     |-Socket.io
|-README.md
