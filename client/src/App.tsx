import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { AppProvider } from "./contexts/AppContext";

// Multi-Page Views
import LandingPage from "./pages/LandingPage";
import FeaturesPage from "./pages/public/FeaturesPage";
import KmkGuidePage from "./pages/public/KmkGuidePage";
import SavingsPage from "./pages/public/SavingsPage";
import GeoCoveragePage from "./pages/public/GeoCoveragePage";
import FaqPage from "./pages/public/FaqPage";
import ContactPage from "./pages/public/ContactPage";
import LoginPage from "./pages/LoginPage";
import Home from "./pages/Home";

function Router() {
  const [, setLocation] = useLocation();

  return (
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
      <Route path="/turkiye-geneli-hizmet">
        {() => <GeoCoveragePage />}
      </Route>
      <Route path="/sss">
        {() => <FaqPage />}
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
