import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  ClipboardText,
  ClockCounterClockwise,
  PaperPlaneTilt,
  PencilSimple,
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

export function SurveyScreen({ onLogout, user }: Props) {
  const tabStyles = useTabStyles();
  const { colors, gradients } = useThemeMode();
  const openSettings = useOpenSettings();
  return (
    <SafeAreaView style={tabStyles.container}>
      <ScreenBackground />
      <AppHeader
        title="Survey"
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
        <LinearGradient colors={gradients.surveyHero} style={tabStyles.hero}>
          <View style={tabStyles.heroIcon}>
            <ClipboardText size={26} color={colors.secondary} weight="duotone" />
          </View>
          <View style={tabStyles.heroText}>
            <Text style={tabStyles.heroTitle}>Customer surveys</Text>
            <Text style={tabStyles.heroSubtitle}>
              Collect field feedback and store responses under {user.territoryName || 'your region'}.
            </Text>
          </View>
        </LinearGradient>

        <View style={tabStyles.card}>
          <View style={tabStyles.cardHeader}>
            <Text style={tabStyles.cardTitle}>Quick actions</Text>
            <View style={tabStyles.badge}>
              <Text style={tabStyles.badgeText}>Forms</Text>
            </View>
          </View>
          <View style={tabStyles.actionRow}>
            <TouchableOpacity style={tabStyles.actionButton} activeOpacity={0.9}>
              <PencilSimple size={22} color={colors.secondary} weight="duotone" />
              <Text style={tabStyles.actionText}>New survey</Text>
            </TouchableOpacity>
            <TouchableOpacity style={tabStyles.actionButton} activeOpacity={0.9}>
              <ClockCounterClockwise size={22} color={colors.secondary} weight="duotone" />
              <Text style={tabStyles.actionText}>History</Text>
            </TouchableOpacity>
            <TouchableOpacity style={tabStyles.actionButton} activeOpacity={0.9}>
              <PaperPlaneTilt size={22} color={colors.secondary} weight="duotone" />
              <Text style={tabStyles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[tabStyles.card, tabStyles.mutedCard]}>
          <Text style={tabStyles.cardTitle}>Templates coming soon</Text>
          <Text style={tabStyles.cardSubtitle}>
            Standardized questionnaires will be listed here for product feedback, merchandising, and
            outlet audits.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
