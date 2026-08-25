/**
 * Mobile App Entry Point.
 *
 * Sets up navigation and providers for the Expo React Native app.
 */

import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Stores
import { useAuthStore, useCartStore, useNotificationStore, notificationApi } from './src/stores';

// Components
import { NewsTicker } from './src/components/NewsTicker';
import { NotificationPopup } from './src/components/NotificationPopup';

// Screens
import { HomeScreen } from './src/screens/HomeScreen';
import { MenuScreen } from './src/screens/MenuScreen';
import { CartScreen } from './src/screens/CartScreen';
import { OrdersScreen } from './src/screens/OrdersScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { OrderDetailScreen } from './src/screens/OrderDetailScreen';

// Types
import type { RootStackParamList, TabParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#ea580c',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#f1f5f9',
          borderTopWidth: 0,
          paddingBottom: Platform.OS === 'ios' ? 24 : 12,
          paddingTop: 12,
          height: Platform.OS === 'ios' ? 88 : 72,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 12,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.tabIconContainerActive]}>
              <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Menu"
        component={MenuScreen}
        options={{
          tabBarLabel: 'Menu',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.tabIconContainerActive]}>
              <Ionicons name={focused ? 'restaurant' : 'restaurant-outline'} size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarLabel: 'Cart',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.tabIconContainerActive]}>
              <Ionicons name={focused ? 'cart' : 'cart-outline'} size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarLabel: 'Orders',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.tabIconContainerActive]}>
              <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={22} color={color} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const { initialize, isLoading } = useAuthStore();
  const { loadCart } = useCartStore();
  const {
    tickers,
    popups,
    dismissedPopups,
    loadActive,
    dismissPopup,
  } = useNotificationStore();

  useEffect(() => {
    initialize();
    loadCart();
    loadActive(notificationApi.getActive);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ea580c" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <View style={{ flex: 1 }}>
          {/* News Ticker - shows at top of all screens */}
          <NewsTicker tickers={tickers} />

          <Stack.Navigator
            screenOptions={{
              headerStyle: {
                backgroundColor: '#ea580c',
                shadowColor: '#ea580c',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: '700',
                fontSize: 18,
              },
              headerShadowVisible: true,
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen
              name="Main"
              component={TabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                title: 'Sign In',
                headerBackTitle: 'Back',
                headerTransparent: true,
                headerStyle: { backgroundColor: 'transparent' },
                headerShadowVisible: false,
              }}
            />
            <Stack.Screen
              name="OrderDetail"
              component={OrderDetailScreen}
              options={{
                title: 'Order Details',
                headerBackTitle: 'Back',
                headerStyle: { backgroundColor: '#ea580c' },
              }}
            />
          </Stack.Navigator>

          {/* Notification Popup */}
          <NotificationPopup
            popups={popups}
            dismissedIds={dismissedPopups}
            onDismiss={dismissPopup}
          />
        </View>
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconContainerActive: {
    // Optional: add subtle background for active tab
  },
});
