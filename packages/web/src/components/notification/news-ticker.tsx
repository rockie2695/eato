/**
 * News Ticker Component.
 *
 * Displays scrolling announcements/banners at the top of the page.
 * Auto-scrolls through multiple tickers. Clickable if link is provided.
 *
 * @example
 * <NewsTicker />
 */

import { useState, useEffect, useCallback } from 'react';
import { Megaphone, ExternalLink, X } from 'lucide-react';
import type { Notification } from '@eato/shared/types';

interface NewsTickerProps {
  tickers: Notification[];
  onDismiss?: () => void;
}

export function NewsTicker({ tickers, onDismiss }: NewsTickerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const activeTickers = tickers.filter((t) => t.isActive);

  // Auto-rotate through tickers
  useEffect(() => {
    if (activeTickers.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeTickers.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeTickers.length, isPaused]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    onDismiss?.();
  }, [onDismiss]);

  if (!isVisible || activeTickers.length === 0) return null;

  const current = activeTickers[currentIndex];
  const content = (
    <div className="flex items-center gap-3 min-w-0">
      <Megaphone className="h-4 w-4 text-primary flex-shrink-0" />
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-semibold text-sm flex-shrink-0">{current.title}</span>
        <span className="text-sm truncate">{current.message}</span>
      </div>
      {current.link && (
        <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-60" />
      )}
    </div>
  );

  return (
    <div
      className="relative bg-primary/5 border-b border-primary/10 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container px-4 py-2.5">
        <div className="flex items-center justify-between gap-4">
          {current.link ? (
            <a
              href={current.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-0 hover:opacity-80 transition-opacity"
            >
              {content}
            </a>
          ) : (
            <div className="flex-1 min-w-0">{content}</div>
          )}

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 rounded-full hover:bg-primary/10 transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>

        {/* Progress dots */}
        {activeTickers.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-1.5">
            {activeTickers.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? 'w-4 bg-primary'
                    : 'w-1 bg-primary/30'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
