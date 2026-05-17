import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SplashScreen } from '../screens/onboarding/SplashScreen';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { OAuthScreen } from '../screens/onboarding/OAuthScreen';
import { ChooseRoleScreen } from '../screens/onboarding/ChooseRoleScreen';
import { SignUpScreen } from '../screens/onboarding/SignUpScreen';
import { OTPScreen } from '../screens/onboarding/OTPScreen';
import { CardRevealScreen } from '../screens/onboarding/CardRevealScreen';
import {
  PermNotifScreen,
  PermLocationScreen,
  PermWalletScreen,
} from '../screens/onboarding/PermissionsScreen';

export type OnboardingStackParams = {
  Splash: undefined;
  Onboarding: undefined;
  OAuth: undefined;
  ChooseRole: undefined;
  SignUp: undefined;
  OTP: { phone: string };
  CardReveal: undefined;
  PermNotif: undefined;
  PermLocation: undefined;
  PermWallet: undefined;
};

const Stack = createStackNavigator<OnboardingStackParams>();

export function OnboardingNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false, gestureEnabled: true }}
    >
      <Stack.Screen name="Splash" component={SplashWrapper} />
      <Stack.Screen
        name="Onboarding"
        component={OnboardingWrapper}
        options={{ animationTypeForReplace: 'push' }}
      />
      <Stack.Screen name="OAuth" component={OAuthWrapper} />
      <Stack.Screen name="ChooseRole" component={ChooseRoleWrapper} />
      <Stack.Screen name="SignUp" component={SignUpWrapper} />
      <Stack.Screen name="OTP" component={OTPWrapper} />
      <Stack.Screen name="CardReveal" component={CardRevealWrapper} />
      <Stack.Screen name="PermNotif" component={PermNotifWrapper} />
      <Stack.Screen name="PermLocation" component={PermLocationWrapper} />
      <Stack.Screen name="PermWallet" component={PermWalletWrapper} />
    </Stack.Navigator>
  );
}

// ── Screen wrappers (inject navigation props) ─────────────────────────────

function SplashWrapper({ navigation }: any) {
  return (
    <SplashScreen
      onGetStarted={() => navigation.navigate('Onboarding')}
      onSignIn={() => navigation.navigate('OAuth')}
    />
  );
}

function OnboardingWrapper({ navigation }: any) {
  return (
    <OnboardingScreen
      onFinish={() => navigation.navigate('OAuth')}
    />
  );
}

function OAuthWrapper({ navigation }: any) {
  return (
    <OAuthScreen
      onApple={() => navigation.navigate('ChooseRole')}
      onGoogle={() => navigation.navigate('ChooseRole')}
      onEmail={() => navigation.navigate('ChooseRole')}
    />
  );
}

function ChooseRoleWrapper({ navigation }: any) {
  return (
    <ChooseRoleScreen
      onContinue={() => navigation.navigate('SignUp')}
    />
  );
}

function SignUpWrapper({ navigation }: any) {
  return (
    <SignUpScreen
      onBack={() => navigation.goBack()}
      onContinue={({ phone }) =>
        navigation.navigate('OTP', { phone: `+61 ${phone}` })
      }
      onApple={() => navigation.navigate('ChooseRole')}
      onGoogle={() => navigation.navigate('ChooseRole')}
    />
  );
}

function OTPWrapper({ navigation, route }: any) {
  return (
    <OTPScreen
      phone={route.params?.phone}
      onBack={() => navigation.goBack()}
      onVerify={() => navigation.navigate('CardReveal')}
      onResend={() => {}}
      onChangeNumber={() => navigation.goBack()}
    />
  );
}

function CardRevealWrapper({ navigation }: any) {
  return (
    <CardRevealScreen
      onAddAppleWallet={() => {}}
      onAddGoogleWallet={() => {}}
      onOpenCard={() => navigation.navigate('PermNotif')}
    />
  );
}

function PermNotifWrapper({ navigation }: any) {
  return (
    <PermNotifScreen
      onAllow={() => navigation.navigate('PermLocation')}
      onSkip={() => navigation.navigate('PermLocation')}
    />
  );
}

function PermLocationWrapper({ navigation }: any) {
  return (
    <PermLocationScreen
      onAllow={() => navigation.navigate('PermWallet')}
      onSkip={() => navigation.navigate('PermWallet')}
    />
  );
}

function PermWalletWrapper({ navigation }: any) {
  // After permissions → would go to main app (placeholder for now)
  return (
    <PermWalletScreen
      onAllow={() => {}}
      onSkip={() => {}}
    />
  );
}
