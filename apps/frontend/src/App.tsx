import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Onboarding } from './pages/Onboarding';
import { Profile } from './pages/Profile';
import { useAuthStore } from './stores/authStore';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const vendor = useAuthStore(state => state.vendor);
  return vendor ? children : <Navigate to="/" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route 
          path="/profile" 
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
