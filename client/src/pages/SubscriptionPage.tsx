import { useState } from "react";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Check, Crown, Sparkles, TrendingUp, Shield, Zap } from "lucide-react";

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
  },
};

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>("");

  useEffect(() => {
    // Create subscription intent when component mounts
    const createSubscription = async () => {
      try {
        const response = await apiRequest("POST", "/api/subscription/create");
        const data = await response.json();
        
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else if (data.error && data.error.includes('Founder account')) {
          toast({
            title: "Access Granted",
            description: "You already have full access to all features.",
            variant: "default",
          });
        }
      } catch (error) {
        console.error('Subscription creation error:', error);
        toast({
          title: "Error",
          description: "Failed to initialize subscription. Please try again.",
          variant: "destructive",
        });
      }
    };

    createSubscription();
  }, [toast]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    setLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast({
          title: "Subscription Activated!",
          description: "Welcome to Silent Surge Pro! You now have access to all premium features.",
          variant: "default",
        });
        
        // Refresh the page to update subscription status
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border rounded-lg bg-card">
        <CardElement options={cardElementOptions} />
      </div>
      
      <Button 
        type="submit" 
        disabled={!stripe || loading} 
        className="w-full"
        data-testid="button-subscribe"
      >
        {loading ? "Processing..." : "Activate Pro Subscription"}
      </Button>
    </form>
  );
}

export default function SubscriptionPage() {
  const { user, isAuthenticated } = useAuth();
  const { subscriptionStatus, isLoading: loading } = useSubscription();

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please log in to access subscription features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <a href="/api/login">Log In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  // Show current subscription status for premium users
  if (subscriptionStatus?.isPremium || subscriptionStatus?.isFounder) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
              <Crown className="w-8 h-8 text-yellow-500" />
              Premium Access Active
            </h1>
            <p className="text-muted-foreground">
              You have full access to all Silent Surge features
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                {subscriptionStatus.isFounder ? "Founder Account" : "Pro Subscription"}
              </CardTitle>
              <CardDescription>
                {subscriptionStatus.isFounder 
                  ? "You have lifetime access to all features as a founder."
                  : "Your subscription gives you access to advanced ML analysis and premium features."
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Advanced ML Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Real-time SSS Scoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Breakout Probability</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Comprehensive Analysis</span>
                </div>
              </div>

              {!subscriptionStatus.isFounder && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Status: <Badge variant="secondary">{subscriptionStatus.subscriptionStatus}</Badge>
                  </p>
                  {subscriptionStatus.subscriptionEndsAt && (
                    <p className="text-sm text-muted-foreground">
                      Next billing: {new Date(subscriptionStatus.subscriptionEndsAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show subscription plans for non-premium users
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Upgrade to Silent Surge Pro</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Unlock advanced machine learning analysis and premium crypto intelligence features
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Free Plan</CardTitle>
              <CardDescription>Basic crypto tracking</CardDescription>
              <div className="text-3xl font-bold">$0<span className="text-lg font-normal">/month</span></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Basic asset tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Price alerts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Portfolio overview</span>
                </div>
              </div>
              <Badge variant="secondary" className="w-full justify-center">
                Current Plan
              </Badge>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="border-primary relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground">
                Most Popular
              </Badge>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                Pro Plan
              </CardTitle>
              <CardDescription>Advanced ML-powered analysis</CardDescription>
              <div className="text-3xl font-bold">$29<span className="text-lg font-normal">/month</span></div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Everything in Free</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Advanced ML Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">Real-time SSS Scoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">Breakout Probability</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium">Comprehensive Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Priority support</span>
                </div>
              </div>

              <Elements stripe={stripePromise}>
                <CheckoutForm />
              </Elements>
            </CardContent>
          </Card>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>Secure payment processing by Stripe. Cancel anytime.</p>
        </div>
      </div>
    </div>
  );
}