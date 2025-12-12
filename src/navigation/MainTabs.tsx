import React, { useRef } from 'react';
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { enableScreens } from 'react-native-screens';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  ChartLine,
  ClipboardText,
  House,
  Receipt,
  Storefront,
} from 'phosphor-react-native';
import { ColorPalette } from '../theme/colors';
import { DashboardScreen } from '../screens/DashboardScreen';
import { InvoiceScreen } from '../screens/InvoiceScreen';
import { OutletScreen } from '../screens/OutletScreen';
import { ReportScreen } from '../screens/ReportScreen';
import { SurveyScreen } from '../screens/SurveyScreen';
import { LoginPayload } from '../services/auth';
import { DayCycleState } from '../services/dayCycle';
import { DayStatus } from '../hooks/useDayCycle';
import { TabParamList } from './types';
import { useThemeMode } from '../context/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';

enableScreens();

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
    return <House size={22} color={color} weight={weight} />;
  if (route === 'Invoice')
    return <Receipt size={22} color={color} weight={weight} />;
  if (route === 'Outlet')
    return <Storefront size={22} color={color} weight={weight} />;
  if (route === 'Report')
    return <ChartLine size={22} color={color} weight={weight} />;
  return <ClipboardText size={22} color={color} weight={weight} />;
};

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    tabShell: {
      backgroundColor: colors.background,
    },
    tabBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      paddingHorizontal: 24,
      paddingVertical: 10,
      minHeight: 64,
      borderRadius: 0,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderColor: colors.divider,
      elevation: 18,
      shadowColor: colors.shadow,
      shadowOpacity: 0.18,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
    },
    tabItem: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 4,
    },
    iconWrapper: {
      width: 46,
      height: 46,
      borderRadius: 23,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 2,
    },
    tabLabel: {
      fontSize: 12,
      fontWeight: '600',
      textAlign: 'center',
      letterSpacing: 0.2,
    },
  });

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const animations = useRef<Record<string, Animated.Value>>({});
  const { colors } = useThemeMode();
  const styles = useThemedStyles(createStyles);
  const ACTIVE_COLOR = colors.primary;
  const INACTIVE_COLOR = colors.textSubtle;
  return (
    <View style={styles.tabShell}>
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
              friction: 14,
            }).start();
          }

          const scale = animations.current[route.key]?.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.05],
          });
          const translateY = animations.current[route.key]?.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -2],
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
              onPress={onPress}
              activeOpacity={0.85}
              style={styles.tabItem}
            >
              <Animated.View
                style={[
                  styles.iconWrapper,
                  {
                    transform: [{ translateY }, { scale }],
                    backgroundColor: isFocused
                      ? colors.primarySoft
                      : 'transparent',
                  },
                ]}
              >
                {tabIcon(route.name as keyof TabParamList, color, isFocused)}
              </Animated.View>

              <Animated.Text
                style={[
                  styles.tabLabel,
                  {
                    color,
                    opacity: isFocused ? 1 : 0.65,
                  },
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
  const { colors } = useThemeMode();
  return (
    <Tab.Navigator
      sceneContainerStyle={{
        backgroundColor: colors.background, // ✅ solid background, no transparency
      }}
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
