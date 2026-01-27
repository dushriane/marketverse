import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            MarketVerse
            </h1>
            <div className="space-x-4">
            <Link to="/login" className="px-4 py-2 text-gray-600 hover:text-indigo-600 font-medium transition">Log In</Link>
            <Link to="/register" className="px-5 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition shadow-md hover:shadow-lg">Get Started</Link>
            </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-7xl mx-auto px-6 py-16 md:py-24 space-y-16">
        <div className="text-center space-y-6 max-w-3xl">
          <div className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold tracking-wider uppercase mb-4 border border-indigo-100">
            The Future of e-Commerce
          </div>
          <h2 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight tracking-tight">
            Shop in 3D.<br />
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Experience Real.</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Immerse yourself in a virtual marketplace. Walk through stalls, explore an extensive product catalog, and chat with vendors in real-time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link to="/register" className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-xl hover:bg-indigo-700 transition transform hover:-translate-y-1 text-center">
              Start Shopping
            </Link>
            <Link to="/explore" className="px-8 py-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition shadow-sm text-center">
              View Live Demo
            </Link>
          </div>
        </div>

        {/* Visual Mockup Placeholder (CSS handled) */}
        <div className="w-full relative max-w-5xl">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-2xl blur opacity-20"></div>
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden aspect-video flex items-center justify-center">
             <div className="text-center">
                <span className="text-6xl mb-4 block">🏪</span>
                <p className="text-gray-400 font-medium">3D Market Preview</p>
             </div>
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="bg-white py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
              <h3 className="text-3xl font-bold text-gray-900">Why MarketVerse?</h3>
              <p className="text-gray-500 mt-2">Revolutionizing how you buy and sell online.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "🏬", title: "Virtual Stalls", desc: "Vendors customize their 3D space with branding and layout." },
              { icon: "📊", title: "Smart Analytics", desc: "Real-time sales tracking & AI insights at your fingertips." },
              { icon: "💳", title: "Secure Payments", desc: "Integrated wallet and seamless checkout experience." }
            ].map((f, i) => (
              <div key={i} className="p-8 border border-gray-100 bg-gray-50/50 rounded-2xl hover:shadow-lg transition hover:bg-white hover:border-gray-200">
                <span className="text-4xl mb-4 block">{f.icon}</span>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{f.title}</h3>
                <p className="text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <footer className="bg-gray-50 border-t border-gray-200 py-12 text-center text-gray-500 text-sm">
        <p>© 2026 MarketVerse. All rights reserved.</p>
      </footer>
    </div>
  );
}
