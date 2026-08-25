/**
 * Home Screen.
 *
 * Landing screen with featured items and quick actions.
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export function HomeScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const card1Anim = useRef(new Animated.Value(0)).current;
  const card2Anim = useRef(new Animated.Value(0)).current;
  const card3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.stagger(150, [
      Animated.timing(card1Anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(card2Anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(card3Anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <Animated.View style={[styles.heroContainer, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={['#ea580c', '#f97316', '#fb923c']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroGreeting}>Good evening 👋</Text>
            <Text style={styles.heroTitle}>What are you{'\n'}craving?</Text>

            <TouchableOpacity
              style={styles.searchBar}
              onPress={() => navigation.navigate('Menu')}
              activeOpacity={0.8}
            >
              <Ionicons name="search-outline" size={20} color="#94a3b8" />
              <Text style={styles.searchPlaceholder}>Search for dishes...</Text>
              <View style={styles.searchMic}>
                <Ionicons name="mic-outline" size={18} color="#ea580c" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.heroCurve}>
            <View style={styles.heroCurveInner} />
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Quick Actions */}
      <Animated.View
        style={[
          styles.quickActionsContainer,
          {
            opacity: card1Anim,
            transform: [
              {
                translateY: card1Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Menu')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#fff7ed' }]}>
              <Ionicons name="restaurant-outline" size={28} color="#ea580c" />
            </View>
            <Text style={styles.actionLabel}>Menu</Text>
            <Text style={styles.actionSublabel}>Browse dishes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Cart')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="cart-outline" size={28} color="#f59e0b" />
            </View>
            <Text style={styles.actionLabel}>Cart</Text>
            <Text style={styles.actionSublabel}>View order</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Orders')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#dbeafe' }]}>
              <Ionicons name="receipt-outline" size={28} color="#3b82f6" />
            </View>
            <Text style={styles.actionLabel}>Orders</Text>
            <Text style={styles.actionSublabel}>Track status</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* How it works */}
      <Animated.View
        style={[
          styles.howItWorksContainer,
          {
            opacity: card2Anim,
            transform: [
              {
                translateY: card2Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.sectionTitle}>How it works</Text>
        <View style={styles.stepsCard}>
          {[
            { step: '01', icon: 'scan-outline', title: 'Scan QR Code', desc: 'Scan the QR code on your table' },
            { step: '02', icon: 'fast-food-outline', title: 'Choose Your Meal', desc: 'Browse our delicious menu' },
            { step: '03', icon: 'card-outline', title: 'Pay Securely', desc: 'Cash or online payment' },
            { step: '04', icon: 'checkmark-circle-outline', title: 'Enjoy!', desc: 'We deliver to your table' },
          ].map((item, index) => (
            <View key={item.step} style={styles.stepItem}>
              <View style={styles.stepLeft}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{item.step}</Text>
                </View>
                {index < 3 && <View style={styles.stepConnector} />}
              </View>
              <View style={styles.stepContent}>
                <View style={styles.stepIconRow}>
                  <Ionicons name={item.icon as any} size={22} color="#ea580c" />
                  <Text style={styles.stepTitle}>{item.title}</Text>
                </View>
                <Text style={styles.stepDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Promo Card */}
      <Animated.View
        style={[
          styles.promoContainer,
          {
            opacity: card3Anim,
            transform: [
              {
                translateY: card3Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.promoCard}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Menu')}
        >
          <LinearGradient
            colors={['#ea580c', '#f97316']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.promoGradient}
          >
            <View style={styles.promoContent}>
              <Text style={styles.promoTag}>LIMITED OFFER</Text>
              <Text style={styles.promoTitle}>20% Off{'\n'}Your First Order</Text>
              <Text style={styles.promoSubtitle}>Use code WELCOME at checkout</Text>
            </View>
            <Text style={styles.promoEmoji}>🎉</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  heroContainer: {
    position: 'relative',
  },
  hero: {
    paddingTop: 50,
    paddingBottom: 60,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroContent: {
    paddingHorizontal: 24,
  },
  heroGreeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 40,
    marginBottom: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 15,
    color: '#94a3b8',
    marginLeft: 12,
  },
  searchMic: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff7ed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCurve: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
  },
  heroCurveInner: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  actionSublabel: {
    fontSize: 11,
    color: '#94a3b8',
  },
  howItWorksContainer: {
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  stepsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ea580c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  stepConnector: {
    width: 2,
    height: 24,
    backgroundColor: '#e2e8f0',
    marginTop: 8,
  },
  stepContent: {
    flex: 1,
    paddingTop: 4,
  },
  stepIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 8,
  },
  stepDesc: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  promoContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  promoCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  promoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
  },
  promoContent: {
    flex: 1,
  },
  promoTag: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
    marginBottom: 8,
  },
  promoTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 28,
    marginBottom: 8,
  },
  promoSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  promoEmoji: {
    fontSize: 48,
    marginLeft: 16,
  },
  bottomSpacer: {
    height: 32,
  },
});
