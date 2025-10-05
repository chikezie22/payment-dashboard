import { ModeToggle } from '@/components/mode-toggle';
import { buttonVariants } from '@/components/ui/button';
import { Link, Outlet } from 'react-router';

const Layout = () => {
  return (
    <div className="p-4 min-h-screen">
      <div className="flex items-center gap-2.5">
        <ModeToggle />
        <Link to="/dashboard" className={buttonVariants({ variant: 'outline' })}>
          Home
        </Link>
      </div>
      <main className="grid  max-w-4xl w-full mx-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
