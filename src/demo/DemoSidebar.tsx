import { useState } from "react";
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
  X,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Logo from "@/components/Logo";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSeedData } from "./SeedDataProvider";

const navItems = [
  { title: "Home", url: "/demo", icon: Home },
  { title: "Recordings", url: "/demo/recordings", icon: Mic },
  { title: "Channels", url: "/demo/channels", icon: Radio },
  { title: "Calendar", url: "/demo/calendar", icon: Calendar },
  { title: "Analytics", url: "/demo/analytics", icon: BarChart3 },
];

export default function DemoSidebar() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { profile, reset } = useSeedData();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const isActive = (path: string) =>
    path === "/demo" ? location.pathname === "/demo" : location.pathname.startsWith(path);

  const SidebarContent = () => (
    <>
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.title}>
              <Link
                to={item.url}
                onClick={() => setIsSheetOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 font-body text-sm uppercase tracking-wide transition-all duration-150 border border-transparent ${
                  isActive(item.url) ? "bg-primary border-black font-medium" : "hover:bg-muted"
                }`}
              >
                <item.icon className="w-5 h-5" strokeWidth={2} />
                <span>{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-black">
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <button className="w-full flex items-center gap-3 p-3 hover:bg-muted transition-all duration-150 border border-transparent hover:border-black">
              <div className="w-10 h-10 bg-accent border border-black flex items-center justify-center font-display font-bold text-black text-lg">
                {profile.display_name.charAt(0)}
              </div>
              <div className="flex-1 text-left overflow-hidden">
                <p className="font-body text-sm text-black truncate">{profile.email}</p>
              </div>
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
                to="/demo/settings"
                onClick={() => {
                  setIsPopoverOpen(false);
                  setIsSheetOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
              <button
                onClick={() => {
                  reset();
                  setIsPopoverOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Reset demo data
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <div className="border-b border-black bg-background">
        <div className="flex items-center justify-between p-4">
          <Link to="/" className="text-foreground">
            <Logo />
          </Link>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <button className="p-2 border border-black" aria-label="Open menu">
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 bg-background border-r border-black flex flex-col">
              <div className="p-4 border-b border-black flex items-center justify-between">
                <Logo />
                <button onClick={() => setIsSheetOpen(false)} aria-label="Close menu">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    );
  }

  return (
    <aside className="w-64 shrink-0 border-r border-black bg-background flex flex-col min-h-screen">
      <div className="p-4 border-b border-black">
        <Link to="/" className="text-foreground">
          <Logo />
        </Link>
      </div>
      <SidebarContent />
    </aside>
  );
}
