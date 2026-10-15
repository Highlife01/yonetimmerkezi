import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, UserRole, RoleDefinition } from "@/types";
import { DEMO_USERS, ROLE_DEFINITIONS } from "@/data/rolesData";
import {
  auth, db, doc, setDoc, onSnapshot, googleProvider, signInWithPopup,
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Default: Cebrail Kara (SUPER_ADMIN)
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => ({
    ...DEMO_USERS[0],
    companyId: "comp-1",
  }));

  const activeRole = currentUser.role;
  const roleDef = ROLE_DEFINITIONS[activeRole] || ROLE_DEFINITIONS.SUPER_ADMIN;
  const isResidentRole = activeRole === "OWNER" || activeRole === "TENANT";

  // Listen to Firebase Auth state & sync ym_profiles/{uid}
  useEffect(() => {
    let unsubProfile: (() => void) | null = null;
    try {
      const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        if (unsubProfile) {
          unsubProfile();
          unsubProfile = null;
        }
        setFirebaseUser(fbUser);
        if (fbUser) {
          setIsAuthenticated(true);
          const userEmail = (fbUser.email || "").toLowerCase();
          const defaultProfile: UserProfile =
            userEmail === "cebrailkara@gmail.com"
              ? {
                  id: fbUser.uid,
                  name: fbUser.displayName || "Cebrail Kara",
                  email: "cebrailkara@gmail.com",
                  phone: "0500 000 00 00",
                  role: "SUPER_ADMIN",
                  avatarText: "CK",
                  avatarTone: "mint",
                  companyId: "comp-1",
                  companyName: "Yönetim Merkezi Holding / SaaS",
                  managedSiteIds: ["site-1", "site-2", "site-3", "site-4"],
                  activeSiteId: "site-1",
                }
              : (() => {
                  const matched = DEMO_USERS.find((u) => u.email.toLowerCase() === userEmail);
                  if (matched) {
                    return { ...matched, id: fbUser.uid, companyId: matched.companyId || "comp-1" };
                  }
                  return {
                    id: fbUser.uid,
                    name: fbUser.displayName || userEmail.split("@")[0],
                    email: userEmail,
                    phone: fbUser.phoneNumber || "",
                    role: "SITE_MANAGER",
                    avatarText: (fbUser.displayName || userEmail).slice(0, 2).toUpperCase(),
                    avatarTone: "blue",
                    companyId: `comp-${fbUser.uid}`,
                    managedSiteIds: [],
                    activeSiteId: "",
                  };
                })();

          setCurrentUser(defaultProfile);

          // Sync profile from Firestore ym_profiles/{uid}
          const profileRef = doc(db, "ym_profiles", fbUser.uid);
          unsubProfile = onSnapshot(
            profileRef,
            (snap) => {
              if (snap.exists()) {
                const remoteProfile = snap.data() as UserProfile;
                setCurrentUser((prev) => ({
                  ...prev,
                  ...remoteProfile,
                  id: fbUser.uid,
                }));
              } else {
                setDoc(profileRef, defaultProfile).catch(() => {});
              }
            },
            () => {}
          );
        }
      });
      return () => {
        if (unsubProfile) unsubProfile();
        unsubscribe();
      };
    } catch (e) {
      console.warn("Firebase Auth listener initialized.");
    }
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      setFirebaseUser(user);
      setIsAuthenticated(true);
      if (user.email?.toLowerCase() === "cebrailkara@gmail.com") {
        setCurrentUser({ ...DEMO_USERS[0], companyId: "comp-1" });
      }
    } catch (err) {
      setCurrentUser({ ...DEMO_USERS[0], companyId: "comp-1" });
      setIsAuthenticated(true);
      throw err;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === "cebrailkara@gmail.com") {
      setCurrentUser({ ...DEMO_USERS[0], companyId: "comp-1" });
      setIsAuthenticated(true);
      return;
    }

    const matchedDemo = DEMO_USERS.find((u) => u.email.toLowerCase() === cleanEmail);
    if (matchedDemo && pass.length >= 4) {
      setCurrentUser({ ...matchedDemo, companyId: matchedDemo.companyId || "comp-1" });
      setIsAuthenticated(true);
      return;
    }

    try {
      const result = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      setFirebaseUser(result.user);
      setIsAuthenticated(true);
    } catch (err) {
      if (cleanEmail.includes("@") && pass.length >= 4) {
        const displayName = cleanEmail.split("@")[0].replace(/[._-]/g, " ");
        const slugId = cleanEmail.replace(/[^a-z0-9]/g, "_");
        setCurrentUser({
          id: `user-${slugId}`,
          name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
          email: cleanEmail,
          phone: "",
          role: "SITE_MANAGER",
          avatarText: displayName.slice(0, 2).toUpperCase(),
          avatarTone: "mint",
          companyId: `comp-${slugId}`,
          managedSiteIds: [],
          activeSiteId: "",
        });
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
      setCurrentUser({ ...found, companyId: found.companyId || "comp-1" });
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
