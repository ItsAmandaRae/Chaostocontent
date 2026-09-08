import { useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Mic, 
  Radio, 
  Calendar, 
  BarChart3, 
  ChevronUp,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import Logo from "./Logo";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "Recordings", url: "/dashboard/recordings", icon: Mic },
  { title: "Channels", url: "/dashboard/channels", icon: Radio },
  { title: "Calendar", url: "/dashboard/calendar", icon: Calendar },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
];

// Colors from our palette
const avatarColors = [
  "bg-primary", // Hot Pink
  "bg-secondary", // Sunshine Yellow
  "bg-accent", // Mint Green
  "bg-highlight", // Orange
];

interface DashboardSidebarProps {
  user: User | null;
}

export default function DashboardSidebar({ user }: DashboardSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Get first letter of email
  const firstLetter = user?.email?.charAt(0).toUpperCase() || "U";
  
  // Random but consistent color based on email
  const avatarColor = useMemo(() => {
    if (!user?.email) return avatarColors[0];
    const charCode = user.email.charCodeAt(0);
    return avatarColors[charCode % avatarColors.length];
  }, [user?.email]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  const SidebarContent = () => (
    <>
      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.title}>
              <Link
                to={item.url}
                onClick={() => setIsSheetOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 font-body text-sm uppercase tracking-wide transition-all duration-150 border border-transparent ${
                  isActive(item.url)
                    ? "bg-primary border-black font-medium"
                    : "hover:bg-muted"
                }`}
              >
                <item.icon className="w-5 h-5" strokeWidth={2} />
                <span>{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-black">
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <button className="w-full flex items-center gap-3 p-3 hover:bg-muted transition-all duration-150 border border-transparent hover:border-black">
              {/* Avatar */}
              <div
                className={`w-10 h-10 ${avatarColor} border border-black flex items-center justify-center font-display font-bold text-black text-lg`}
              >
                {firstLetter}
              </div>
              
              {/* Email */}
              <div className="flex-1 text-left overflow-hidden">
                <p className="font-body text-sm text-black truncate">
                  {user?.email || "user@example.com"}
                </p>
              </div>
              
              {/* Chevron */}
              <ChevronUp
                className={`w-5 h-5 text-black transition-transform duration-200 ${
                  isPopoverOpen ? "" : "rotate-180"
                }`}
              />
            </button>
          </PopoverTrigger>
          
          <PopoverContent 
            className="w-56 p-2 bg-background border border-black shadow-[4px_4px_0px_0px_black]"
            side="top"
            align="start"
            sideOffset={8}
          >
            <div className="space-y-1">
              <Link
                to="/dashboard/settings"
                onClick={() => {
                  setIsPopoverOpen(false);
                  setIsSheetOpen(false);
                }}
                className="flex items-center gap-3 px-3 py-2 font-body text-sm uppercase tracking-wide hover:bg-muted transition-all duration-150"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </Link>
              
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2 font-body text-sm uppercase tracking-wide hover:bg-destructive hover:text-destructive-foreground transition-all duration-150"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </>
  );

  // Mobile: Show header with hamburger menu
  if (isMobile) {
    return (
      <>
        {/* Mobile Header */}
        <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-background border-b border-black flex items-center justify-between px-4">
          <Link to="/">
            <Logo className="text-black" />
          </Link>
          
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <button className="p-2 border border-black hover:bg-muted transition-colors">
                <Menu className="w-6 h-6" />
              </button>
            </SheetTrigger>
            <SheetContent 
              side="right" 
              className="w-72 p-0 border-l border-black bg-background flex flex-col"
            >
              <div className="p-4 border-b border-black flex items-center justify-between">
                <span className="font-display font-bold text-lg">Menu</span>
              </div>
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </header>
        
        {/* Spacer for fixed header */}
        <div className="h-16 flex-shrink-0" />
      </>
    );
  }

  // Desktop: Show full sidebar
  return (
    <aside className="w-64 min-h-screen bg-background border-r border-black flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-black">
        <Link to="/">
          <Logo className="text-black" />
        </Link>
      </div>
      <SidebarContent />
    </aside>
  );
}
