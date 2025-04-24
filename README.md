# HotSpoT - University Social Platform

![HotSpoT Logo](public/logo.png)

## 🌟 Overview

HotSpoT is a modern social platform designed specifically for university students. It provides a space for students to connect, collaborate, and engage in academic and social activities through various features like groups, forums, and real-time messaging.

## 🚀 Features

### 👥 Groups

- Create and join academic or interest-based groups
- Public and private group options
- Real-time group discussions
- Photo and video sharing within groups
- Member management and roles (admin, moderator, member)

### 👤 User Profiles

- Customizable user profiles
- Academic information display
- Activity timeline
- Connection management

### 💬 Messaging

- Real-time private messaging
- Group chats
- File sharing capabilities
- Read receipts and typing indicators

### 📱 Responsive Design

- Fully responsive layout
- Mobile-first approach
- Cross-browser compatibility

## 🛠️ Technology Stack

- **Frontend:**

  - React 18
  - TypeScript
  - Tailwind CSS
  - Shadcn/ui Components
  - Lucide Icons

- **Backend:**

  - Firebase
    - Authentication
    - Firestore Database
    - Storage
    - Cloud Functions

- **Development Tools:**
  - Vite
  - ESLint
  - Prettier
  - Git

## 🏗️ Project Structure

```
uni-web-forge/
├── src/
│   ├── components/         # Reusable UI components
│   ├── config/            # Configuration files
│   ├── context/           # React context providers
│   ├── hooks/             # Custom React hooks
│   ├── lib/              # Utility functions and helpers
│   ├── pages/            # Page components
│   └── styles/           # Global styles and Tailwind config
├── public/               # Static assets
└── package.json         # Project dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:

```bash
git clone https://github.com/VorTex142730/uni-web-forge.git
cd uni-web-forge
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:
   Create a `.env` file in the root directory and add your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

4. Start the development server:

```bash
npm run dev
# or
yarn dev
```

## 📝 Firebase Setup

1. Create a new Firebase project
2. Enable Authentication with email/password
3. Set up Firestore Database
4. Configure Storage rules
5. Add your web app to Firebase project
6. Copy the configuration to your `.env` file

## 🔒 Security Rules

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth.uid == userId;
    }

    // Groups
    match /groups/{groupId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid in resource.data.admins;
    }

    // Group members
    match /groupMembers/{memberId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Lead Developer:** [Your Name]
- **UI/UX Designer:** [Designer Name]
- **Project Manager:** [PM Name]

## 📞 Support

For support, email [your-email@example.com] or join our Discord channel [link].

## 🙏 Acknowledgments

- [Shadcn/ui](https://ui.shadcn.com/) for the amazing UI components
- [Lucide Icons](https://lucide.dev/) for the beautiful icons
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Firebase](https://firebase.google.com/) for the backend infrastructure

---

Made with ❤️ for university students
