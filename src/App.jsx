import { Navigate, Route, Routes } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoginPage from './pages/LoginPage';
import BarberDashboard from './pages/BarberDashboard';
import CashierDashboard from './pages/CashierDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import './App.css';

function ProtectedRoute({ allowedRoles, children }) {
  const { user } = useSelector((state) => state.auth);

  return (
    user && allowedRoles.includes(user.role)
      ? children
      : <Navigate to="/login" replace />
  );
}

function HomeRedirect() {
  const user = useSelector((state) => state.auth.user);
  const destinations = { barber: '/barber', cashier: '/cashier', owner: '/owner' };

  return <Navigate to={destinations[user?.role] || '/login'} replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<HomeRedirect />} />
      <Route
        path="/barber"
        element={<ProtectedRoute allowedRoles={['barber']}><BarberDashboard /></ProtectedRoute>}
      />
      <Route
        path="/cashier"
        element={<ProtectedRoute allowedRoles={['cashier']}><CashierDashboard /></ProtectedRoute>}
      />
      <Route
        path="/owner"
        element={<ProtectedRoute allowedRoles={['owner']}><OwnerDashboard /></ProtectedRoute>}
      />
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}

export default App;
