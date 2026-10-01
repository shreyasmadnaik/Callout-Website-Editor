import { useEffect, useState } from 'react';
import { Download, Share } from 'lucide-react';

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

export function InstallAppCard() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const handleInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const install = async () => {
    if (!installPrompt) return;
    try {
      await installPrompt.prompt();
      const result = await installPrompt.userChoice;
      setInstallPrompt(null);
      if (result.outcome === 'accepted') setMessage('Sakhi Suraksha is being added to your home screen.');
      else setMessage('You can install Sakhi Suraksha later from your browser menu.');
    } catch {
      setMessage('Open your browser menu and choose Install app or Add to Home Screen.');
      setInstallPrompt(null);
    }
  };

  if (isInstalled) return null;

  return (
    <section className="panel mt-5 p-5 sm:p-6" aria-labelledby="install-app-heading">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#E9E4FF] text-[#9B7CF6]">
          <Download size={18} />
        </span>
        <div>
          <h2 className="font-semibold text-sm text-[#111827]" id="install-app-heading">Install Sakhi Suraksha</h2>
          <p className="body-copy mt-1 text-xs">Add it to your home screen for a full-screen app experience.</p>
        </div>
      </div>

      {installPrompt ? (
        <button className="outline-action mt-4 w-full" onClick={install} data-testid="button-install-app">
          <Download size={16} />Install app
        </button>
      ) : (
        <p className="body-copy mt-4 flex items-start gap-2 text-xs" data-testid="text-install-instructions">
          <Share size={15} className="mt-0.5 shrink-0 text-[#9B7CF6]" />
          <span>
            {import.meta.env.DEV
              ? 'Publish Sakhi Suraksha first, then add it from your browser menu or Safari’s Share menu.'
              : 'Android: choose “Install app” in your browser menu. iPhone or iPad: tap Share in Safari, then “Add to Home Screen.”'}
          </span>
        </p>
      )}

      {message && <p className="mt-3 text-xs text-[#6B7280]" role="status">{message}</p>}
    </section>
  );
}