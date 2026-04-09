import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import InstitutionDashboard from './pages/InstitutionDashboard';
import StudentDashboard from './pages/StudentDashboard';
import IssueCredential from './pages/IssueCredential';
import VerifyCredential from './pages/VerifyCredential';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen font-sans bg-background text-slate-800">
        <Toaster position="top-right" />
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify" element={<VerifyCredential />} />
            <Route path="/verify/:credentialId" element={<VerifyCredential />} />
            
            <Route 
              path="/institution/dashboard" 
              element={<ProtectedRoute role="institution"><InstitutionDashboard /></ProtectedRoute>} 
            />
            <Route 
              path="/institution/issue" 
              element={<ProtectedRoute role="institution"><IssueCredential /></ProtectedRoute>} 
            />
            <Route 
              path="/student/dashboard" 
              element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} 
            />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
