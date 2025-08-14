import { PythonEnginePanel } from "@/components/PythonEnginePanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function PythonEnginePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold" data-testid="heading-python-engine">
                  Python Scoring Engine
                </h1>
                <p className="text-muted-foreground text-sm">
                  Advanced institutional-grade cryptocurrency analysis
                </p>
              </div>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Card className="mb-6 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Python Scoring Engine</CardTitle>
            <CardDescription>
              Leverage our institutional-grade Python analysis engine for advanced cryptocurrency insights and predictions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This engine provides sophisticated analysis including Silent Surge Score calculations, 
              breakout probability forecasting, and intelligent trading recommendations powered by 
              machine learning algorithms.
            </p>
          </CardContent>
        </Card>
        
        <PythonEnginePanel />
      </main>
    </div>
  );
}