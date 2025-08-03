# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Premier League Predictor - Complete Project Documentation

## 🎯 Project Overview

A single-page web application where users can predict the 2025-26 Premier League final table by dragging and dropping teams. Features email-based predictions with update capabilities, real-time database storage, and professional UI with modal feedback.

**Live Site:** [Your Vercel URL]  
**Tech Stack:** React + Vite, Tailwind CSS, Supabase, Vercel Analytics  
**Status:** ✅ MVP Complete and Deployed

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- Git
- Supabase account
- Vercel account (for deployment)

### Local Development Setup

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/premonition-mvp.git
cd premonition-mvp

# Install dependencies
npm install

# Create environment file
touch .env.local

# Add your Supabase credentials to .env.local:
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_anon_key

# Start development server
npm run dev
```

---

## ✅ Completed Features

### Core Functionality
- **Drag & Drop Interface** - Smooth team reordering with dnd-kit
- **Email-Based Predictions** - Users can update predictions using same email
- **Team Identity** - Authentic colors, badges, and 3-letter abbreviations
- **Position Indicators** - Visual labels for CL, EL, ECL, and relegation spots
- **Mobile-First Design** - Responsive layout optimized for phones

### User Experience
- **Professional Modals** - Success/error feedback with user details
- **Input Validation** - Email format checking and required field validation
- **Reset Functionality** - Clear all inputs and return to default order
- **Visual Feedback** - Loading states, hover effects, and smooth transitions

### Data & Analytics
- **Supabase Integration** - Real-time database with automatic upserts
- **Vercel Analytics** - Track submissions, errors, and user engagement
- **Version Tracking** - Auto-generated build versions with git commit info

### Technical Excellence
- **Auto-Deployment** - GitHub → Vercel pipeline with environment variables
- **Error Handling** - Comprehensive try/catch with user-friendly messages
- **Type Safety** - Proper React hooks and state management
- **Performance** - Optimized bundles and lazy loading

---

## 🏗️ Technical Architecture

### Frontend Structure
```
src/
├── components/
│   ├── TeamList.jsx          # Drag & drop container
│   ├── TeamItem.jsx          # Individual draggable team
│   └── Modal.jsx             # Success/error modal (inline in App.jsx)
├── data/
│   └── teams.js              # 2025-26 Premier League teams
├── lib/
│   └── supabase.js           # Database client configuration
└── App.jsx                   # Main application component
```

### Database Schema (Supabase)
```sql
-- predictions table
CREATE TABLE predictions (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  rankings JSONB NOT NULL,
  group TEXT DEFAULT 'dev',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Key Dependencies
- **@dnd-kit/*** - Modern drag and drop functionality
- **@supabase/supabase-js** - Database client
- **@vercel/analytics** - User tracking and insights
- **tailwindcss** - Utility-first CSS framework

---

## 🎨 Design System

### Team Colors & Branding
Each team has authentic primary/secondary colors with 3-letter abbreviations:
- Arsenal (ARS) - Red (#DC143C)
- Chelsea (CHE) - Blue (#034694)
- Manchester City (MCI) - Sky Blue (#6CABDD)
- Liverpool (LIV) - Red (#C8102E)
- [All 20 teams included with proper colors]

### Position Classifications
- **1-4:** Champions League (Blue badge, CL label)
- **5-6:** Europa League (Orange badge, EL label)
- **7:** Conference League (Green badge, ECL label)
- **8-17:** Mid-table (No special styling)
- **18-20:** Relegation (Red badge, REL label)

---

## 📊 Analytics & Tracking

### Events Tracked
- `prediction_submitted` - Successful saves (create/update)
- `prediction_failed` - Error occurrences with details
- Page views, unique visitors, geographic data

### Version Management
- Auto-generated from git commits (format: `2025-08-03-a1b2c3d`)
- Visible in footer and console logs
- Tracks exact deployed version for debugging

---

## 🚀 Deployment

### Vercel Setup
1. **Connect GitHub** - Import repository to Vercel
2. **Environment Variables:**
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```
3. **Auto-Deploy** - Every push to main triggers new deployment

### Supabase Configuration
1. **Create Project** - Set up new Supabase project
2. **Create Table** - Use schema above for predictions table
3. **Disable RLS** - For MVP simplicity (or create public policies)
4. **Get Credentials** - Copy URL and anon key to environment variables

---

## 🔮 Future Enhancements

### Planned Features
- **Live Leaderboard** - Show all submitted predictions
- **Prediction Analysis** - Most popular picks, boldest predictions
- **Social Sharing** - Share predictions on social media
- **Scoring System** - Points when real season results come in
- **Team Logos** - Replace badges with actual team images
- **Dark Mode** - Toggle between light/dark themes

### Technical Improvements
- **Real-time Updates** - Live prediction counts
- **Offline Support** - PWA with service workers
- **Advanced Analytics** - Prediction patterns and insights
- **Admin Dashboard** - View all predictions and statistics

---

## 🛠️ Development Notes

### Common Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build locally
```

### Environment Files
- `.env.local` - Local development (not committed)
- Vercel dashboard - Production environment variables

### Database Access
- **Development:** Use Supabase dashboard table editor
- **Production:** Same database, accessible via dashboard

### Troubleshooting
- **Build Failures:** Check package.json syntax and environment variables
- **Database Errors:** Verify RLS policies and table permissions
- **Modal Issues:** Ensure Modal component is properly defined

---

## 📈 Success Metrics

### MVP Goals ✅
- [x] Friends can submit predictions easily
- [x] Mobile-friendly interface
- [x] Reliable data storage
- [x] Professional user experience
- [x] Analytics tracking for insights

### Current Status
- **Fully functional** prediction system
- **Professional UI/UX** with authentic team branding
- **Robust error handling** and user feedback
- **Production-ready** deployment pipeline
- **Analytics integration** for user insights

---

## 👨‍💻 Developer Info

**Created by:** Johnny  
**Group:** dev  
**Repository:** [https://github.com/jam-git-dot/premonition-mvp]  
**Live Site:** [[Vercel URL](https://premonition-mvp.vercel.app)]  
**Contact:** [Your contact info]

---

*Last Updated: August 2025*