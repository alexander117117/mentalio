import { View, ActivityIndicator } from 'react-native';
import { Colors } from '../src/constants/theme';

// This screen shows briefly while AppInitializer handles the auth redirect.
export default function Index() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface }}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}
