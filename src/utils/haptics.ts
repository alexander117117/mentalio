import * as Haptics from 'expo-haptics';

// Лёгкий тап — переключение вкладок, сегментов, тоглов
export const tapLight = () =>
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// Средний — нажатие кнопок
export const tapMedium = () =>
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

// Тяжёлый — важные действия (создать, удалить)
export const tapHeavy = () =>
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

// Успех — сохранение, подтверждение
export const notifySuccess = () =>
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
