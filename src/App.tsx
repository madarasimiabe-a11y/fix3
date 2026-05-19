import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./components/AuthProvider";
import { GamePage } from "./pages/GamePage";

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 60000, retry: 1 } } });

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GamePage />
      </AuthProvider>
    </QueryClientProvider>
  );
}
