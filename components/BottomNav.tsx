'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, BarChart2, Camera, MessageSquare, User } from 'lucide-react';
import { useSettings } from '@/lib/settings-store';
import { t } from '@/lib/i18n';

export default function BottomNav() {
  const pathname = usePathname();
  const { lang } = useSettings();

  const navItems = [
    { href: '/',        icon: Home,          label: lang === 'he' ? 'בית'       : 'Home'      },
    { href: '/history', icon: BarChart2,     label: lang === 'he' ? 'היסטוריה'  : 'History'   },
    { href: '/scan',    icon: Camera,        label: lang === 'he' ? 'סריקה'     : 'Scan',     primary: true },
    { href: '/ai',      icon: MessageSquare, label: lang === 'he' ? 'עוזר AI'   : 'AI Coach'  },
    { href: '/profile', icon: User,          label: lang === 'he' ? 'פרופיל'    : 'Profile'   },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom"
      style={{ background: 'var(--nav-bg)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)', borderTop: '1px solid var(--border)' }}>
      <div className="flex items-center justify-around px-1 pt-2 pb-1 max-w-[430px] mx-auto">
        {navItems.map(item => {
          const isActive = pathname === item.href;
          if (item.primary) {
            return (
              <Link key={item.href} href={item.href} className="flex flex-col items-center -mt-5">
                <motion.div whileTap={{ scale: 0.88 }}
                  className="w-[52px] h-[52px] rounded-[16px] flex items-center justify-center"
                  style={{ background: 'var(--accent)', boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}>
                  <item.icon size={22} color="var(--accentfg)" strokeWidth={2.2} />
                </motion.div>
                <span className="text-[9px] mt-1 font-medium" style={{ color: 'var(--text3)' }}>{item.label}</span>
              </Link>
            );
          }
          return (
            <Link key={item.href} href={item.href}>
              <motion.div whileTap={{ scale: 0.85 }} className="flex flex-col items-center gap-0.5 px-2 py-1">
                <div className="p-1.5 rounded-xl transition-all"
                  style={{ background: isActive ? 'rgba(128,128,128,0.15)' : 'transparent' }}>
                  <item.icon size={21} strokeWidth={isActive ? 2.4 : 1.7}
                    style={{ color: isActive ? 'var(--text)' : 'var(--text3)' }} />
                </div>
                <span className="text-[9px] font-medium" style={{ color: isActive ? 'var(--text)' : 'var(--text3)' }}>
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
