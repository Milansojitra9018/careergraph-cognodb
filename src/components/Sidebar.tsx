'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Compass, Network, Network as LogoIcon } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'People Directory', href: '/people', icon: Users },
    { name: 'Career Explorer', href: '/career-explorer', icon: Compass },
    { name: 'Graph Explorer', href: '/graph-explorer', icon: Network },
  ];

  return (
    <>
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/5 bg-gray-950/70 p-6 md:flex md:flex-col backdrop-blur-xl z-20">
        <Link href="/" className="flex items-center gap-3 pb-8 border-b border-white/5 hover:opacity-90 transition-opacity select-none">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600 text-white shadow-lg shadow-violet-500/20">
            <LogoIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wider text-white">CareerGraph</h1>
            <p className="text-xs text-gray-500">CognoDB Graph Intelligence</p>
          </div>
        </Link>

        <nav className="flex-1 space-y-1.5 py-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-violet-600/10 text-violet-400 border border-violet-500/10 font-semibold'
                    : 'text-gray-400 hover:bg-white/[0.03] hover:text-white border border-transparent'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-violet-400' : 'text-gray-400 group-hover:text-white'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="rounded-lg bg-white/[0.02] border border-white/5 p-4">
          <p className="text-xs font-semibold text-violet-400 mb-1">Take-Home Demo</p>
          <p className="text-xs text-gray-500 leading-relaxed">
            Demonstrating multi-hop cypher graph traversals on CognoDB.
          </p>
        </div>
      </aside>

      <header className="fixed top-0 inset-x-0 h-16 border-b border-white/5 bg-gray-950/80 px-4 flex items-center gap-3 md:hidden backdrop-blur-xl z-30">
        <span className="text-xs bg-violet-600/10 text-violet-400 border border-violet-500/10 px-2.5 py-1 rounded-full font-medium flex-shrink-0">
          CognoDB
        </span>
        <Link href="/" className="flex items-center gap-2 select-none hover:opacity-90 active:scale-95 transition-all">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-violet-600 text-white shadow-lg shadow-violet-500/10">
            <LogoIcon className="h-4 w-4" />
          </div>
          <span className="font-bold tracking-wider text-white text-sm sm:text-base">CareerGraph</span>
        </Link>
      </header>

      <nav className="fixed bottom-0 inset-x-0 h-16 border-t border-white/5 bg-gray-950/80 flex items-center justify-around md:hidden backdrop-blur-xl z-30 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition-all ${
                isActive ? 'text-violet-400 font-semibold' : 'text-gray-500'
              }`}
            >
              <Icon className={`h-5 w-5 mb-1 ${isActive ? 'text-violet-400' : 'text-gray-500'}`} />
              {item.name.split(' ')[0]}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
