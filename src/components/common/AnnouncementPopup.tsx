import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Copy, Check, ArrowRight } from 'lucide-react';
import { PopupCampaign } from '../../types';

interface PopupProps {
  previewCampaign?: PopupCampaign | null;
  onClosePreview?: () => void;
}

export const AnnouncementPopup: React.FC<PopupProps> = ({ previewCampaign, onClosePreview }) => {
  const { activePopup, isPopupVisible, closePopup, triggerPopupAction } = useStore();
  const [copied, setCopied] = useState(false);

  const campaign = previewCampaign || (isPopupVisible ? activePopup : null);
  const handleClose = onClosePreview || closePopup;

  // Keyboard accessibility: ESC key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && campaign) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [campaign, handleClose]);

  if (!campaign) return null;

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isImageText = campaign.layout === 'image_text' && campaign.imageUrl;
  const isCompact = campaign.layout === 'compact';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="popup-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity"
    >
      <div
        className={`relative w-full max-w-2xl bg-[#FFF9F4] rounded-2xl shadow-xl overflow-hidden border border-[#E8DCCB] animate-in fade-in zoom-in-95 duration-200 ${
          isCompact ? 'max-w-md' : 'max-w-2xl'
        }`}
        style={{
          backgroundColor: campaign.backgroundColor || '#FFF9F4',
          color: campaign.textColor || '#5A463C',
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          aria-label="Close notification"
          className="absolute top-4 right-4 z-20 p-2 rounded-full text-[#5A463C]/60 hover:text-[#5A463C] hover:bg-black/5 transition-colors focus-visible:ring-2 focus-visible:ring-[#5A463C]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className={`flex flex-col ${isImageText ? 'md:flex-row' : ''}`}>
          {/* Image Column */}
          {campaign.imageUrl && (
            <div className={`relative ${isImageText ? 'md:w-5/12 h-56 md:h-auto shrink-0' : 'h-48 w-full'}`}>
              <img
                src={campaign.imageUrl}
                alt="Promotion"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent md:hidden" />
            </div>
          )}

          {/* Content Column */}
          <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
            <span className="text-xs uppercase tracking-wider text-[#8A7569] font-medium mb-1.5">
              Little Nest Welcome
            </span>
            <h3
              id="popup-title"
              className="text-2xl md:text-3xl font-serif-luxury font-medium text-[#4A3B32] mb-3 leading-snug"
            >
              {campaign.headline}
            </h3>
            <p className="text-sm text-[#665449] mb-5 leading-relaxed">
              {campaign.description}
            </p>

            {/* Optional Coupon Code box */}
            {campaign.couponCode && (
              <div className="flex items-center justify-between p-3 mb-5 bg-[#F2D8D5]/35 border border-[#F2D8D5] rounded-lg">
                <div>
                  <span className="block text-[11px] font-medium uppercase text-[#8A7569]">
                    Exclusive Code
                  </span>
                  <span className="text-sm font-semibold tracking-wider font-mono text-[#5A463C]">
                    {campaign.couponCode}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyCouponCode(campaign.couponCode!)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-white border border-[#E8DCCB] text-[#5A463C] hover:bg-[#FFF9F4] transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Primary Action Button */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <a
                href={campaign.buttonLink || '/shop'}
                onClick={triggerPopupAction}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-[#5A463C] hover:bg-[#43332B] transition-colors shadow-xs"
              >
                <span>{campaign.buttonText || 'Explore Collection'}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={handleClose}
                className="text-xs text-[#8A7569] hover:text-[#5A463C] hover:underline transition-colors py-2"
              >
                No thanks, continue browsing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
