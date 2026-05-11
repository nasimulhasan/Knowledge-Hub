import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminProvider, useAdmin } from './contexts/AdminContext';
import { Layout } from './components/Layout';
import { Resources } from './pages/Resources';
import { ResourceDetail } from './pages/ResourceDetail';
import { SubmitRequest } from './pages/SubmitRequest';
import { AdminPanel } from './pages/AdminPanel';

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAdmin();
  if (!isAdmin) return <Navigate to="/resources" />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AdminProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/resources" />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/resources/:id" element={<ResourceDetail />} />
            <Route path="/submit" element={<SubmitRequest />} />
            <Route path="/admin" element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            } />
            <Route path="*" element={<Navigate to="/resources" />} />
          </Routes>
        </Layout>
      </Router>
    </AdminProvider>
  );
}
