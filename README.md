# 🔐 SecureTodo - Personal Task Manager

> A secure, privacy-focused todo application with user authentication built with React Native and Expo.

[![React Native](https://img.shields.io/badge/React%20Native-0.79.5-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-53.0.20-black.svg)](https://expo.dev/)
[![SQLite](https://img.shields.io/badge/SQLite-15.2.14-green.svg)](https://www.sqlite.org/)
[![License](https://img.shields.io/badge/license-MIT-orange.svg)](LICENSE)

## 📱 About

SecureTodo is a personal task management application that prioritizes user privacy and security. Each user has their own private account with secure authentication, and all data is stored locally on the device using SQLite database.

### ✨ Key Features

- 🔒 **Secure User Authentication** - Personal accounts with login/registration
- 📝 **Task Management** - Create, edit, delete, and mark todos as complete
- 🏠 **Offline First** - Works completely offline, no internet required
- 🔐 **Privacy Focused** - All data stored locally, no cloud sync
- 👤 **Multi-User Support** - Each user has their own private todo list
- 📱 **Cross Platform** - Built with React Native for iOS and Android
- 🎨 **Clean UI** - Simple, intuitive Material Design interface

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/securetodo-app.git
   cd securetodo-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   expo start
   ```

4. **Run on device/emulator**
   ```bash
   # Android
   npm run android
   
   # iOS
   npm run ios
   ```

## 📂 Project Structure

```
todo-app/
├── screens/                    # React Native screens
│   ├── HomeScreen.js          # Main todo list view
│   ├── AddTodoScreen.js       # Add new todo screen
│   ├── LoginScreen.js         # User login screen
│   ├── RegisterScreen.js      # User registration screen
│   └── DatabaseViewerScreen.js # Database viewer (dev only)
├── assets/                    # Images and icons
│   ├── icon.png
│   ├── splash-icon.png
│   └── adaptive-icon.png
├── database.js               # SQLite database setup and migrations
├── authService.js           # Authentication service
├── todoService.js           # Todo CRUD operations
├── App.js                   # Main app component with navigation
├── app.json                 # Expo configuration
├── eas.json                 # EAS Build configuration
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Todos Table
```sql
CREATE TABLE todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users (id)
);
```

## 🔧 Configuration

### Environment Setup

1. **Update app.json** with your app details:
   ```json
   {
     "expo": {
       "name": "Your App Name",
       "slug": "your-app-slug",
       "android": {
         "package": "com.yourname.yourapp"
       },
       "ios": {
         "bundleIdentifier": "com.yourname.yourapp"
       }
     }
   }
   ```

2. **Configure EAS Build** (for building APK/AAB):
   ```bash
   eas build:configure
   ```

## 📦 Building for Production

### Development Build
```bash
# APK for testing
eas build --platform android --profile development
```

### Production Build
```bash
# AAB for Google Play Store
eas build --platform android --profile production

# IPA for Apple App Store
eas build --platform ios --profile production
```

### Local Development
```bash
# Start development server
npm start

# Clear cache and restart
expo r -c
```

## 🔒 Security Features

- **Password Hashing** - User passwords are hashed before storage
- **Secure Storage** - Uses Expo SecureStore for authentication tokens
- **Local Data** - All data stays on device, no cloud transmission
- **User Isolation** - Each user can only access their own todos
- **SQL Injection Protection** - Parameterized queries prevent SQL injection

## 🧪 Development Features

### Database Viewer (Development Only)
- View database schema and data
- Clear all data for testing
- Reset database functionality
- Only available in `__DEV__` mode

### Debug Mode
```bash
# Enable React Native debugger
npm run start --dev-client
```

## 📱 Platform Support

- ✅ **Android** 5.0+ (API level 21+)
- ✅ **iOS** 11.0+
- ✅ **Web** (Expo Web support)

## 🛠️ Built With

### Core Technologies
- **React Native** 0.79.5 - Mobile app framework
- **Expo** 53.0.20 - Development platform
- **SQLite** 15.2.14 - Local database
- **Expo SecureStore** - Secure token storage

### Navigation & UI
- **React Navigation** 7.x - Screen navigation
- **React Native Paper** - Material Design components
- **React Native Vector Icons** - Icon library

### Development Tools
- **EAS CLI** - Build and deployment
- **Babel** - JavaScript transpiler
- **Metro** - JavaScript bundler

## 🚀 Deployment

### Google Play Store
1. Build production AAB: `eas build --platform android --profile production`
2. Download AAB from Expo dashboard
3. Upload to Google Play Console
4. Complete store listing
5. Submit for review

### Apple App Store
1. Build production IPA: `eas build --platform ios --profile production`
2. Download IPA from Expo dashboard
3. Upload to App Store Connect
4. Complete app information
5. Submit for review

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

### Common Issues

**SQLite Errors**
```bash
# Clear Expo cache
expo r -c
```

**Authentication Issues**
```bash
# Reset database (development only)
# Use Database Viewer > Reset Database
```

**Build Errors**
```bash
# Clean install dependencies
rm -rf node_modules
npm install
```

### PowerShell Execution Policy Issues (Windows)
```powershell
# Run as Administrator
Set-ExecutionPolicy RemoteSigned -Scope Process
```

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/securetodo-app/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/securetodo-app/discussions)
- **Email**: your.email@example.com

## 🗺️ Roadmap

- [ ] Cloud sync option (optional)
- [ ] Task categories and tags
- [ ] Due dates and reminders
- [ ] Dark theme support
- [ ] Export/Import functionality
- [ ] Task sharing between users
- [ ] Advanced search and filtering

## 🙏 Acknowledgments

- **Expo Team** - For the amazing development platform
- **React Native Community** - For the robust mobile framework
- **SQLite Team** - For the reliable embedded database
- **Material Design** - For the design inspiration

---

<div align="center">
  <p>Made with ❤️ for personal productivity and privacy</p>
  <p>
    <a href="#top">⬆️ Back to Top</a>
  </p>
</div>
