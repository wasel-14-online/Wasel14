import { Car, MapPin, Shield, Clock, Star, Zap } from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
  onGetStarted: () => void;
}

export function LandingPage({ onLogin, onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500 via-teal-700 to-teal-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-width-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Car className="h-8 w-8 text-white" />
              <span className="text-2xl font-bold text-white">Wassel</span>
            </div>
            <div className="flex gap-4">
              <button
                onClick={onLogin}
                className="px-6 py-2 text-white hover:bg-white/10 rounded-lg transition"
              >
                Login
              </button>
              <button
                onClick={onGetStarted}
                className="px-6 py-2 bg-white text-teal-600 hover:bg-gray-100 rounded-lg transition font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Your Ride, Your Way
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Experience the future of ride-sharing with AI-powered matching, transparent pricing, and unmatched safety.
          </p>
          <button
            onClick={onGetStarted}
            className="px-8 py-4 bg-white text-teal-600 hover:bg-gray-100 rounded-lg transition font-bold text-lg shadow-xl"
          >
            Book Your First Ride
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Why Choose Wassel?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
              <MapPin className="h-12 w-12 text-white mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Real-Time Tracking</h3>
              <p className="text-white/80">Track your ride in real-time with accurate ETA and driver location.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
              <Shield className="h-12 w-12 text-white mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Safe & Secure</h3>
              <p className="text-white/80">Verified drivers, emergency SOS, and 24/7 support for your safety.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
              <Zap className="h-12 w-12 text-white mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">AI-Powered</h3>
              <p className="text-white/80">Smart matching, dynamic pricing, and optimized routes powered by AI.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">1M+</div>
              <div className="text-white/80">Happy Riders</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">50K+</div>
              <div className="text-white/80">Verified Drivers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">4.8★</div>
              <div className="text-white/80">Average Rating</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-white/80">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center bg-white/10 backdrop-blur-md p-12 rounded-2xl border border-white/20">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-white/90 mb-8">
            Join millions of riders and experience the best ride-sharing platform.
          </p>
          <button
            onClick={onGetStarted}
            className="px-8 py-4 bg-white text-teal-600 hover:bg-gray-100 rounded-lg transition font-bold text-lg shadow-xl"
          >
            Sign Up Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/5 backdrop-blur-sm border-t border-white/20 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center text-white/60">
          <p>© 2026 Wassel. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
