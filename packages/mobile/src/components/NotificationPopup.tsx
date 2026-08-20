/**
 * Mobile Notification Popup Component.
 *
 * Displays a modal popup with image, text, or slides.
 * Supports single popup or multi-slide carousel.
 *
 * @example
 * <NotificationPopup popups={popups} onDismiss={dismissPopup} />
 */

import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
  Dimensions,
  StyleSheet,
} from 'react-native';
import type { Notification } from '@eato/shared/types';

interface NotificationPopupProps {
  popups: Notification[];
  dismissedIds: string[];
  onDismiss: (id: string) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function NotificationPopup({ popups, dismissedIds, onDismiss }: NotificationPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // Filter to non-dismissed, active popups
  const activePopups = popups.filter(
    (p) => p.isActive && !dismissedIds.includes(p.id)
  );

  useEffect(() => {
    if (activePopups.length > 0) {
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [activePopups.length]);

  const handleClose = () => {
    setIsOpen(false);
    activePopups.forEach((p) => onDismiss(p.id));
  };

  const handlePrev = () => {
    const newIndex = currentIndex === 0 ? activePopups.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    scrollViewRef.current?.scrollTo({ x: newIndex * SCREEN_WIDTH, animated: true });
  };

  const handleNext = () => {
    const newIndex = currentIndex === activePopups.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    scrollViewRef.current?.scrollTo({ x: newIndex * SCREEN_WIDTH, animated: true });
  };

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  if (!isOpen || activePopups.length === 0) return null;

  const isSlide = activePopups.length > 1;
  const current = activePopups[currentIndex];

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Close button */}
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          {/* Content */}
          {isSlide ? (
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleScroll}
            >
              {activePopups.map((popup) => (
                <View key={popup.id} style={[styles.slide, { width: SCREEN_WIDTH - 48 }]}>
                  {popup.image && (
                    <Image source={{ uri: popup.image }} style={styles.slideImage} />
                  )}
                  <View style={styles.slideContent}>
                    <Text style={styles.title}>{popup.title}</Text>
                    <Text style={styles.message}>{popup.message}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View>
              {current.image && (
                <Image source={{ uri: current.image }} style={styles.image} />
              )}
              <View style={styles.content}>
                <Text style={styles.title}>{current.title}</Text>
                <Text style={styles.message}>{current.message}</Text>
              </View>
            </View>
          )}

          {/* Navigation */}
          {isSlide && (
            <View style={styles.navigation}>
              <TouchableOpacity onPress={handlePrev} style={styles.navButton}>
                <Text style={styles.navText}>‹</Text>
              </TouchableOpacity>

              <View style={styles.dots}>
                {activePopups.map((_, i) => (
                  <View
                    key={i}
                    style={[styles.dot, i === currentIndex && styles.activeDot]}
                  />
                ))}
              </View>

              <TouchableOpacity onPress={handleNext} style={styles.navButton}>
                <Text style={styles.navText}>›</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Dismiss button */}
          <TouchableOpacity onPress={handleClose} style={styles.dismissButton}>
            <Text style={styles.dismissButtonText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    maxWidth: 400,
    width: '100%',
    maxHeight: '85%',
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 16,
    color: '#475569',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    color: '#475569',
  },
  slide: {
    overflow: 'hidden',
  },
  slideImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  slideContent: {
    padding: 20,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  navButton: {
    padding: 8,
  },
  navText: {
    fontSize: 28,
    color: '#64748b',
    fontWeight: '300',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e2e8f0',
  },
  activeDot: {
    backgroundColor: '#ea580c',
    width: 20,
  },
  dismissButton: {
    marginHorizontal: 24,
    marginBottom: 20,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  dismissButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
});
