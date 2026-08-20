/**
 * Notification Popup Component.
 *
 * Displays a modal popup with image, text, or slides.
 * Supports single popup or multi-slide carousel.
 *
 * @example
 * <NotificationPopup popups={popups} onDismiss={dismissPopup} />
 */

import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Notification } from '@eato/shared/types';

interface NotificationPopupProps {
  popups: Notification[];
  dismissedIds: string[];
  onDismiss: (id: string) => void;
}

export function NotificationPopup({ popups, dismissedIds, onDismiss }: NotificationPopupProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Filter to non-dismissed, active popups
  const activePopups = popups.filter(
    (p) => p.isActive && !dismissedIds.includes(p.id)
  );

  useEffect(() => {
    if (activePopups.length > 0) {
      // Show popup after a short delay
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [activePopups.length]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    if (activePopups.length > 0) {
      // Dismiss all visible popups
      activePopups.forEach((p) => onDismiss(p.id));
    }
  }, [activePopups, onDismiss]);

  const handlePrev = useCallback(() => {
    setCurrentSlide((prev) =>
      prev === 0 ? activePopups.length - 1 : prev - 1
    );
  }, [activePopups.length]);

  const handleNext = useCallback(() => {
    setCurrentSlide((prev) =>
      prev === activePopups.length - 1 ? 0 : prev + 1
    );
  }, [activePopups.length]);

  if (!isOpen || activePopups.length === 0) return null;

  const current = activePopups[currentSlide];
  const hasImage = !!current.image;
  const isSlide = activePopups.length > 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-background rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-background/80 backdrop-blur-sm hover:bg-muted transition-colors"
          aria-label="Close popup"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Image */}
        {hasImage && (
          <div className="relative h-56 overflow-hidden">
            <img
              src={current.image}
              alt={current.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          </div>
        )}

        {/* Content */}
        <div className={`p-6 ${hasImage ? 'relative -mt-12' : ''}`}>
          <h3 className="text-xl font-bold mb-2">{current.title}</h3>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {current.message}
          </p>

          {/* Action */}
          {current.link && (
            <a
              href={current.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-primary hover:underline font-medium"
            >
              Learn more
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>

        {/* Slide navigation */}
        {isSlide && (
          <div className="flex items-center justify-between px-4 pb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrev}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex gap-1.5">
              {activePopups.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentSlide
                      ? 'w-5 bg-primary'
                      : 'w-1.5 bg-primary/30'
                  }`}
                />
              ))}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Dismiss footer */}
        <div className="px-6 pb-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleClose}
          >
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
}
