import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5 },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>
            <Route
              path="/"
              element={
                <div className="flex h-screen items-center justify-center bg-background">
                  <p className="text-foreground text-xl font-medium">
                    Notes App — Phase 1 ✅
                  </p>
                </div>
              }
            />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App