import React from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ClipboardText, ClockCounterClockwise, PaperPlaneTilt, PencilSimple } from 'phosphor-react-native';
import { AppHeader } from '../components/AppHeader';
import { ScreenBackground } from '../components/ScreenBackground';
import { tabStyles } from './tabStyles';
import { LoginPayload } from '../services/auth';

type Props = {
  onLogout: () => Promise<void>;
  user: LoginPayload;
};

export function SurveyScreen({ onLogout, user }: Props) {
  return (
    <SafeAreaView style={tabStyles.container}>
      <ScreenBackground />
      <AppHeader title="Survey" hideBack onRightPress={() => onLogout()} />
      <ScrollView
        contentContainerStyle={tabStyles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient colors={['#e7e9ff', '#f7f7ff']} style={tabStyles.hero}>
          <View style={tabStyles.heroIcon}>
            <ClipboardText size={26} color="#4338ca" weight="duotone" />
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
              <PencilSimple size={22} color="#4338ca" weight="duotone" />
              <Text style={tabStyles.actionText}>New survey</Text>
            </TouchableOpacity>
            <TouchableOpacity style={tabStyles.actionButton} activeOpacity={0.9}>
              <ClockCounterClockwise size={22} color="#4338ca" weight="duotone" />
              <Text style={tabStyles.actionText}>History</Text>
            </TouchableOpacity>
            <TouchableOpacity style={tabStyles.actionButton} activeOpacity={0.9}>
              <PaperPlaneTilt size={22} color="#4338ca" weight="duotone" />
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
