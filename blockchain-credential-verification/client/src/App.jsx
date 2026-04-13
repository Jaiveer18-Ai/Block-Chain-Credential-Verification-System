import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import { BotProvider } from './context/BotContext';
import GuideBot from './components/GuideBot';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import InstitutionDashboard from './pages/InstitutionDashboard';
import StudentDashboard from './pages/StudentDashboard';
import IssueCredential from './pages/IssueCredential';
import VerifyCredential from './pages/VerifyCredential';
import NotFound from './pages/NotFound';

// Admin Pages
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminCredentials from './pages/AdminCredentials';
import AdminManagement from './pages/AdminManagement';

function AppContent() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen font-sans bg-background text-[#e8e4df] relative">
      <Toaster position="top-center" containerStyle={{ zIndex: 99999 }} toastOptions={{ style: { background: '#1a1a24', color: '#e8e4df', border: '1px solid #2a2a34' } }} />
      
      {/* Hide default Navbar and Footer on Admin pages */}
      {!isAdminPath && <Navbar />}

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<VerifyCredential />} />
          <Route path="/verify/:credentialId" element={<VerifyCredential />} />
          
          {/* Institution Routes */}
          <Route 
            path="/institution/dashboard" 
            element={<ProtectedRoute role="institution"><InstitutionDashboard /></ProtectedRoute>} 
          />
          <Route 
            path="/institution/issue" 
            element={<ProtectedRoute role="institution"><IssueCredential /></ProtectedRoute>} 
          />

          {/* Student Routes */}
          <Route 
            path="/student/dashboard" 
            element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} 
          />

          {/* Super Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="credentials" element={<AdminCredentials />} />
            <Route path="management" element={<AdminManagement />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {!isAdminPath && <Footer />}
      {!isAdminPath && <GuideBot />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <BotProvider>
        <AppContent />
      </BotProvider>
    </BrowserRouter>
  );
}

export default App;
