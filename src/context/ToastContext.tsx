import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CheckCircle,
  Info,
  WarningCircle,
  XCircle,
} from 'phosphor-react-native';
import { colors } from '../theme/colors';
import { useThemeMode } from './ThemeContext';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

type ToastOptions = {
  title?: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastInternal = Required<ToastOptions> & {
  id: string;
};

type ToastContextValue = {
  showToast: (options: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const DEFAULT_DURATION = 3500;
const MAX_VISIBLE = 3;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastInternal[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((options: ToastOptions) => {
    if (!options.message) return;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const toast: ToastInternal = {
      id,
      title: options.title ?? '',
      message: options.message,
      variant: options.variant ?? 'info',
      duration: options.duration ?? DEFAULT_DURATION,
    };
    setToasts(prev => {
      const next = [...prev, toast];
      if (next.length > MAX_VISIBLE) {
        next.shift();
      }
      return next;
    });
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      showToast,
    }),
    [showToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastHost toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

type ToastStyles = ReturnType<typeof createStyles>;

type ToastHostProps = {
  toasts: ToastInternal[];
  onRemove: (id: string) => void;
};

const getVariantTokens = (palette: typeof colors) =>
  ({
    success: {
      Icon: CheckCircle,
      iconColor: palette.success,
      accent: palette.successSoft,
      textColor: palette.text,
    },
    error: {
      Icon: XCircle,
      iconColor: palette.danger,
      accent: palette.dangerSoft,
      textColor: palette.text,
    },
    warning: {
      Icon: WarningCircle,
      iconColor: palette.warning,
      accent: palette.warningSoft,
      textColor: palette.text,
    },
    info: {
      Icon: Info,
      iconColor: palette.primary,
      accent: palette.primarySoft,
      textColor: palette.text,
    },
  }) as const;

function ToastHost({ toasts, onRemove }: ToastHostProps) {
  const insets = useSafeAreaInsets();
  const { colors: themeColors } = useThemeMode();
  const styles = React.useMemo(() => createStyles(themeColors), [themeColors]);
  const variantTokens = React.useMemo(
    () => getVariantTokens(themeColors),
    [themeColors],
  );
  return (
    <View
      pointerEvents="box-none"
      style={[styles.host, { top: insets.top + 16 }]}
    >
      {toasts.map((toast, index) => (
        <ToastCard
          key={toast.id}
          toast={toast}
          onRemove={onRemove}
          index={index}
          styles={styles}
          variantTokens={variantTokens}
        />
      ))}
    </View>
  );
}

type ToastCardProps = {
  toast: ToastInternal;
  onRemove: (id: string) => void;
  index: number;
  styles: ToastStyles;
  variantTokens: ReturnType<typeof getVariantTokens>;
};

function ToastCard({
  toast,
  onRemove,
  index,
  styles,
  variantTokens,
}: ToastCardProps) {
  const translateY = useRef(new Animated.Value(-20)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -20,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onRemove(toast.id));
  }, [opacity, translateY, toast.id, onRemove]);

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        delay: index * 70,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        speed: 18,
        bounciness: 8,
      }),
    ]).start();
    const timer = setTimeout(hideToast, toast.duration);
    return () => {
      clearTimeout(timer);
    };
  }, [hideToast, opacity, translateY, toast.duration, index]);

  const { Icon, iconColor, accent, textColor } =
    variantTokens[toast.variant];

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.toast,
        index !== 0 && styles.toastSpacing,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: accent }]}>
        <Icon size={20} color={iconColor} weight="bold" />
      </View>
      <View style={styles.textContent}>
        {toast.title ? (
          <Text style={[styles.title, { color: textColor }]}>{toast.title}</Text>
        ) : null}
        <Text style={[styles.message, { color: textColor }]}>
          {toast.message}
        </Text>
      </View>
      <TouchableOpacity
        accessibilityLabel="Dismiss toast"
        style={styles.closeHitbox}
        onPress={hideToast}
      >
        <Text style={styles.closeText}>×</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function createStyles(palette: typeof colors) {
  return StyleSheet.create({
    host: {
      position: 'absolute',
      left: 0,
      right: 0,
      paddingHorizontal: 16,
      zIndex: 999,
    },
    toast: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 14,
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.border,
      paddingVertical: 12,
      paddingHorizontal: 14,
      shadowColor: palette.shadow,
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
    },
    toastSpacing: {
      marginTop: 12,
    },
    iconWrap: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    textContent: {
      flex: 1,
    },
    title: {
      fontSize: 14,
      fontWeight: '700',
      marginBottom: 2,
    },
    message: {
      fontSize: 13,
      color: palette.textMuted,
    },
    closeHitbox: {
      padding: 6,
      marginLeft: 6,
    },
    closeText: {
      fontSize: 18,
      color: palette.textMuted,
      fontWeight: '700',
    },
  });
}
