import { useState } from 'react';
import { Link } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Menu, 
  Home, 
  PlusCircle, 
  List, 
  Bell, 
  BarChart3,
  Globe 
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/my-plants', label: 'My Plants', icon: List },
  { to: '/add-plant', label: 'Add Plant', icon: PlusCircle },
  { to: '/reminders', label: 'Reminders', icon: Bell },
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/about', label: 'SDGs', icon: Globe },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="Plant Pal" className="h-10 w-10" />
          <span className="text-xl font-bold text-primary">Plant Pal</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              activeClassName="bg-primary/10 text-primary"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <div className="flex flex-col gap-2 pt-8">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  activeClassName="bg-primary/10 text-primary"
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};
