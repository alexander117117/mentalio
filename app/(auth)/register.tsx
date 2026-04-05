import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState } from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';
import { ArrowLeft, AppleLogo, User, Envelope, Lock, Eye, EyeSlash, WarningCircle } from 'phosphor-react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';
import { supabase } from '../../src/lib/supabase';
import { notifySuccess, tapLight } from '../../src/utils/haptics';

export default function RegisterScreen() {
  const signUp = useAuthStore((s) => s.signUp);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = name.trim().length > 0 && email.trim().length > 0 && password.length >= 6;

  const handleRegister = async () => {
    if (!isValid) return;
    tapLight();
    setError(null);
    setLoading(true);
    const { error: err } = await signUp(email.trim().toLowerCase(), password, name.trim());
    setLoading(false);
    if (err) {
      if (err.includes('already registered')) {
        setError('Этот email уже зарегистрирован');
      } else {
        setError(err);
      }
    } else {
      router.replace({ pathname: '/verify-email' as any, params: { email: email.trim().toLowerCase(), name: name.trim() } });
    }
  };

  const handleApple = async () => {
    try {
      setAppleLoading(true);
      setError(null);
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const { error: err } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken!,
      });
      if (err) throw err;
      notifySuccess();
      router.replace('/(tabs)' as any);
    } catch (e: any) {
      if (e?.code !== 'ERR_REQUEST_CANCELED') {
        setError('Не удалось войти через Apple');
      }
    } finally {
      setAppleLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={22} color={Colors.text.primary} weight="regular" />
          </TouchableOpacity>

          {/* Logo */}
          <View style={styles.logoWrap}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>M</Text>
            </View>
            <Text style={styles.appName}>Mentalio</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>Создать аккаунт</Text>
          <Text style={styles.subtitle}>Начните учиться и создавать курсы</Text>

          {/* Apple */}
          <TouchableOpacity
            style={styles.appleBtn}
            onPress={handleApple}
            activeOpacity={0.85}
            disabled={appleLoading}
          >
            {appleLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <AppleLogo size={20} color="#fff" weight="regular" />
                <Text style={styles.appleBtnText}>Продолжить с Apple</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>или</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Name */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Имя</Text>
            <View style={styles.inputWrap}>
              <User size={16} color={Colors.text.disabled} weight="regular" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ваше имя"
                placeholderTextColor={Colors.text.disabled}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email</Text>
            <View style={styles.inputWrap}>
              <Envelope size={16} color={Colors.text.disabled} weight="regular" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor={Colors.text.disabled}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Пароль</Text>
            <View style={styles.inputWrap}>
              <Lock size={16} color={Colors.text.disabled} weight="regular" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Минимум 6 символов"
                placeholderTextColor={Colors.text.disabled}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
                {showPassword
                  ? <EyeSlash size={18} color={Colors.text.disabled} weight="regular" />
                  : <Eye size={18} color={Colors.text.disabled} weight="regular" />
                }
              </TouchableOpacity>
            </View>
            {password.length > 0 && password.length < 6 && (
              <Text style={styles.fieldHint}>Минимум 6 символов</Text>
            )}
          </View>

          {/* Error */}
          {error && (
            <View style={styles.errorBox}>
              <WarningCircle size={15} color={Colors.error} weight="regular" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, (!isValid || loading) && styles.submitBtnDisabled]}
            onPress={handleRegister}
            activeOpacity={0.85}
            disabled={!isValid || loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.submitBtnText}>Зарегистрироваться</Text>
            }
          </TouchableOpacity>

          {/* Terms */}
          <Text style={styles.terms}>
            Регистрируясь, вы соглашаетесь с{' '}
            <Text style={styles.termsLink}>условиями использования</Text>
          </Text>

          {/* Switch to login */}
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Уже есть аккаунт?</Text>
            <TouchableOpacity onPress={() => router.replace('/login' as any)}>
              <Text style={styles.switchLink}>Войти</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  scroll: { flexGrow: 1, padding: Spacing.lg, paddingTop: Spacing.md },

  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg },

  logoWrap: { alignItems: 'center', marginBottom: Spacing.xl },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  appName: { fontSize: 20, fontWeight: '700', color: Colors.text.primary, letterSpacing: -0.3 },

  title: { fontSize: 26, fontWeight: '700', color: Colors.text.primary, letterSpacing: -0.5, marginBottom: 6 },
  subtitle: { ...Typography.body, color: Colors.text.secondary, marginBottom: Spacing.xl },

  appleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#000',
    borderRadius: BorderRadius.lg,
    paddingVertical: 15,
    marginBottom: Spacing.lg,
  },
  appleBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },

  divider: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontSize: 13, color: Colors.text.disabled },

  field: { gap: 7, marginBottom: Spacing.md },
  fieldLabel: { fontSize: 13, fontWeight: '500', color: Colors.text.primary },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, ...Typography.body, color: Colors.text.primary, paddingVertical: 14, padding: 0 },
  eyeBtn: { padding: 4 },
  fieldHint: { fontSize: 11, color: Colors.text.disabled },

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
    marginTop: Spacing.sm,
  },
  submitBtnDisabled: { opacity: 0.45 },
  submitBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },

  terms: { fontSize: 12, color: Colors.text.disabled, textAlign: 'center', marginBottom: Spacing.lg, lineHeight: 18 },
  termsLink: { color: Colors.text.secondary, textDecorationLine: 'underline' },

  switchRow: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  switchText: { ...Typography.body, color: Colors.text.secondary },
  switchLink: { ...Typography.body, color: Colors.primary, fontWeight: '600' },

});
