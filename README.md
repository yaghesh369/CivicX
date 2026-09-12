# CivicX

A comprehensive citizen engagement platform that bridges the gap between citizens and local authorities. Report civic issues, track complaint resolutions, and contribute to community improvement through API-backed status updates.

## 🌟 Features

### Citizen Portal
- **Easy Issue Reporting**: Report potholes, garbage, water leaks, streetlight issues, and more
- **Issue Analysis**: Keyword-based issue categorization and department suggestions in the frontend
- **GPS & Photo Support**: Capture location and photo evidence for complaints
- **Offline Support**: Save complaint drafts offline and sync automatically when connection returns; live API data still requires a network
- **Status Tracking**: Monitor complaint resolution status from submission to closure
- **Multi-language**: Support for English, Hindi, and Marathi
- **Dark Mode**: User-friendly dark theme support
- **PWA Installation**: Install the app on supported browsers for a native-like experience

### Admin & Department Portal
- Complaint verification and assignment
- Team management and worker tracking
- API-backed notifications and status updates
- Performance metrics and analytics

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS v4** - Utility-first styling
- **React Router** - Client-side routing
- **React Hook Form** - Form state management
- **i18next** - Multi-language support
- **Leaflet** - Interactive mapping
- **axios** - HTTP client
- **idb** - IndexedDB wrapper for offline persistence
- **browser-image-compression** - Image optimization

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **Prisma** - ORM for database
- **JWT** - Authentication
- **Multer** - File upload handling
- **CORS** - Cross-origin support

## 📋 Project Structure

```
CivicX/
├── frontend/                 # React citizen & admin portal
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── context/         # Global state (CivicContext)
│   │   ├── services/        # API integration layer
│   │   ├── hooks/           # Custom React hooks
│   │   ├── i18n/            # Translation files
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── public/              # Static assets
│   ├── vite.config.js       # Vite configuration
│   └── package.json
│
└── backend/                 # Express API server
    ├── src/
    │   ├── modules/         # Feature modules (auth, complaints, etc.)
    │   ├── middleware/      # Express middleware
    │   ├── config/          # Configuration files
    │   ├── utils/           # Utility functions
    │   ├── app.js           # Express app setup
    │   └── server.js        # Server entry point
    ├── prisma/
    │   └── schema.prisma    # Database schema
    ├── uploads/             # File uploads directory
    ├── API_DOCUMENTATION.md # Detailed API reference
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yaghesh369/CivicX.git
cd CivicX
```

2. **Set up the backend**
```bash
cd backend
npm install

# Create .env file with required variables
# Example:
# DATABASE_URL=postgresql://user:password@localhost:5432/civicx
# JWT_SECRET=your-secret-key
# PORT=5000

npm run dev
```

3. **Set up the frontend**
```bash
cd ../frontend
npm install
npm run dev
```

### Environment Variables

**Backend (.env)**
```
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=development
```

**Frontend (.env.local)** (if needed)
```
VITE_API_URL=http://localhost:5000
```

## 📱 Running the Application

### Development

**Terminal 1 - Backend**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend**
```bash
cd frontend
npm run dev -- --host 0.0.0.0
```

Then open `http://localhost:5173` in your browser.

### Production Build

**Frontend**
```bash
cd frontend
npm run build
```

**Backend**
Ensure all dependencies are installed and database migrations are run:
```bash
cd backend
npm run build
npm start
```

## 📚 API Documentation

See [backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md) for detailed API endpoints, request/response formats, and authentication details.

### Sample Credentials (Development)

**Admin Account (seeded)**
- Email: `admin@civicx.local`
- Password: `Admin@12345`

**Citizen Account**
- Email: `citizen@example.com`
- Password: `123456`
(register via the Register page; citizen accounts are not seeded)

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication:
- Login generates a JWT token
- Token is stored in localStorage
- Protected routes verify the token before access
- Token includes user role (citizen, admin, worker)

## 🗺️ Map Integration

The application uses Leaflet.js for interactive map features:
- Mark issue location with GPS
- Manual marker placement
- Real-time location updates

## 💾 Data Persistence

- **Online**: All data syncs with the backend API
- **Offline**: Complaint drafts are saved to IndexedDB and sync automatically when connection returns
- **localStorage**: User preferences (theme, language) and authentication tokens

## 🌐 Multi-language Support

Currently supported languages:
- English (en)
- Hindi (hi)
- Marathi (mr)

Add more languages by updating translation files in `frontend/src/i18n/`

## 🎨 Styling

The project uses Tailwind CSS v4 for styling:
- Utility-first approach
- Dark mode support
- Responsive design (mobile-first)
- Custom color palette and components

## 📊 Features in Progress

- Advanced analytics dashboard
- AI-powered complaint resolution predictions
- Mobile app (React Native)
- WebSocket real-time notifications
- SMS/Email notifications
- Integration with third-party services

## 🐛 Known Issues & Limitations

- Offline drafts are persisted locally; use the same device to sync
- Map requires active internet connection for tile loading
- Image compression works best with modern browsers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support & Contact

For issues, questions, or feature requests, please open an issue on GitHub.

## 🙏 Acknowledgments

- Open source community for amazing libraries
- All contributors who help improve CivicX
- Users providing valuable feedback

---

**Last Updated**: August 31, 2026

**Version**: 1.0.0
