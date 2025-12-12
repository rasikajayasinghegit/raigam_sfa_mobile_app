import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  ArrowSquareOut,
  ChartLine,
  ChartPieSlice,
  FileCsv,
  Funnel,
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

export function ReportScreen({ onLogout, user }: Props) {
  const tabStyles = useTabStyles();
  const { colors, gradients } = useThemeMode();
  const openSettings = useOpenSettings();
  return (
    <SafeAreaView style={tabStyles.container}>
      <ScreenBackground />
      <AppHeader
        title="Report"
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
        <LinearGradient colors={gradients.reportHero} style={tabStyles.hero}>
          <View style={tabStyles.heroIcon}>
            <ChartLine size={26} color={colors.primaryDark} weight="duotone" />
          </View>
          <View style={tabStyles.heroText}>
            <Text style={tabStyles.heroTitle}>Reports & insights</Text>
            <Text style={tabStyles.heroSubtitle}>
              View performance and export summaries for {user.personalName || user.userName}.
            </Text>
          </View>
        </LinearGradient>

        <View style={tabStyles.card}>
          <View style={tabStyles.cardHeader}>
            <Text style={tabStyles.cardTitle}>Exports</Text>
            <View style={tabStyles.badge}>
              <Text style={tabStyles.badgeText}>CSV / PDF</Text>
            </View>
          </View>
          <View style={tabStyles.actionRow}>
            <TouchableOpacity style={tabStyles.actionButton} activeOpacity={0.9}>
              <ChartPieSlice size={22} color={colors.primary} weight="duotone" />
              <Text style={tabStyles.actionText}>Performance</Text>
            </TouchableOpacity>
            <TouchableOpacity style={tabStyles.actionButton} activeOpacity={0.9}>
              <Funnel size={22} color={colors.primary} weight="duotone" />
              <Text style={tabStyles.actionText}>Filters</Text>
            </TouchableOpacity>
            <TouchableOpacity style={tabStyles.actionButton} activeOpacity={0.9}>
              <FileCsv size={22} color={colors.primary} weight="duotone" />
              <Text style={tabStyles.actionText}>Export</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={tabStyles.card}>
          <View style={tabStyles.cardHeader}>
            <Text style={tabStyles.cardTitle}>Summary</Text>
            <ArrowSquareOut size={18} color={colors.textMuted} weight="duotone" />
          </View>
          <View style={tabStyles.row}>
            <Text style={tabStyles.rowLabel}>Total visits</Text>
            <Text style={tabStyles.rowValue}>0</Text>
          </View>
          <View style={tabStyles.row}>
            <Text style={tabStyles.rowLabel}>Total invoices</Text>
            <Text style={tabStyles.rowValue}>0</Text>
          </View>
          <View style={tabStyles.row}>
            <Text style={tabStyles.rowLabel}>Coverage</Text>
            <Text style={tabStyles.rowValue}>0%</Text>
          </View>
        </View>

        <View style={[tabStyles.card, tabStyles.mutedCard]}>
          <Text style={tabStyles.cardTitle}>No data yet</Text>
          <Text style={tabStyles.cardSubtitle}>
            Once you start your day and log activities, they will appear here with trend lines and
            export options.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
