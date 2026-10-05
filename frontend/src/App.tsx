import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut, SignIn, RedirectToSignIn } from '@clerk/clerk-react';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import MilitiaList from './pages/MilitiaList';
import MilitiaForm from './pages/MilitiaForm';
import MilitiaEdit from './pages/MilitiaEdit';
import MilitiaDetail from './pages/MilitiaDetail';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function App() {
  if (!CLERK_PUBLISHABLE_KEY) {
    return (
      <div style={{ padding: 40, color: 'red', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h2>LỖI NGHIÊM TRỌNG</h2>
        <p>Ứng dụng chưa nhận được khóa <b>VITE_CLERK_PUBLISHABLE_KEY</b> từ Vercel.</p>
        <p>Vui lòng vào Vercel &gt; Settings &gt; Environment Variables để thêm biến này, sau đó Redeploy lại.</p>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <SignIn routing="path" path="/login" signUpUrl={undefined} afterSignInUrl="/dashboard" />
            </div>
          } />
          
          <Route path="/" element={
            <>
              <SignedIn>
                <MainLayout />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="ho-so" element={<MilitiaList />} />
            <Route path="ho-so/them-moi" element={<MilitiaForm />} />
            <Route path="ho-so/chi-tiet/:id" element={<MilitiaDetail />} />
            <Route path="ho-so/sua/:id" element={<MilitiaEdit />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ClerkProvider>
  );
}

export default App;
