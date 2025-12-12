import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  DownloadSimple,
  PaperPlaneTilt,
  PlusCircle,
  Receipt,
  ShareNetwork,
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

export function InvoiceScreen({ onLogout, user }: Props) {
  const tabStyles = useTabStyles();
  const { colors, gradients } = useThemeMode();
  const openSettings = useOpenSettings();
  return (
    <SafeAreaView style={tabStyles.container}>
      <ScreenBackground />
      <AppHeader
        title="Invoice"
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
        <LinearGradient colors={gradients.invoiceHero} style={tabStyles.hero}>
          <View style={tabStyles.heroIcon}>
            <Receipt size={26} color={colors.primary} weight="duotone" />
          </View>
          <View style={tabStyles.heroText}>
            <Text style={tabStyles.heroTitle}>Invoice workspace</Text>
            <Text style={tabStyles.heroSubtitle}>
              Create, track, and share invoices with your customers.
            </Text>
          </View>
        </LinearGradient>

        <View style={tabStyles.card}>
          <View style={tabStyles.cardHeader}>
            <Text style={tabStyles.cardTitle}>Quick actions</Text>
            <View style={tabStyles.badge}>
              <Text style={tabStyles.badgeText}>Live</Text>
            </View>
          </View>
          <View style={tabStyles.actionRow}>
            <TouchableOpacity style={tabStyles.actionButton} activeOpacity={0.9}>
              <PlusCircle size={22} color={colors.primary} weight="duotone" />
              <Text style={tabStyles.actionText}>New invoice</Text>
            </TouchableOpacity>
            <TouchableOpacity style={tabStyles.actionButton} activeOpacity={0.9}>
              <DownloadSimple size={22} color={colors.primary} weight="duotone" />
              <Text style={tabStyles.actionText}>Download</Text>
            </TouchableOpacity>
            <TouchableOpacity style={tabStyles.actionButton} activeOpacity={0.9}>
              <ShareNetwork size={22} color={colors.primary} weight="duotone" />
              <Text style={tabStyles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={tabStyles.card}>
          <View style={tabStyles.cardHeader}>
            <Text style={tabStyles.cardTitle}>Pipeline</Text>
            <Text style={tabStyles.cardSubtitle}>Account: {user.agencyCode || 'N/A'}</Text>
          </View>
          <View style={tabStyles.row}>
            <Text style={tabStyles.rowLabel}>Drafts</Text>
            <Text style={tabStyles.rowValue}>0</Text>
          </View>
          <View style={tabStyles.row}>
            <Text style={tabStyles.rowLabel}>Pending approval</Text>
            <Text style={tabStyles.rowValue}>0</Text>
          </View>
          <View style={tabStyles.row}>
            <Text style={tabStyles.rowLabel}>Dispatched</Text>
            <Text style={tabStyles.rowValue}>0</Text>
          </View>
        </View>

        <View style={[tabStyles.card, tabStyles.mutedCard]}>
          <View style={tabStyles.cardHeader}>
            <Text style={tabStyles.cardTitle}>Inbox</Text>
            <PaperPlaneTilt size={18} color={colors.textMuted} weight="duotone" />
          </View>
          <Text style={tabStyles.cardSubtitle}>
            Your invoices will appear here when created. Use quick actions above to get started.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
