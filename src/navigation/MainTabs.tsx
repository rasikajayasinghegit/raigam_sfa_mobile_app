import React, { useRef } from 'react';
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { enableScreens } from 'react-native-screens';
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChartLine,
  ClipboardText,
  House,
  Receipt,
  Storefront,
} from 'phosphor-react-native';
import { colors } from '../theme/colors';
import { DashboardScreen } from '../screens/DashboardScreen';
import { InvoiceScreen } from '../screens/InvoiceScreen';
import { OutletScreen } from '../screens/OutletScreen';
import { ReportScreen } from '../screens/ReportScreen';
import { SurveyScreen } from '../screens/SurveyScreen';
import { LoginPayload } from '../services/auth';
import { DayCycleState } from '../services/dayCycle';
import { DayStatus } from '../hooks/useDayCycle';

enableScreens();

type TabParamList = {
  Dashboard: undefined;
  Invoice: undefined;
  Outlet: undefined;
  Report: undefined;
  Survey: undefined;
};

type Props = {
  user: LoginPayload;
  onLogout: () => Promise<void>;
  dayState: DayCycleState | null;
  dayStatus: DayStatus;
  dayLoading: boolean;
  onStartDay: () => Promise<void>;
  onEndDay: () => Promise<void>;
};

const Tab = createBottomTabNavigator<TabParamList>();

const tabIcon = (
  route: keyof TabParamList,
  color: string,
  focused: boolean,
) => {
  const weight = focused ? 'fill' : 'regular';
  if (route === 'Dashboard')
    return <House size={24} color={color} weight={weight} />;
  if (route === 'Invoice')
    return <Receipt size={24} color={color} weight={weight} />;
  if (route === 'Outlet')
    return <Storefront size={24} color={color} weight={weight} />;
  if (route === 'Report')
    return <ChartLine size={24} color={color} weight={weight} />;
  return <ClipboardText size={24} color={color} weight={weight} />;
};

const CustomTabBar = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  const animations = useRef<Record<string, Animated.Value>>({});
  const insets = useSafeAreaInsets();
  const shellPaddingBottom = Math.max(insets.bottom, 12);
  const ACTIVE_COLOR = colors.primary;
  const INACTIVE_COLOR = '#a0a8bb';

  return (
    <View style={[styles.tabShell, { paddingBottom: shellPaddingBottom }]}>
      {/* ✅ Glass background using gradient + transparency */}
      <View style={StyleSheet.absoluteFillObject}>
        <LinearGradient
          colors={[
            'rgba(255,255,255,0.15)',
            'rgba(255,255,255,0.08)',
            'rgba(255,255,255,0.12)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.glassLayer}
        />
      </View>

      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;
          const isFocused = state.index === index;
          const color = isFocused ? ACTIVE_COLOR : INACTIVE_COLOR;

          if (!animations.current[route.key]) {
            animations.current[route.key] = new Animated.Value(
              isFocused ? 1 : 0,
            );
          } else {
            Animated.spring(animations.current[route.key], {
              toValue: isFocused ? 1 : 0,
              useNativeDriver: true,
              tension: 140,
              friction: 12,
            }).start();
          }

          const scale = animations.current[route.key]?.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.08],
          });
          const translateY = animations.current[route.key]?.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -4],
          });
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.82}
            >
              <Animated.View style={{ transform: [{ translateY }, { scale }] }}>
                {tabIcon(route.name as keyof TabParamList, color, isFocused)}
              </Animated.View>
              <Animated.Text
                style={[
                  styles.tabLabel,
                  { color, opacity: isFocused ? 1 : 0.85 },
                ]}
              >
                {label as string}
              </Animated.Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export function MainTabs({
  user,
  onLogout,
  dayState,
  dayStatus,
  dayLoading,
  onStartDay,
  onEndDay,
}: Props) {
  return (
    <Tab.Navigator
      sceneContainerStyle={styles.sceneContainer}
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen name="Dashboard">
        {() => (
          <DashboardScreen
            user={user}
            onLogout={onLogout}
            dayState={dayState}
            dayStatus={dayStatus}
            dayLoading={dayLoading}
            onStartDay={onStartDay}
            onEndDay={onEndDay}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Invoice">
        {() => <InvoiceScreen onLogout={onLogout} user={user} />}
      </Tab.Screen>
      <Tab.Screen name="Outlet">
        {() => <OutletScreen onLogout={onLogout} user={user} />}
      </Tab.Screen>
      <Tab.Screen name="Report">
        {() => <ReportScreen onLogout={onLogout} user={user} />}
      </Tab.Screen>
      <Tab.Screen name="Survey">
        {() => <SurveyScreen onLogout={onLogout} user={user} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  sceneContainer: {
    backgroundColor: colors.background,
    paddingBottom: 96,
  },
  tabShell: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 12,
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 12,
    zIndex: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  glassLayer: {
    flex: 1,
    borderRadius: 999,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor:
      Platform.OS === 'ios'
        ? 'rgba(255, 255, 255, 0.65)'
        : 'rgba(20, 20, 20, 0.9)',
    shadowColor: Platform.OS === 'ios' ? '#0f172a' : '#000',
    shadowOpacity: Platform.OS === 'ios' ? 0.2 : 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 6,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
});
