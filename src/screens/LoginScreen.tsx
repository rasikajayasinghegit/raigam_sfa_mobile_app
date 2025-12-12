import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from 'react-native';
import { Eye, EyeSlash } from 'phosphor-react-native';
import { colors } from '../theme/colors';
import { Logo } from '../components/Logo';
import { ScreenBackground } from '../components/ScreenBackground';

type Props = {
  onSubmit: (
    username: string,
    password: string,
    remember: boolean,
  ) => Promise<void>;
  onLogout: () => Promise<void>;
  loading: boolean;
  error: string | null;
  rememberMe: boolean;
  sessionUserName?: string | null;
};

export function LoginScreen({
  onSubmit,
  onLogout,
  loading,
  error,
  rememberMe,
  sessionUserName,
}: Props) {
  const [username, setUsername] = useState(sessionUserName || '');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(rememberMe);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setRemember(rememberMe);
  }, [rememberMe]);

  const disabled = useMemo(
    () => loading || !username.trim() || !password,
    [loading, username, password],
  );

  const handleSubmit = async () => {
    try {
      await onSubmit(username, password, remember);
    } finally {
      setPassword('');
    }
  };

  const handleLogout = async () => {
    await onLogout();
    setPassword('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenBackground />
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.stack}>
            <View style={styles.hero}>
              <Logo size={220} />
              <Text style={styles.title}>Sign In</Text>
              <Text style={styles.subtitle}>
                Continue with your credentials
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputWrapper}>
                <TextInput
                  placeholder="Email or Username"
                  autoCapitalize="none"
                  value={username}
                  onChangeText={setUsername}
                  editable={!loading}
                  style={styles.input}
                  placeholderTextColor={colors.placeholder}
                />
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  placeholder="Password"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                  style={[styles.input, styles.inputWithIcon]}
                  placeholderTextColor={colors.placeholder}
                />
                <TouchableOpacity
                  style={styles.iconButton}
                  activeOpacity={0.7}
                  onPress={() => setShowPassword(prev => !prev)}
                >
                  {showPassword ? (
                    <Eye size={20} weight="regular" color={colors.accent} />
                  ) : (
                    <EyeSlash size={20} weight="regular" color={colors.accent} />
                  )}
                </TouchableOpacity>
              </View>

              <Pressable
                style={styles.policyRow}
                onPress={() => setRemember(prev => !prev)}
                disabled={loading}
              >
                <View
                  style={[
                    styles.circleBox,
                    remember && styles.circleBoxChecked,
                  ]}
                >
                  {remember ? <Text style={styles.checkboxMark}>✓</Text> : null}
                </View>
                <Text style={styles.policyText}>
                  Remember me on this device
                </Text>
              </Pressable>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Pressable
                style={[
                  styles.primaryButton,
                  disabled && styles.primaryButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={disabled}
              >
                <Text style={styles.primaryButtonText}>
                  {loading ? 'Signing in…' : 'Sign In'}
                </Text>
              </Pressable>

              {sessionUserName ? (
                <Pressable
                  style={styles.secondaryButton}
                  onPress={handleLogout}
                  disabled={loading}
                >
                  <Text style={styles.secondaryButtonText}>Logout</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scroll: {
    flexGrow: 1,
    paddingVertical: 28,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stack: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  hero: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
  },
  form: {
    width: '100%',
    maxWidth: 520,
    gap: 12,
    alignItems: 'stretch',
  },
  input: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
  },
  inputWithIcon: {
    paddingRight: 44,
  },
  inputWrapper: {
    width: '100%',
    position: 'relative',
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 10,
    marginTop: 4,
  },
  circleBox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  circleBoxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxMark: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  policyText: {
    color: colors.textMuted,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: colors.accent,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    width: '100%',
    borderColor: colors.border,
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: '600',
  },
  error: {
    color: colors.danger,
    alignSelf: 'flex-start',
  },
  inputIcon: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -9 }],
  },
  iconButton: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -14 }],
    padding: 6,
  },
});
