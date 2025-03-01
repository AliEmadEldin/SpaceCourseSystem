import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/layout/navbar";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Course from "@/pages/course";
import Login from "@/pages/login";
import Register from "@/pages/register";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/course/:id" component={Course} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <Router />
        </main>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;