import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  Compass,
  MapPin,
  Storefront,
  UserPlus,
  GearSix,
} from 'phosphor-react-native';
import { AppHeader } from '../components/AppHeader';
import { ScreenBackground } from '../components/ScreenBackground';
import { useTabStyles } from './tabStyles';
import { LoginPayload } from '../services/auth';
import { useOpenSettings } from '../hooks/useOpenSettings';
import { useThemeMode } from '../context/ThemeContext';

type Props = {
  onLogout: () => Promise<void>;
  user: LoginPayload;
};

export function OutletScreen({ onLogout, user }: Props) {
  const tabStyles = useTabStyles();
  const { colors, gradients } = useThemeMode();
  const openSettings = useOpenSettings();
  return (
    <SafeAreaView style={tabStyles.container}>
      <ScreenBackground />
      <AppHeader
        title="Outlet"
        hideBack
        onRightPress={() => onLogout()}
        secondaryRightIcon={
          <GearSix size={22} color={colors.text} weight="regular" />
        }
        onSecondaryRightPress={openSettings}
      />
      <ScrollView
        contentContainerStyle={tabStyles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient colors={gradients.outletHero} style={tabStyles.hero}>
          <View style={tabStyles.heroIcon}>
            <Storefront size={26} color={colors.info} weight="duotone" />
          </View>
          <View style={tabStyles.heroText}>
            <Text style={tabStyles.heroTitle}>Outlet coverage</Text>
            <Text style={tabStyles.heroSubtitle}>
              Track store visits and plan routes in{' '}
              {user.territoryName || 'your area'}.
            </Text>
          </View>
        </LinearGradient>

        <View style={tabStyles.card}>
          <View style={tabStyles.cardHeader}>
            <Text style={tabStyles.cardTitle}>Quick actions</Text>
            <View style={tabStyles.badge}>
              <Text style={tabStyles.badgeText}>Today</Text>
            </View>
          </View>
          <View style={tabStyles.actionRow}>
            <TouchableOpacity
              style={tabStyles.actionButton}
              activeOpacity={0.9}
            >
              <MapPin size={22} color={colors.info} weight="duotone" />
              <Text style={tabStyles.actionText}>Nearby</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={tabStyles.actionButton}
              activeOpacity={0.9}
            >
              <UserPlus size={22} color={colors.info} weight="duotone" />
              <Text style={tabStyles.actionText}>Add outlet</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={tabStyles.actionButton}
              activeOpacity={0.9}
            >
              <Compass size={22} color={colors.info} weight="duotone" />
              <Text style={tabStyles.actionText}>Route</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={tabStyles.card}>
          <View style={tabStyles.cardHeader}>
            <Text style={tabStyles.cardTitle}>Territory snapshot</Text>
            <Text style={tabStyles.cardSubtitle}>
              Region #{user.territoryId}
            </Text>
          </View>
          <View style={tabStyles.row}>
            <Text style={tabStyles.rowLabel}>Assigned outlets</Text>
            <Text style={tabStyles.rowValue}>0</Text>
          </View>
          <View style={tabStyles.row}>
            <Text style={tabStyles.rowLabel}>Visited today</Text>
            <Text style={tabStyles.rowValue}>0</Text>
          </View>
          <View style={tabStyles.row}>
            <Text style={tabStyles.rowLabel}>Remaining</Text>
            <Text style={tabStyles.rowValue}>0</Text>
          </View>
        </View>

        <View style={[tabStyles.card, tabStyles.mutedCard]}>
          <Text style={tabStyles.cardTitle}>No outlets synced yet</Text>
          <Text style={tabStyles.cardSubtitle}>
            Sync your assigned outlets to start planning visits. We will show
            them here with map support and visit history.
          </Text>
        </View>
        <View style={[tabStyles.card, tabStyles.mutedCard]}>
          <Text style={tabStyles.cardTitle}>No outlets synced yet</Text>
          <Text style={tabStyles.cardSubtitle}>
            Sync your assigned outlets to start planning visits. We will show
            them here with map support and visit history.
          </Text>
        </View>
        <View style={[tabStyles.card, tabStyles.mutedCard]}>
          <Text style={tabStyles.cardTitle}>No outlets synced yet</Text>
          <Text style={tabStyles.cardSubtitle}>
            Sync your assigned outlets to start planning visits. We will show
            them here with map support and visit history.
          </Text>
        </View>
        <View style={[tabStyles.card, tabStyles.mutedCard]}>
          <Text style={tabStyles.cardTitle}>No outlets synced yet</Text>
          <Text style={tabStyles.cardSubtitle}>
            Sync your assigned outlets to start planning visits. We will show
            them here with map support and visit history.
          </Text>
        </View>
        <View style={[tabStyles.card, tabStyles.mutedCard]}>
          <Text style={tabStyles.cardTitle}>No outlets synced yet</Text>
          <Text style={tabStyles.cardSubtitle}>
            Sync your assigned outlets to start planning visits. We will show
            them here with map support and visit history.
          </Text>
        </View>
        <View style={[tabStyles.card, tabStyles.mutedCard]}>
          <Text style={tabStyles.cardTitle}>No outlets synced yet</Text>
          <Text style={tabStyles.cardSubtitle}>
            Sync your assigned outlets to start planning visits. We will show
            them here with map support and visit history.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
