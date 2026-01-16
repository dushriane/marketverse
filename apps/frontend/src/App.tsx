import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Onboarding } from './pages/Onboarding';
import { Profile } from './pages/Profile';
import { ProductList } from './pages/ProductList';
import { ProductForm } from './pages/ProductForm';
import { useAuthStore } from './stores/authStore';
import { Link } from 'react-router-dom';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const vendor = useAuthStore(state => state.vendor);
  return vendor ? children : <Navigate to="/" />;
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
                <Link to="/products" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Products
                </Link>
                <Link to="/profile" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Profile
                </Link>
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
        <Route path="/" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
        
        <Route 
          path="/profile" 
          element={
            <PrivateRoute>
              <Layout><Profile /></Layout>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/products" 
          element={
            <PrivateRoute>
              <Layout><ProductList /></Layout>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/products/new" 
          element={
            <PrivateRoute>
              <Layout><ProductForm /></Layout>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/products/:id/edit" 
          element={
            <PrivateRoute>
              <Layout><ProductForm /></Layout>
            </PrivateRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}


export default App;
