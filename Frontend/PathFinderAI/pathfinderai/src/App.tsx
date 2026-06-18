import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster.js";
import { TooltipProvider } from "@/components/ui/tooltip.js";
import { Header } from "./layout/Header.js";
import { ProtectedRoute } from "@/components/ProtectedRoute.js";
import { PageLoader } from "@/components/PageLoader.js";

const NotFound = lazy(() => import("@/pages/not-found.js"));
const Home = lazy(() => import("@/pages/Home.js"));
const Chat = lazy(() => import("@/pages/Chat.js"));
const Results = lazy(() => import("@/pages/Results.js"));
const Compare = lazy(() => import("@/pages/Compare.js"));
const Resume = lazy(() => import("@/pages/Resume.js"));
const Saved = lazy(() => import("@/pages/Saved.js"));
const SignUp = lazy(() => import("./pages/SignUp.js"));
const LogIn = lazy(() => import("./pages/LogIn.js"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.js"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.js"));
const Profile = lazy(() => import("./pages/Profile.js"));
const About = lazy(() => import("./pages/About.js"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function Router() {
  return (
    <div className="page-shell min-h-screen flex flex-col relative bg-transparent text-foreground">
      {/* Background Effects */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] max-w-[100vw] bg-primary/10 rounded-full blur-[120px] z-[-1] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] max-w-[100vw] bg-purple-500/10 rounded-full blur-[120px] z-[-1] pointer-events-none" />

      <Header />

      <main className="flex-1 w-full min-w-0 relative z-0 overflow-x-hidden">
        <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/">
            <ProtectedRoute component={Home} />
          </Route>
          <Route path="/chat">
            <ProtectedRoute component={Chat} />
          </Route>
          <Route path="/results">
            <ProtectedRoute component={Results} />
          </Route>
          <Route path="/compare">
            <ProtectedRoute component={Compare} />
          </Route>
          <Route path="/resume">
            <ProtectedRoute component={Resume} />
          </Route>
          <Route path="/saved">
            <ProtectedRoute component={Saved} />
          </Route>
          <Route path="/signup" component={SignUp} />
          <Route path="/login" component={LogIn} />
          <Route path="/forgot-password" component={ForgotPassword} />
          <Route path="/reset-password" component={ResetPassword} />
          <Route path="/profile">
            <ProtectedRoute component={Profile} />
          </Route>
          <Route path="/about" component={About} />
          <Route component={NotFound} />
        </Switch>
        </Suspense>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}