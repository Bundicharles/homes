import React from 'react';
import { Download, WifiOff, RefreshCw, X, Share, PlusSquare, MoreVertical, Smartphone, CheckCircle } from 'lucide-react';
import { usePWA } from '@/context/PWAContext';

export const PWAInstallButton = ({ className = '', variant = 'compact', collapsed = false, label = 'Install App' }) => {
  const { isInstalled, installApp } = usePWA();

  // If already running in installed standalone mode, don't show install button
  if (isInstalled) {
    return null;
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={installApp}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-hover active:scale-95 rounded-lg shadow-sm transition-all duration-200 shrink-0 ${className}`}
        title="Install App on your mobile device or computer"
      >
        <Download className="w-3.5 h-3.5" />
        <span>{label}</span>
      </button>
    );
  }

  if (variant === 'mobile-nav') {
    return (
      <button
        onClick={installApp}
        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-all ${className}`}
      >
        <Smartphone className="w-5 h-5 text-primary" />
        <span>{label}</span>
      </button>
    );
  }

  // Full sidebar button variant
  return (
    <button
      onClick={installApp}
      className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors border border-primary/20 ${
        collapsed ? 'justify-center !px-2' : ''
      } ${className}`}
      title="Install App"
    >
      <Download className="w-5 h-5 shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </button>
  );
};

export const PWAOfflineBanner = () => {
  const { isOffline } = usePWA();

  if (!isOffline) return null;

  return (
    <div className="bg-amber-500/90 text-slate-950 px-4 py-2 text-xs sm:text-sm font-medium flex items-center justify-center gap-2 sticky top-0 z-50 shadow-md transition-all animate-fade-in">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>You are currently working offline. Data will sync once reconnected.</span>
    </div>
  );
};

export const PWAUpdateNotification = () => {
  const { hasUpdate, updateApp } = usePWA();

  if (!hasUpdate) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-surface border border-primary/40 rounded-xl shadow-2xl p-4 flex items-center gap-3 animate-slide-up">
      <div className="p-2 bg-primary/10 text-primary rounded-lg">
        <RefreshCw className="w-5 h-5 animate-spin" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-semibold text-text">Update Available</h4>
        <p className="text-[11px] text-muted truncate">A newer version of the app is ready.</p>
      </div>
      <button
        onClick={updateApp}
        className="px-3 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors shrink-0"
      >
        Refresh
      </button>
    </div>
  );
};

export const PWAInstallModal = () => {
  const { showInstallGuide, setShowInstallGuide, isIOS, isAndroid } = usePWA();

  if (!showInstallGuide) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-scale-up">
        <button
          onClick={() => setShowInstallGuide(false)}
          className="absolute top-4 right-4 text-muted hover:text-text p-1 rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center text-primary">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text">Install Hemaprin Homes App</h3>
            <p className="text-xs text-muted">Add to your Home Screen for fast, app-like access</p>
          </div>
        </div>

        {/* Dynamic platform specific instructions */}
        {isIOS ? (
          <div className="space-y-3 my-4 text-xs sm:text-sm text-text">
            <div className="flex items-start gap-3 p-3 bg-surface-hover rounded-xl border border-border">
              <div className="p-2 bg-primary/10 rounded-lg text-primary mt-0.5">
                <Share className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold">1. Tap the Share Button</p>
                <p className="text-muted text-xs">At the bottom toolbar of Safari on your iPhone/iPad.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-surface-hover rounded-xl border border-border">
              <div className="p-2 bg-primary/10 rounded-lg text-primary mt-0.5">
                <PlusSquare className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold">2. Select "Add to Home Screen"</p>
                <p className="text-muted text-xs">Scroll down the sharing menu to find the option.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-surface-hover rounded-xl border border-border">
              <div className="p-2 bg-primary/10 rounded-lg text-primary mt-0.5">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold">3. Tap "Add"</p>
                <p className="text-muted text-xs">Tap Add in top right corner to place on your Home Screen.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 my-4 text-xs sm:text-sm text-text">
            <div className="flex items-start gap-3 p-3 bg-surface-hover rounded-xl border border-border">
              <div className="p-2 bg-primary/10 rounded-lg text-primary mt-0.5">
                <MoreVertical className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold">1. Open Browser Menu</p>
                <p className="text-muted text-xs">Tap the 3 vertical dots (⋮) in Chrome, Edge, or Samsung Internet.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-surface-hover rounded-xl border border-border">
              <div className="p-2 bg-primary/10 rounded-lg text-primary mt-0.5">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold">2. Tap "Install App" or "Add to Home screen"</p>
                <p className="text-muted text-xs">Select install to download directly to your apps drawer.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-surface-hover rounded-xl border border-border">
              <div className="p-2 bg-primary/10 rounded-lg text-primary mt-0.5">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold">3. Confirm Installation</p>
                <p className="text-muted text-xs">The app icon will appear immediately on your home screen.</p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowInstallGuide(false)}
          className="w-full mt-2 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
        >
          Got It
        </button>
      </div>
    </div>
  );
};
