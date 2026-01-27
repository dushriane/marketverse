import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Onboarding } from './pages/Onboarding';
import { Profile } from './pages/Profile';
import { ProductList } from './pages/ProductList';
import { ProductForm } from './pages/ProductForm';
import { Orders } from './pages/Orders';
import { Messages } from './pages/Messages';
import { Analytics } from './pages/Analytics';
import { MarketExplore } from './pages/MarketExplore';
import { useAuthStore } from './stores/authStore';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function NavLink({ to, children }: { to: string, children: React.ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);
  return (
    <Link 
      to={to} 
      className={clsx(
        isActive ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
        "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
      )}
    >
      {children}
    </Link>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center font-bold text-xl text-indigo-600">
                MarketVerse
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <NavLink to="/products">Products</NavLink>
                <NavLink to="/orders">Orders</NavLink>
                <NavLink to="/messages">Messages</NavLink>
                <NavLink to="/analytics">Analytics</NavLink>
                <NavLink to="/profile">Profile</NavLink>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main>
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/explore" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/explore" element={<MarketExplore />} />
        <Route path="/onboarding" element={<Onboarding />} />
        
        <Route path="/profile" element={<PrivateRoute><Layout><Profile /></Layout></PrivateRoute>} />
        
        <Route path="/products" element={<PrivateRoute><Layout><ProductList /></Layout></PrivateRoute>} />
        <Route path="/products/new" element={<PrivateRoute><Layout><ProductForm /></Layout></PrivateRoute>} />
        <Route path="/products/:id/edit" element={<PrivateRoute><Layout><ProductForm /></Layout></PrivateRoute>} />
        
        <Route path="/orders" element={<PrivateRoute><Layout><Orders /></Layout></PrivateRoute>} />
        <Route path="/messages" element={<PrivateRoute><Layout><Messages /></Layout></PrivateRoute>} />
        <Route path="/analytics" element={<PrivateRoute><Layout><Analytics /></Layout></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}



export default App;
