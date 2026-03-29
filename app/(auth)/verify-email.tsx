import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';
import { notifySuccess, tapLight } from '../../src/utils/haptics';

const CODE_LENGTH = 6;

export default function VerifyEmailScreen() {
  const { email, name } = useLocalSearchParams<{ email: string; name: string }>();
  const verifyOtp = useAuthStore((s) => s.verifyOtp);

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleChange = async (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    setError(null);

    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (digit && index === CODE_LENGTH - 1) {
      const full = newCode.join('');
      if (full.length === CODE_LENGTH && !newCode.includes('')) {
        await verify(full);
      }
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace') {
      if (!code[index] && index > 0) {
        const newCode = [...code];
        newCode[index - 1] = '';
        setCode(newCode);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const verify = async (fullCode: string) => {
    tapLight();
    setLoading(true);
    setError(null);
    const { error: err } = await verifyOtp(email, fullCode);
    setLoading(false);
    if (err) {
      setError('Неверный или истёкший код. Попробуйте ещё раз.');
      setCode(Array(CODE_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } else {
      notifySuccess();
      router.replace({ pathname: '/onboarding' as any, params: { name } });
    }
  };

  const handleResend = async () => {
    tapLight();
    setResent(true);
    setError(null);
    setCode(Array(CODE_LENGTH).fill(''));
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  const filled = code.filter(Boolean).length;
  const canVerify = filled === CODE_LENGTH && !loading;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.inner}>
          {/* Back */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/register' as any)}>
            <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
          </TouchableOpacity>

          {/* Icon */}
          <View style={styles.iconWrap}>
            <Ionicons name="mail" size={32} color={Colors.text.primary} />
          </View>

          {/* Title */}
          <Text style={styles.title}>Проверьте почту</Text>
          <Text style={styles.subtitle}>
            Мы отправили 6-значный код на{'\n'}
            <Text style={styles.emailText}>{email}</Text>
          </Text>

          {/* OTP cells */}
          <View style={styles.cellsRow}>
            {Array(CODE_LENGTH).fill(null).map((_, i) => (
              <TextInput
                key={i}
                ref={(r) => { inputRefs.current[i] = r; }}
                style={[
                  styles.cell,
                  code[i] ? styles.cellFilled : null,
                  error ? styles.cellError : null,
                ]}
                value={code[i]}
                onChangeText={(t) => handleChange(t, i)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                keyboardType="number-pad"
                maxLength={2}
                selectTextOnFocus
                autoFocus={i === 0}
                editable={!loading}
              />
            ))}
          </View>

          {/* Error */}
          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={15} color={Colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Submit button (manual fallback) */}
          {canVerify && (
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={() => verify(code.join(''))}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.submitBtnText}>Подтвердить</Text>
              }
            </TouchableOpacity>
          )}

          {loading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={Colors.text.disabled} size="small" />
              <Text style={styles.loadingText}>Проверяем код...</Text>
            </View>
          )}

          {/* Resend */}
          <View style={styles.resendRow}>
            <Text style={styles.resendHint}>Не получили письмо?</Text>
            <TouchableOpacity onPress={handleResend} disabled={resent}>
              <Text style={[styles.resendLink, resent && styles.resendLinkDone]}>
                {resent ? 'Отправлено' : 'Отправить снова'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Supabase note */}
          <View style={styles.noteBox}>
            <Ionicons name="information-circle-outline" size={14} color={Colors.text.disabled} />
            <Text style={styles.noteText}>
              Если письмо не пришло, проверьте папку «Спам». Письмо содержит 6-значный код.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const CELL_SIZE = 52;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  inner: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },

  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl },

  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },

  title: { fontSize: 26, fontWeight: '700', color: Colors.text.primary, letterSpacing: -0.5, marginBottom: 8 },
  subtitle: { ...Typography.body, color: Colors.text.secondary, lineHeight: 24, marginBottom: Spacing.xl + 4 },
  emailText: { fontWeight: '600', color: Colors.text.primary },

  cellsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: Spacing.lg,
  },
  cell: {
    flex: 1,
    height: CELL_SIZE,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  cellFilled: {
    borderColor: Colors.text.primary,
    backgroundColor: Colors.surface,
  },
  cellError: {
    borderColor: Colors.error,
    backgroundColor: '#FEF2F2',
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#FEF2F2',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  errorText: { fontSize: 13, color: Colors.error, flex: 1 },

  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  submitBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },

  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
  },
  loadingText: { fontSize: 14, color: Colors.text.disabled },

  resendRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: Spacing.lg },
  resendHint: { ...Typography.body, color: Colors.text.secondary },
  resendLink: { ...Typography.body, color: Colors.primary, fontWeight: '600' },
  resendLinkDone: { color: Colors.success },

  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  noteText: { fontSize: 12, color: Colors.text.disabled, flex: 1, lineHeight: 18 },
});
