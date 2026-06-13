import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { CompleteProfileScreen } from "../screens/CompleteProfileScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { OTPScreen } from "../screens/OTPScreen";
import { ReligionSelectScreen } from "../screens/ReligionSelectScreen";
import { RoleSelectScreen } from "../screens/RoleSelectScreen";
import { SignUpScreen } from "../screens/SignUpScreen";
import { SplashScreen } from "../screens/SplashScreen";
import { ProviderTypeSelectScreen } from "../screens/ProviderTypeSelectScreen";
import { ProviderReligionSelectScreen } from "../screens/ProviderReligionSelectScreen";
import { ProviderCompleteProfileScreen } from "../screens/ProviderCompleteProfileScreen";
import { PendingVerificationScreen } from "../screens/PendingVerificationScreen";
import { useAuth } from "../context/AuthContext";
import { useUser } from "../context/UserContext";

export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  SignUp: undefined;
  OTP: { phone: string; type: "login" | "signup"; userData?: any };
  RoleSelect: undefined;
  CompleteProfile: { role: "seeker" | "astrologer" };
  ReligionSelect: undefined;
  ProviderTypeSelect: undefined;
  ProviderReligionSelect: undefined;
  ProviderCompleteProfile: undefined;
  PendingVerification: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => {
  const { isLoggedIn } = useAuth();
  const { userRole, isProviderPending } = useUser();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "default",
        contentStyle: { backgroundColor: "#FFF" },
      }}
    >
      {!isLoggedIn ? (
        <>
          <Stack.Screen
            name="Splash"
            component={SplashScreen}
            options={{ animation: "none" }}
          />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="OTP" component={OTPScreen} />
        </>
      ) : (
        <>
          {!userRole ? (
            <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
          ) : userRole === "seeker" ? (
            <>
              <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
              <Stack.Screen name="ReligionSelect" component={ReligionSelectScreen} />
            </>
          ) : isProviderPending ? (
            <Stack.Screen name="PendingVerification" component={PendingVerificationScreen} />
          ) : (
            <>
              <Stack.Screen name="ProviderTypeSelect" component={ProviderTypeSelectScreen} />
              <Stack.Screen name="ProviderReligionSelect" component={ProviderReligionSelectScreen} />
              <Stack.Screen name="ProviderCompleteProfile" component={ProviderCompleteProfileScreen} />
              <Stack.Screen name="PendingVerification" component={PendingVerificationScreen} />
            </>
          )}
        </>
      )}
    </Stack.Navigator>
  );
};
