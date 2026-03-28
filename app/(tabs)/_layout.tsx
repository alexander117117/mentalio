import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/theme';
import { tapLight } from '../../src/utils/haptics';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const TABS: { name: string; title: string; icon: IconName; activeIcon: IconName }[] = [
  { name: 'index',         title: 'Главная',       icon: 'home-outline',          activeIcon: 'home'          },
  { name: 'chats',         title: 'Чаты',          icon: 'chatbubble-outline',    activeIcon: 'chatbubble'    },
  { name: 'notifications', title: 'Уведомления',   icon: 'notifications-outline', activeIcon: 'notifications' },
  { name: 'profile',       title: 'Профиль',       icon: 'person-outline',        activeIcon: 'person'        },
];

const HIDDEN = ['communities', 'classrooms', 'live', 'dashboard'];

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.text.primary,
        tabBarInactiveTintColor: Colors.text.disabled,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          paddingBottom: 4,
          height: 58,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: -2,
        },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? tab.activeIcon : tab.icon}
                size={22}
                color={color}
              />
            ),
          }}
          listeners={{ tabPress: () => tapLight() }}
        />
      ))}
      {HIDDEN.map((name) => (
        <Tabs.Screen key={name} name={name} options={{ href: null }} />
      ))}
    </Tabs>
  );
}
