import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { CompleteProfileScreen } from "../screens/CompleteProfileScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { OTPScreen } from "../screens/OTPScreen";
import { ReligionSelectScreen } from "../screens/ReligionSelectScreen";
import { SignUpScreen } from "../screens/SignUpScreen";
import { SplashScreen } from "../screens/SplashScreen";
import { useAuth } from "../context/AuthContext";

export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  SignUp: undefined;
  OTP: { phone: string; type: "login" | "signup"; userData?: any };
  CompleteProfile: { role: "seeker" };
  ReligionSelect: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => {
  const { isLoggedIn } = useAuth();

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
          <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
          <Stack.Screen name="ReligionSelect" component={ReligionSelectScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};
