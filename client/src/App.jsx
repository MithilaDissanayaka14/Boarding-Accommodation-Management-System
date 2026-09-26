import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Lazy-loaded Views (Code Splitting per Section 3 & 5 of Implementation Plan)
const Home = lazy(() => import('./pages/public/Home').then((m) => ({ default: m.Home })));
const BrowseListings = lazy(() =>
  import('./pages/public/BrowseListings').then((m) => ({ default: m.BrowseListings }))
);
const ListingDetail = lazy(() =>
  import('./pages/public/ListingDetail').then((m) => ({ default: m.ListingDetail }))
);
const Login = lazy(() => import('./pages/public/Login').then((m) => ({ default: m.Login })));
const Register = lazy(() =>
  import('./pages/public/Register').then((m) => ({ default: m.Register }))
);
const StudentDashboard = lazy(() =>
  import('./pages/student/StudentDashboard').then((m) => ({ default: m.StudentDashboard }))
);
const LandlordDashboard = lazy(() =>
  import('./pages/landlord/LandlordDashboard').then((m) => ({ default: m.LandlordDashboard }))
);
const CreateListing = lazy(() =>
  import('./pages/landlord/CreateListing').then((m) => ({ default: m.CreateListing }))
);

// Configure TanStack Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 3, // 3 minutes stale time
    },
  },
});

// Suspense Fallback Loader
const PageLoader = () => (
  <div
    style={{
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '1rem',
    }}
  >
    <div
      style={{
        width: '42px',
        height: '42px',
        borderRadius: '50%',
        border: '3px solid rgba(16, 185, 129, 0.2)',
        borderTopColor: 'var(--accent-primary)',
        animation: 'spin 0.8s linear infinite',
      }}
    />
    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Loading view...</span>
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: '100vh',
              backgroundColor: 'var(--bg-primary)',
            }}
          >
            <Navbar />
            <main style={{ flex: 1 }}>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public Discovery Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/listings" element={<BrowseListings />} />
                  <Route path="/listings/:id" element={<ListingDetail />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Student Protected Portal */}
                  <Route
                    path="/student/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <StudentDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Landlord Protected Hub */}
                  <Route
                    path="/landlord/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['landlord', 'admin']}>
                        <LandlordDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/landlord/create-listing"
                    element={
                      <ProtectedRoute allowedRoles={['landlord', 'admin']}>
                        <CreateListing />
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
