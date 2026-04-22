import type { Metadata, Viewport } from 'next';
import './globals.css';
import PWARegister from '@/components/PWARegister';
import AuthProvider from '@/components/AuthProvider';
import ThemeProvider from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'CalorieAI',
  description: 'AI-powered nutrition tracker',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'CalorieAI' },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width', initialScale: 1, maximumScale: 1, userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script dangerouslySetInnerHTML={{__html:`
          (function(){
            try {
              var s=localStorage.getItem('calorieai-settings');
              var theme='system';
              if(s) theme=JSON.parse(s).state?.theme||'system';
              var dark=theme==='dark'||(theme==='system'&&window.matchMedia('(prefers-color-scheme:dark)').matches);
              document.documentElement.setAttribute('data-theme',dark?'dark':'light');
            } catch(e){}
          })();
        `}} />
      </head>
      <body>
        <AuthProvider>
          <ThemeProvider>
            <PWARegister />
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
