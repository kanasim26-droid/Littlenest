import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { ChevronRight } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  const { announcements } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  const activeMessages = announcements?.messages?.filter(m => m.active) || [];

  useEffect(() => {
    if (!announcements?.enabled || !announcements?.rotationEnabled || activeMessages.length <= 1) {
      return;
    }
    const intervalSec = announcements.rotationIntervalSeconds || 5;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activeMessages.length);
    }, intervalSec * 1000);

    return () => clearInterval(timer);
  }, [announcements, activeMessages.length]);

  if (!announcements?.enabled || activeMessages.length === 0) {
    return null;
  }

  const currentMsg = activeMessages[currentIndex] || activeMessages[0];

  return (
    <aside
      aria-label="Store Announcement"
      className="w-full text-xs font-medium py-2 px-4 text-center transition-colors duration-300 relative z-40"
      style={{
        backgroundColor: announcements.backgroundColor || '#5A463C',
        color: announcements.textColor || '#FFFFFF',
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        {currentMsg.link ? (
          <a
            href={currentMsg.link}
            className="inline-flex items-center gap-1 hover:underline underline-offset-4 tracking-wide"
          >
            <span>{currentMsg.text}</span>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-80" />
          </a>
        ) : (
          <span className="tracking-wide">{currentMsg.text}</span>
        )}
      </div>
    </aside>
  );
};
