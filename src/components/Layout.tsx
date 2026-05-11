import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';
import { 
  BookOpen, 
  PlusCircle, 
  LogOut, 
  Menu, 
  ShieldCheck,
  Lock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const { isAdmin, login, logout } = useAdmin();
  const location = useLocation();

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      setIsAdminModalOpen(false);
      setPassword('');
      setError(false);
    } else {
      setError(true);
    }
  };

  const navItems = [
    { name: 'Knowledge Hub', path: '/resources', icon: BookOpen },
    { name: 'Submit Request', path: '/submit', icon: PlusCircle },
  ];

  if (isAdmin) {
    navItems.push({ name: 'Admin Panel', path: '/admin', icon: ShieldCheck });
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isCollapsed ? 80 : 280,
          x: isSidebarOpen ? 0 : (window.innerWidth < 1024 ? -280 : 0)
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={cn(
          "fixed inset-y-0 left-0 bg-primary-950 text-white z-50 lg:sticky lg:top-0 lg:h-screen shadow-2xl",
          !isSidebarOpen && "hidden lg:block",
          isCollapsed && "overflow-x-hidden"
        )}
      >
        <div className="h-full flex flex-col relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 blur-3xl -mr-16 -mt-16 rounded-full pointer-events-none" />
          
          <div className={cn("p-6 border-b border-primary-900", isCollapsed && "px-0 flex justify-center")}>
            <Link to="/resources" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center text-white shrink-0 shadow-lg shadow-accent-900/20 font-black">B</div>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="overflow-hidden"
                >
                  <span className="text-xl font-black text-white whitespace-nowrap tracking-tight">BRAC</span>
                  <p className="text-[10px] text-primary-400 font-black uppercase tracking-widest -mt-1">Migration Hub</p>
                </motion.div>
              )}
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  title={isCollapsed ? item.name : ""}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                    isActive 
                      ? "bg-primary-500 text-white shadow-lg shadow-primary-900/50" 
                      : "text-primary-300 hover:bg-primary-900/50 hover:text-white",
                    isCollapsed && "justify-center p-3"
                  )}
                >
                  <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-white" : "text-primary-400 group-hover:text-primary-200")} />
                  {!isCollapsed && (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  )}
                  {isCollapsed && isActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-accent-400 rounded-l-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className={cn("mt-auto p-4 space-y-2 border-t border-primary-900", isCollapsed && "px-2")}>
            {isAdmin ? (
              <div className="space-y-2">
                <div className={cn("flex items-center gap-3 px-4 py-2", isCollapsed && "px-0 justify-center")}>
                  <div className="w-8 h-8 rounded-lg bg-accent-600 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-inner">
                    A
                  </div>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-white uppercase">Primary Admin</p>
                      <p className="text-[8px] font-bold text-primary-400 uppercase tracking-tighter">Authorized</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={logout}
                  title="Exit Admin Mode"
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-red-950/30 hover:text-red-400 transition-colors group",
                    isCollapsed && "justify-center px-0"
                  )}
                >
                  <LogOut className="w-5 h-5 shrink-0 transition-transform group-hover:-translate-x-1" />
                  {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAdminModalOpen(true)}
                title="Admin Access"
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-primary-100 bg-primary-900/50 hover:bg-primary-900 transition-colors font-bold border border-primary-800/50 group overflow-hidden",
                  isCollapsed && "justify-center px-0"
                )}
              >
                <Lock className="w-5 h-5 shrink-0 text-primary-500 group-hover:text-accent-400" />
                {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-widest">Auth Portal</span>}
              </button>
            )}
            
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-primary-500 hover:text-white transition-colors group"
              style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', padding: isCollapsed ? '0.75rem 0' : '0.75rem 1rem' }}
            >
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              ) : (
                <>
                  <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Minimize Rail</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <header className="sticky top-0 z-40 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 lg:px-8 shrink-0">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 -ml-2 text-gray-500 rounded-lg hover:bg-gray-100 lg:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:inline-block font-black uppercase tracking-widest text-[10px]">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-gray-50/50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Admin Login Modal */}
      <AnimatePresence>
        {isAdminModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdminModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full relative z-[101] border border-gray-100"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Admin Portal</h2>
                <p className="text-gray-500 mt-1 text-sm">Enter the secret key to enable admin features</p>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2 px-1">Admin Password</label>
                  <input
                    type="password"
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={cn(
                      "w-full px-4 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 transition-all transition-colors",
                      error ? "focus:ring-red-500 ring-2 ring-red-100" : "focus:ring-primary-500"
                    )}
                    placeholder="••••••••"
                  />
                  {error && <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest mt-2 px-1">Invalid Secret Key</p>}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAdminModalOpen(false)}
                    className="flex-1 py-4 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-2xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-primary-600 text-white rounded-2xl font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all"
                  >
                    Unlock
                  </button>
                </div>
              </form>
              <div className="mt-8 text-center">
                <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest leading-loose">
                  Admin secret: <span className="text-gray-400">bracadmin</span>
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

