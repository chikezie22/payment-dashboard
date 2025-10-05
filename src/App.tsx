import { ThemeProvider } from 'next-themes';
import router from './routes';
import { RouterProvider } from 'react-router';
import { Suspense } from 'react';

const App = () => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Suspense fallback={
        <div>Loading ...</div>
      }>
        <RouterProvider router={router} />
      </Suspense>
    </ThemeProvider>
  );
};

export default App;
