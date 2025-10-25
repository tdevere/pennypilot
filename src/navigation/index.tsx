import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, MainTabsParamList } from '../types';

// Screens
import TransactionsScreen from '../screens/TransactionsScreen';
import GoalsScreen from '../screens/GoalsScreen';
import RecurringTransactionsScreen from '../screens/RecurringTransactionsScreen';
import ReportsScreen from '../screens/ReportsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import EditTransactionScreen from '../screens/EditTransactionScreen';
import AddRecurringTransactionScreen from '../screens/AddRecurringTransactionScreen';
import AddGoalScreen from '../screens/AddGoalScreen';
import ScanReceiptScreen from '../screens/ScanReceiptScreen';
import LineItemsScreen from '../screens/LineItemsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabsParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'help-circle';

          if (route.name === 'Transactions') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Goals') {
            iconName = focused ? 'flag' : 'flag-outline';
          } else if (route.name === 'Recurring') {
            iconName = focused ? 'repeat' : 'repeat-outline';
          } else if (route.name === 'Reports') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Goals" component={GoalsScreen} />
      <Tab.Screen name="Recurring" component={RecurringTransactionsScreen} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabs} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="AddTransaction" 
          component={AddTransactionScreen}
          options={{ 
            presentation: 'modal',
            title: 'Add Transaction'
          }}
        />
        <Stack.Screen 
          name="EditTransaction" 
          component={EditTransactionScreen}
          options={{ 
            presentation: 'modal',
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="AddGoal" 
          component={AddGoalScreen}
          options={{ 
            presentation: 'modal',
            title: 'Add Goal'
          }}
        />
        <Stack.Screen 
          name="AddRecurringTransaction" 
          component={AddRecurringTransactionScreen}
          options={{ 
            presentation: 'modal',
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="EditRecurringTransaction" 
          component={AddRecurringTransactionScreen}
          options={{ 
            presentation: 'modal',
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="ScanReceipt" 
          component={ScanReceiptScreen}
          options={{ 
            presentation: 'modal',
            title: 'Scan Receipt'
          }}
        />
        <Stack.Screen 
          name="LineItems" 
          component={LineItemsScreen}
          options={{ 
            title: 'Line Items'
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
