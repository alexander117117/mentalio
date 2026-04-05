import { Tabs } from 'expo-router';
import { House, PlusCircle, ChatCircle, Bell, User } from 'phosphor-react-native';
import { Colors } from '../../src/constants/theme';
import { tapLight } from '../../src/utils/haptics';

const TABS: { name: string; title: string; Icon: React.ComponentType<any> }[] = [
  { name: 'index',         title: 'Главная',       Icon: House },
  { name: 'studio',        title: 'Курсы',         Icon: PlusCircle },
  { name: 'chats',         title: 'Чаты',          Icon: ChatCircle },
  { name: 'notifications', title: 'Уведомления',   Icon: Bell },
  { name: 'profile',       title: 'Профиль',       Icon: User },
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
              <tab.Icon size={22} color={color} weight={focused ? 'fill' : 'regular'} />
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
