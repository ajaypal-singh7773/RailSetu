# RailSetu 🚆

RailSetu is a modern web application designed to help users easily find, filter, and track railway routes and trains. It includes both a beautiful React frontend and a powerful Node.js/SQLite backend for advanced routing.

## Features
- 🚉 **Search Trains**: Quickly search for express, passenger, and superfast trains between stations.
- 🔄 **Smart Connecting Trains**: Automatically finds 1-stop connecting trains with optimized layover times if no direct trains are available.
- 📅 **Day-wise Filtering**: Check running days and find trains available on specific dates.
- 🛤️ **Route Details**: View detailed routes and stops for any given train.
- 🎨 **Modern UI**: A beautiful, responsive interface built with React and Tailwind CSS for the best user experience.

## Tech Stack

### Frontend
- **Framework**: React.js
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React / React Icons
- **Language**: JavaScript (ES6+)

### Backend
- **Framework**: Node.js with Express.js
- **Database**: SQLite
- **API**: RESTful API endpoints for querying stations and routes.

## Routing Algorithm (Connecting Trains)

The core feature of RailSetu is its highly optimized train routing engine, which runs directly on the SQLite database:

1. **Direct Routes**: The system first attempts to find direct trains between the source and destination using SQL `JOIN` operations, ensuring the source stop occurs before the destination stop.
2. **Indirect / 1-Stop Connections**: If no direct train exists, the algorithm executes an advanced SQL self-join. It matches a train from the source station to an intermediate transfer station, with a second train from that transfer station to the final destination.
3. **Optimized Layover Filtering**: The algorithm calculates wait times at the transfer station using modulo arithmetic `((Departure - Arrival + 1440) % 1440)` directly inside the query. It automatically filters out bad connections, ensuring the passenger has a safe and logical layover window between **1 to 12 hours**.

## Getting Started

Follow these steps to run the project locally on your machine.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your system.

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ajaypal-singh7773/RailSetu.git
```

2. Navigate into the project directory:
```bash
cd railsetu
```

3. Install frontend dependencies:
```bash
npm install
```

4. Install backend dependencies:
```bash
cd backend
npm install
cd ..
```

### Running the App

You will need to run the backend server and frontend server simultaneously.

**Start the Backend (Terminal 1):**
```bash
cd backend
node server.js
```

**Start the Frontend (Terminal 2):**
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

## Building for Production
To generate a production-ready build of the frontend, run:
```bash
npm run build
```
The optimized files will be generated in the `dist` folder.
