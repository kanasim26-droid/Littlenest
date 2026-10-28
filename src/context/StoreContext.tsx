import React, { createContext, useContext, useState, useEffect } from 'react';
import { StoreSettings, AnnouncementSettings, PopupCampaign } from '../types';
import { api } from '../services/api';

interface StoreContextType {
  settings: StoreSettings | null;
  announcements: AnnouncementSettings | null;
  activePopup: PopupCampaign | null;
  isPopupVisible: boolean;
  closePopup: () => void;
  triggerPopupAction: () => void;
  refreshSettings: () => Promise<void>;
  isLoading: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const POPUP_DISMISS_KEY = 'ln_popup_dismissed_';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [announcements, setAnnouncements] = useState<AnnouncementSettings | null>(null);
  const [activePopup, setActivePopup] = useState<PopupCampaign | null>(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [fetchedSettings, fetchedAnnouncements, fetchedPopup] = await Promise.all([
        api.getStoreSettings(),
        api.getAnnouncements(),
        api.getActivePopup(),
      ]);
      setSettings(fetchedSettings);
      setAnnouncements(fetchedAnnouncements);
      setActivePopup(fetchedPopup);

      // Handle popup frequency logic
      if (fetchedPopup && fetchedPopup.status === 'published') {
        const dismissKey = `${POPUP_DISMISS_KEY}${fetchedPopup.id}`;
        const lastDismissed = localStorage.getItem(dismissKey);
        let shouldShow = true;

        if (fetchedPopup.displayFrequency === 'once_per_session') {
          if (sessionStorage.getItem(dismissKey)) {
            shouldShow = false;
          }
        } else if (fetchedPopup.displayFrequency === 'once_per_day') {
          if (lastDismissed) {
            const timePassed = Date.now() - parseInt(lastDismissed, 10);
            if (timePassed < 24 * 60 * 60 * 1000) {
              shouldShow = false;
            }
          }
        }

        if (shouldShow) {
          const delayMs = (fetchedPopup.delaySeconds || 3) * 1000;
          setTimeout(() => {
            setIsPopupVisible(true);
            api.recordPopupEvent(fetchedPopup.id, 'impression');
          }, delayMs);
        }
      }
    } catch (err) {
      console.error('Failed to load store data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const closePopup = () => {
    if (activePopup) {
      const dismissKey = `${POPUP_DISMISS_KEY}${activePopup.id}`;
      localStorage.setItem(dismissKey, Date.now().toString());
      sessionStorage.setItem(dismissKey, 'dismissed');
    }
    setIsPopupVisible(false);
  };

  const triggerPopupAction = () => {
    if (activePopup) {
      api.recordPopupEvent(activePopup.id, 'click');
    }
    closePopup();
  };

  return (
    <StoreContext.Provider
      value={{
        settings,
        announcements,
        activePopup,
        isPopupVisible,
        closePopup,
        triggerPopupAction,
        refreshSettings: loadData,
        isLoading,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
