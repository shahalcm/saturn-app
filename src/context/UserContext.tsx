import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useEffect, useState } from "react";

export type UserProfile = {
  name: string;
  phone: string;
  email: string;
  dob: string;
  tob: string;
  pob: string;
  gender: "male" | "female" | "other";
  languages: string[];
  avatar?: string;
};

export type UserContextType = {
  religion: "muslim" | "hindu" | "christian" | null;
  profile: UserProfile | null;
  userRole: "seeker" | "provider" | null;
  providerType: "astrologer" | "doctor" | "teacher" | null;
  isProviderVerified: boolean;
  isProviderPending: boolean;
  isOnline: boolean;
  setReligion: (
    religion: "muslim" | "hindu" | "christian" | null,
  ) => Promise<void>;
  setProfile: (profile: UserProfile) => void;
  setUserRole: (role: "seeker" | "provider" | null) => Promise<void>;
  setProviderType: (type: "astrologer" | "doctor" | "teacher" | null) => Promise<void>;
  setProviderVerified: (bool: boolean) => Promise<void>;
  setProviderPending: (bool: boolean) => Promise<void>;
  setOnlineStatus: (bool: boolean) => Promise<void>;
  clearUser: () => Promise<void>;
};

export const UserContext = createContext<UserContextType | undefined>(
  undefined,
);

const DEFAULT_PROFILE: UserProfile = {
  name: "",
  phone: "",
  email: "",
  dob: "",
  tob: "",
  pob: "",
  gender: "male",
  languages: ["English"],
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [religion, setReligionState] = useState<
    "muslim" | "hindu" | "christian" | null
  >(null);
  const [profile, setProfileState] = useState<UserProfile>(DEFAULT_PROFILE);
  const [userRole, setUserRoleState] = useState<"seeker" | "provider" | null>(null);
  const [providerType, setProviderTypeState] = useState<"astrologer" | "doctor" | "teacher" | null>(null);
  const [isProviderVerified, setProviderVerifiedState] = useState<boolean>(false);
  const [isProviderPending, setProviderPendingState] = useState<boolean>(false);
  const [isOnline, setOnlineState] = useState<boolean>(true);

  // Initialize from AsyncStorage
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const savedReligion = await AsyncStorage.getItem("userReligion");
        const savedProfile = await AsyncStorage.getItem("userProfile");
        const savedRole = await AsyncStorage.getItem("userRole");
        const savedProviderType = await AsyncStorage.getItem("providerType");
        const savedVerified = await AsyncStorage.getItem("isProviderVerified");
        const savedPending = await AsyncStorage.getItem("isProviderPending");
        const savedOnline = await AsyncStorage.getItem("isOnline");

        if (savedReligion) {
          setReligionState(savedReligion as "muslim" | "hindu" | "christian");
        }

        if (savedProfile) {
          setProfileState(JSON.parse(savedProfile));
        }

        if (savedRole) {
          setUserRoleState(savedRole as "seeker" | "provider");
        }

        if (savedProviderType) {
          setProviderTypeState(savedProviderType as "astrologer" | "doctor" | "teacher");
        }

        if (savedVerified) {
          setProviderVerifiedState(savedVerified === "true");
        }

        if (savedPending) {
          setProviderPendingState(savedPending === "true");
        }

        if (savedOnline) {
          setOnlineState(savedOnline === "true");
        }
      } catch (error) {
        console.error("Error initializing user:", error);
      }
    };

    initializeUser();
  }, []);

  const setReligion = async (
    newReligion: "muslim" | "hindu" | "christian" | null,
  ) => {
    try {
      setReligionState(newReligion);
      if (newReligion) {
        await AsyncStorage.setItem("userReligion", newReligion);
      } else {
        await AsyncStorage.removeItem("userReligion");
      }
    } catch (error) {
      console.error("Error setting religion:", error);
      throw error;
    }
  };

  const setProfile = (newProfile: UserProfile) => {
    setProfileState(newProfile);
    // Don't persist immediately, let the screen handle that
  };

  const setUserRole = async (role: "seeker" | "provider" | null) => {
    try {
      setUserRoleState(role);
      if (role) {
        await AsyncStorage.setItem("userRole", role);
      } else {
        await AsyncStorage.removeItem("userRole");
      }
    } catch (error) {
      console.error("Error setting user role:", error);
      throw error;
    }
  };

  const setProviderType = async (type: "astrologer" | "doctor" | "teacher" | null) => {
    try {
      setProviderTypeState(type);
      if (type) {
        await AsyncStorage.setItem("providerType", type);
      } else {
        await AsyncStorage.removeItem("providerType");
      }
    } catch (error) {
      console.error("Error setting provider type:", error);
      throw error;
    }
  };

  const setProviderVerified = async (bool: boolean) => {
    try {
      setProviderVerifiedState(bool);
      await AsyncStorage.setItem("isProviderVerified", String(bool));
    } catch (error) {
      console.error("Error setting provider verified status:", error);
      throw error;
    }
  };

  const setProviderPending = async (bool: boolean) => {
    try {
      setProviderPendingState(bool);
      await AsyncStorage.setItem("isProviderPending", String(bool));
    } catch (error) {
      console.error("Error setting provider pending status:", error);
      throw error;
    }
  };

  const setOnlineStatus = async (bool: boolean) => {
    try {
      setOnlineState(bool);
      await AsyncStorage.setItem("isOnline", String(bool));
    } catch (error) {
      console.error("Error setting online status:", error);
      throw error;
    }
  };

  const clearUser = async () => {
    try {
      setReligionState(null);
      setProfileState(DEFAULT_PROFILE);
      setUserRoleState(null);
      setProviderTypeState(null);
      setProviderVerifiedState(false);
      setProviderPendingState(false);
      setOnlineState(true);
      await AsyncStorage.removeItem("userReligion");
      await AsyncStorage.removeItem("userProfile");
      await AsyncStorage.removeItem("userRole");
      await AsyncStorage.removeItem("providerType");
      await AsyncStorage.removeItem("isProviderVerified");
      await AsyncStorage.removeItem("isProviderPending");
      await AsyncStorage.removeItem("isOnline");
    } catch (error) {
      console.error("Error clearing user:", error);
      throw error;
    }
  };

  return (
    <UserContext.Provider
      value={{
        religion,
        profile,
        userRole,
        providerType,
        isProviderVerified,
        isProviderPending,
        isOnline,
        setReligion,
        setProfile,
        setUserRole,
        setProviderType,
        setProviderVerified,
        setProviderPending,
        setOnlineStatus,
        clearUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = React.useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
};
