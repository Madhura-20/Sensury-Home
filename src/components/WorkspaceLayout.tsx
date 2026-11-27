import React, { useState } from 'react';
import {
  Bot,
  Calculator,
  CheckSquare,
  Compass,
  FileText,
  GitCompare,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShieldCheck,
  UserCircle,
  Users,
  X,
} from 'lucide-react';
import { AppPage } from '../types/sensury';
import { useSensury } from '../context/SensuryContext';

interface WorkspaceLayoutProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  children: React.ReactNode;
}

const NAV_ITEMS: Array<{ id: AppPage; label: string; icon: React.ElementType; section: 'Workspace' | 'Knowledge' }> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Workspace' },
  { id: 'planner', label: 'My Home Planner', icon: Home, section: 'Workspace' },
  { id: 'tracker', label: 'Progress Tracker', icon: CheckSquare, section: 'Workspace' },
  { id: 'documents', label: 'Documents & Permits', icon: FileText, section: 'Workspace' },
  { id: 'assistant', label: 'AI Home Assistant', icon: Bot, section: 'Workspace' },
  { id: 'journey', label: '18-Stage Journey', icon: Compass, section: 'Knowledge' },
  { id: 'materials', label: 'Materials Centre', icon: Package, section: 'Knowledge' },
  { id: 'calculator', label: 'Cost & Quantity', icon: Calculator, section: 'Knowledge' },
  { id: 'compare', label: 'Product Compare', icon: GitCompare, section: 'Knowledge' },
  { id: 'professionals', label: 'Professionals & Quotes', icon: Users, section: 'Knowledge' },
];

export function WorkspaceLayout({ currentPage, onNavigate, children }: WorkspaceLayoutProps) {
  const { user, profile, projects, activeProject, setActiveProjectId, isAdmin, logout } = useSensury();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentLabel =
    NAV_ITEMS.find((i) => i.id === currentPage)?.label ||
    (currentPage === 'profile' ? 'Profile & Settings' : currentPage === 'admin' ? 'Catalog Admin' : 'Workspace');

  const handleSelectNav = (page: AppPage) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  const renderNavList = () => (
    <div className="flex flex-col h-full">
      <div className="h-16 px-5 flex items-center justify-between border-b border-[#E7E5DF]">
        <button
          type="button"
          onClick={() => handleSelectNav('landing')}
          className="font-display text-base font-bold tracking-tight text-[#14171A] whitespace-nowrap cursor-pointer"
        >
          SENSURY HOME
        </button>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 text-[#4A5056] hover:text-[#14171A]"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
        {(['Workspace', 'Knowledge'] as const).map((sec) => (
          <div key={sec}>
            <p className="px-3 text-[11px] font-semibold text-[#4A5056] mb-2">{sec}</p>
            <div className="space-y-0.5">
              {NAV_ITEMS.filter((item) => item.section === sec).map((item) => {
                const Icon = item.icon;
                const active = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectNav(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                      active
                        ? 'bg-[#154D34] text-white font-medium'
                        : 'text-[#4A5056] hover:bg-[#EFECE6] hover:text-[#14171A]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div>
          <p className="px-3 text-[11px] font-semibold text-[#4A5056] mb-2">Account</p>
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => handleSelectNav('profile')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                currentPage === 'profile'
                  ? 'bg-[#154D34] text-white font-medium'
                  : 'text-[#4A5056] hover:bg-[#EFECE6] hover:text-[#14171A]'
              }`}
            >
              <UserCircle className="w-4 h-4 shrink-0" />
              <span>Profile &amp; Settings</span>
            </button>
            {isAdmin && (
              <button
                type="button"
                onClick={() => handleSelectNav('admin')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  currentPage === 'admin'
                    ? 'bg-[#154D34] text-white font-medium'
                    : 'text-[#4A5056] hover:bg-[#EFECE6] hover:text-[#14171A]'
                }`}
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Admin Catalogs</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-[#E7E5DF] bg-[#F3F2EE]/60">
        {user ? (
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#14171A] truncate">
                {profile?.displayName || user.displayName || 'Homeowner'}
              </p>
              <p className="text-[11px] text-[#4A5056] truncate">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={async () => {
                await logout();
                onNavigate('landing');
              }}
              className="p-2 text-[#4A5056] hover:text-[#14171A] rounded-lg hover:bg-white transition-colors shrink-0 cursor-pointer"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => handleSelectNav('auth')}
            className="w-full py-2 px-3 text-xs font-semibold text-white bg-[#154D34] rounded-lg hover:bg-[#113D29] transition-colors cursor-pointer"
          >
            Sign In to Save Progress
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#14171A] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-[#E7E5DF]">
        {renderNavList()}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div className="fixed inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 max-w-[85vw] bg-white h-full border-r border-[#E7E5DF] z-50">
            {renderNavList()}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur border-b border-[#E7E5DF] px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 text-[#4A5056] hover:text-[#14171A] rounded-lg hover:bg-[#F3F2EE]"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="text-[#4A5056] hidden sm:inline whitespace-nowrap">SENSURY HOME</span>
              <span className="text-[#D6D3CB] hidden sm:inline">/</span>
              <span className="font-semibold text-[#14171A] truncate">{currentLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {user && projects.length > 0 && (
              <select
                value={activeProject?.id || ''}
                onChange={(e) => void setActiveProjectId(e.target.value)}
                aria-label="Active Home Project"
                className="max-w-[190px] px-3 py-1.5 text-xs font-medium bg-[#F9F8F6] border border-[#E7E5DF] rounded-lg text-[#14171A] truncate focus:outline-none focus:ring-2 focus:ring-[#154D34]/20"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.projectName}
                  </option>
                ))}
              </select>
            )}
            <button
              type="button"
              onClick={() => onNavigate('assistant')}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#154D34] rounded-lg hover:bg-[#113D29] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Ask AI Guide
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-[1200px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
