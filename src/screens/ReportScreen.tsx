import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native';
import { CaretRight, GearSix, Package, Receipt } from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { AppHeader } from '../components/AppHeader';
import { ScreenBackground } from '../components/ScreenBackground';
import { useTabStyles } from './tabStyles';
import { LoginPayload } from '../services/auth';
import { useOpenSettings } from '../hooks/useOpenSettings';
import { useThemeMode } from '../context/ThemeContext';
import { RootStackParamList, TabParamList } from '../navigation/types';

type Props = {
  onLogout: () => Promise<void>;
  user: LoginPayload;
};

type ReportNav = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Report'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function ReportScreen({ onLogout, user }: Props) {
  const tabStyles = useTabStyles();
  const { colors } = useThemeMode();
  const openSettings = useOpenSettings();
  const navigation = useNavigation<ReportNav>();
  const reports = [
    {
      title: 'Invoice Summary Report',
      route: 'InvoiceSummary',
      description: 'Collections and payment status by period.',
      icon: Receipt,
      tint: colors.primary,
      tintBg: colors.primarySoft,
    },
    {
      title: 'Product Report',
      route: 'ProductReport',
      description: 'SKU performance, movement, and coverage.',
      icon: Package,
      tint: colors.info,
      tintBg: colors.infoSoft,
    },
  ];

  const handleReportPress = (route: string) => {
    if (route === 'InvoiceSummary') {
      navigation.navigate('InvoiceSummary');
    }
  };
  return (
    <SafeAreaView style={tabStyles.container}>
      <ScreenBackground />
      <AppHeader
        title="Reports"
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
        <View style={tabStyles.card}>
          <View style={tabStyles.cardHeader}>
            <Text style={tabStyles.cardTitle}>Available reports</Text>
          </View>
          <Text style={tabStyles.cardSubtitle}>
            Export-ready snapshots built for finance and supply chain teams.
          </Text>

          <View style={tabStyles.reportList}>
            {reports.map(report => {
              const Icon = report.icon;
              return (
                <TouchableOpacity
                  key={report.route}
                  activeOpacity={0.88}
                  style={tabStyles.reportItem}
                  onPress={() => handleReportPress(report.route)}
                >
                  <View
                    style={[
                      tabStyles.reportIcon,
                      { backgroundColor: report.tintBg },
                    ]}
                  >
                    <Icon size={22} color={report.tint} weight="duotone" />
                  </View>
                  <View style={tabStyles.reportCopy}>
                    <Text style={tabStyles.reportTitle}>{report.title}</Text>
                    <Text style={tabStyles.reportMeta}>
                      {report.description}
                    </Text>
                    <View style={tabStyles.reportRouteBadge}>
                      <Text style={tabStyles.reportRouteText}>
                        {report.route}
                      </Text>
                    </View>
                  </View>
                  <CaretRight
                    size={18}
                    color={colors.textMuted}
                    weight="bold"
                    style={tabStyles.reportChevron}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
