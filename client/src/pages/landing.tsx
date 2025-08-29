import { Button } from "@/components/ui/button";
import { TrendingUp, Shield, Zap, Users } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-8 h-8 text-blue-400" />
          <span className="text-2xl font-bold">Silent Surge Tracker</span>
        </div>
        <Button 
          onClick={() => window.location.href = '/api/login'}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
        >
          Sign In
        </Button>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Discover Hidden Crypto Gems
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            Advanced cryptocurrency analysis platform using behavioral psychology and 
            network theory to identify high-potential assets before they surge.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              onClick={() => window.location.href = '/api/login'}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg"
            >
              Get Started Free
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-gray-400 text-gray-300 hover:bg-gray-800 px-8 py-4 text-lg"
            >
              Learn More
            </Button>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <Shield className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Silent Surge Score</h3>
              <p className="text-gray-300">
                Proprietary algorithm analyzing behavioral patterns, token velocity, 
                and community cohesion to identify potential breakouts.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <Zap className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Real-Time Analysis</h3>
              <p className="text-gray-300">
                Live data processing with real-time updates, anomaly detection,
                and instant alerts for emerging opportunities.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <Users className="w-12 h-12 text-pink-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Network Behavioral Mapping</h3>
              <p className="text-gray-300">
                Advanced analysis of whale behavior, community sentiment,
                and social momentum patterns.
              </p>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 pt-16 border-t border-white/20">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">7,099</div>
              <div className="text-gray-400">Cryptocurrencies Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">57.6</div>
              <div className="text-gray-400">Average SSS Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-400">24/7</div>
              <div className="text-gray-400">Real-Time Monitoring</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">95%</div>
              <div className="text-gray-400">Detection Accuracy</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/20 mt-20">
        <div className="container mx-auto px-6 py-8 text-center text-gray-400">
          <p>&copy; 2025 Silent Surge Tracker. Advanced cryptocurrency analysis platform.</p>
        </div>
      </footer>
    </div>
  );
}