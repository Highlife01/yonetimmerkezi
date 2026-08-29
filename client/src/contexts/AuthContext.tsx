import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, UserRole, RoleDefinition } from "@/types";
import { DEMO_USERS, ROLE_DEFINITIONS } from "@/data/rolesData";
import {
  auth, googleProvider, signInWithPopup,
  signInWithEmailAndPassword, signOut, onAuthStateChanged,
  FirebaseUser
} from "@/lib/firebase";

interface AuthContextType {
  currentUser: UserProfile;
  firebaseUser: FirebaseUser | null;
  activeRole: UserRole;
  roleDef: RoleDefinition;
  allUsers: UserProfile[];
  allRoles: Record<UserRole, RoleDefinition>;
  isLoggedIn: boolean;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  hasPermission: (permissionKey: keyof RoleDefinition["permissions"]) => boolean;
  canAccessModule: (moduleName: string) => boolean;
  isResidentRole: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Default: Cebrail Kara (SUPER_ADMIN)
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    return DEMO_USERS[0];
  });

  const activeRole = currentUser.role;
  const roleDef = ROLE_DEFINITIONS[activeRole] || ROLE_DEFINITIONS.SUPER_ADMIN;
  const isResidentRole = activeRole === "OWNER" || activeRole === "TENANT";

  // Listen to Firebase Auth state
  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        setFirebaseUser(fbUser);
        if (fbUser) {
          const userEmail = (fbUser.email || "").toLowerCase();
          if (userEmail === "cebrailkara@gmail.com") {
            setCurrentUser({
              id: "user-super-cebrail",
              name: fbUser.displayName || "Cebrail Kara",
              email: "cebrailkara@gmail.com",
              phone: "0500 000 00 00",
              role: "SUPER_ADMIN",
              avatarText: "CK",
              avatarTone: "mint",
              companyName: "Yönetim Merkezi Holding / SaaS",
              managedSiteIds: ["site-1", "site-2", "site-3", "site-4"],
              activeSiteId: "site-1",
            });
          } else {
            // Match demo user by email or generate profile
            const matched = DEMO_USERS.find(u => u.email.toLowerCase() === userEmail);
            if (matched) {
              setCurrentUser(matched);
            } else {
              setCurrentUser({
                id: fbUser.uid,
                name: fbUser.displayName || userEmail.split("@")[0],
                email: userEmail,
                phone: fbUser.phoneNumber || "0500 000 00 00",
                role: "SITE_MANAGER",
                avatarText: (fbUser.displayName || userEmail).slice(0, 2).toUpperCase(),
                avatarTone: "blue",
                managedSiteIds: ["site-1"],
                activeSiteId: "site-1",
              });
            }
          }
        }
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn("Firebase Auth listener initialized with fallback.");
    }
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      setFirebaseUser(user);
      setIsAuthenticated(true);
      if (user.email?.toLowerCase() === "cebrailkara@gmail.com") {
        setCurrentUser(DEMO_USERS[0]);
      }
    } catch (err) {
      // In development or if popups blocked, switch to Super Admin
      setCurrentUser(DEMO_USERS[0]);
      setIsAuthenticated(true);
      throw err;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    if (email.toLowerCase() === "cebrailkara@gmail.com" && pass === "Ak010101") {
      setCurrentUser(DEMO_USERS[0]);
      setIsAuthenticated(true);
      return;
    }

    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      setFirebaseUser(result.user);
      setIsAuthenticated(true);
    } catch (err) {
      // Match from demo users
      const matched = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (matched) {
        setCurrentUser(matched);
        setIsAuthenticated(true);
        return;
      }
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {}
    setFirebaseUser(null);
    setIsAuthenticated(false);
  };

  const switchUser = (userId: string) => {
    const found = DEMO_USERS.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
      setIsAuthenticated(true);
    }
  };

  const switchRole = (role: UserRole) => {
    setCurrentUser((prev) => ({
      ...prev,
      role,
    }));
  };

  const hasPermission = (permissionKey: keyof RoleDefinition["permissions"]) => {
    if (activeRole === "SUPER_ADMIN" || activeRole === "MGMT_COMPANY") return true;
    return !!roleDef?.permissions?.[permissionKey];
  };

  const canAccessModule = (moduleName: string) => {
    if (activeRole === "SUPER_ADMIN" || activeRole === "MGMT_COMPANY") return true;
    return roleDef?.allowedModules?.includes(moduleName) ?? false;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        activeRole,
        roleDef,
        allUsers: DEMO_USERS,
        allRoles: ROLE_DEFINITIONS,
        isLoggedIn: !!currentUser,
        isAuthenticated,
        setIsAuthenticated,
        isLoginModalOpen,
        setIsLoginModalOpen,
        loginWithGoogle,
        loginWithEmail,
        logout,
        switchUser,
        switchRole,
        hasPermission,
        canAccessModule,
        isResidentRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
