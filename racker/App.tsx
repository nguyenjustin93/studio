import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import PreSessionScreen from './src/screens/PreSessionScreen';
import ActiveSessionScreen from './src/screens/ActiveSessionScreen';
import PostSessionScreen from './src/screens/PostSessionScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import { Session } from './src/types';
import { colors } from './src/theme';

export type SessionStackParamList = {
  PreSession: undefined;
  ActiveSession: { session: Session };
  PostSession: { session: Session };
};

export type TabParamList = {
  Session: undefined;
  History: undefined;
};

const Stack = createNativeStackNavigator<SessionStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function SessionStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="PreSession" component={PreSessionScreen} />
      <Stack.Screen
        name="ActiveSession"
        component={ActiveSessionScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="PostSession"
        component={PostSessionScreen}
        options={{ gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: '#0a1f14',
              borderTopColor: '#1a3d26',
              borderTopWidth: 1,
              paddingTop: 6,
              paddingBottom: 6,
              height: 62,
            },
            tabBarActiveTintColor: '#40916C',
            tabBarInactiveTintColor: '#3d6b52',
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '600',
              letterSpacing: 0.5,
              marginTop: 2,
            },
          }}
        >
          <Tab.Screen
            name="Session"
            component={SessionStack}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons
                  name="bullseye-arrow"
                  size={size}
                  color={color}
                />
              ),
            }}
          />
          <Tab.Screen
            name="History"
            component={HistoryScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Feather name="clock" size={size} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
