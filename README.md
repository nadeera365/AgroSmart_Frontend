# AgroSmart SL Frontend

AgroSmart SL is a web-based decision support system for location-based paddy fertilizer planning in Sri Lanka. This repository contains the React frontend used by administrators to manage farmers, generate fertilizer schedules, view weather information, and monitor SMS notifications.

## Live Demo

- Application: https://agrosmart-sl.vercel.app
- Backend API: https://agrosmartbackend-production.up.railway.app

## Related Repository

- Backend: https://github.com/nadeera365/AgroSmart_Backend

## Key Features

- Administrator registration and JWT-based login
- Dashboard with farmer and schedule information
- Farmer registration and management
- DS area and GN division selection
- Linked GN-level soil and fertilizer information
- Fertilizer schedule preview and generation
- Farmer-based schedule viewing
- Fertilizer-stage status updates
- Current weather and five-day forecast
- Manual and automatic SMS history
- Responsive user interface

## Technology Stack

- React
- Vite
- JavaScript
- Axios
- React Router
- CSS
- Vercel

## Main Pages

- Login and registration
- Dashboard
- Farmers
- Farmer details
- New crop cycle
- Fertilizer schedule
- Weather
- SMS log

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm
- Running AgroSmart backend API

### Installation

```bash
git clone https://github.com/nadeera365/AgroSmart_Frontend.git
cd AgroSmart_Frontend
npm install
```

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the development server:

```bash
npm run dev
```

The application normally runs at `http://localhost:5173`.

## Production Configuration

For deployment, set the following environment variable:

```env
VITE_API_URL=https://agrosmartbackend-production.up.railway.app/api
```

The production frontend is deployed on Vercel. The backend CORS configuration must allow the production origin:

```text
https://agrosmart-sl.vercel.app
```

## Available Commands

```bash
npm run dev
npm run build
npm run preview
```

## How Schedule Creation Works

1. The administrator registers a farmer with location, acreage, and cultivation type.
2. The administrator selects the farmer and enters the planting date.
3. The frontend sends the farmer ID and planting date to the backend.
4. The backend retrieves the linked GN fertilizer recommendation.
5. Fertilizer quantities and application dates are calculated.
6. The generated stages are saved and displayed in the schedule interface.

## Security Notes

- Do not commit `.env` files.
- Do not place MongoDB, weather API, or SMS credentials in the frontend.
- Store backend secrets only in the backend deployment environment.

## Project Scope

The current agricultural dataset contains 320 GN-level records from 17 Divisional Secretariat areas in the Ratnapura District. AgroSmart SL is a software prototype and has not been validated through a controlled crop-yield field trial.

## Author

H. G. N. S. Kumara  
BSc in Computer Science and Technology  
Sabaragamuwa University of Sri Lanka

## License

This project was developed for academic and demonstration purposes.
