import { lazy, Suspense } from "react";
import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { AppProvider } from "./contexts/AppContext";

// Multi-Page Views (lazy-loaded for smaller initial bundle)
const LandingPage = lazy(() => import("./pages/LandingPage"));
const FeaturesPage = lazy(() => import("./pages/public/FeaturesPage"));
const KmkGuidePage = lazy(() => import("./pages/public/KmkGuidePage"));
const SavingsPage = lazy(() => import("./pages/public/SavingsPage"));
const ContactPage = lazy(() => import("./pages/public/ContactPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const Home = lazy(() => import("./pages/Home"));

function Router() {
  const [, setLocation] = useLocation();

  return (
    <Suspense fallback={<div className="min-h-screen" />}>
    <Switch>
      <Route path="/">
        {() => <LandingPage />}
      </Route>
      <Route path="/ozellikler">
        {() => <FeaturesPage />}
      </Route>
      <Route path="/kmk-mevzuat-rehberi">
        {() => <KmkGuidePage />}
      </Route>
      <Route path="/tasarruf-hesapla">
        {() => <SavingsPage />}
      </Route>
      <Route path="/iletisim">
        {() => <ContactPage />}
      </Route>
      
      {/* Authentication & App Routes */}
      <Route path="/giris">
        {() => <LoginPage onBackToLanding={() => setLocation("/")} />}
      </Route>
      <Route path="/login">
        {() => <LoginPage onBackToLanding={() => setLocation("/")} />}
      </Route>
      <Route path="/app">
        {() => <Home initialShowLanding={false} />}
      </Route>
      <Route path="/app/:rest*">
        {() => <Home initialShowLanding={false} />}
      </Route>

      {/* Fallback to Home */}
      <Route>
        {() => <LandingPage />}
      </Route>
    </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <AppProvider>
            <TooltipProvider>
              <Toaster position="bottom-right" richColors />
              <Router />
            </TooltipProvider>
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
