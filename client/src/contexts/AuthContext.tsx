import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, UserRole, RoleDefinition } from "@/types";
import { DEMO_USERS, ROLE_DEFINITIONS } from "@/data/rolesData";

interface AuthContextType {
  currentUser: UserProfile;
  activeRole: UserRole;
  roleDef: RoleDefinition;
  allUsers: UserProfile[];
  allRoles: Record<UserRole, RoleDefinition>;
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  hasPermission: (permissionKey: keyof RoleDefinition["permissions"]) => boolean;
  canAccessModule: (moduleName: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("ym_current_user");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEMO_USERS[0]; // Default: Elif Arslan (MGMT_COMPANY)
  });

  const activeRole = currentUser.role;
  const roleDef = ROLE_DEFINITIONS[activeRole] || ROLE_DEFINITIONS.SITE_MANAGER;

  useEffect(() => {
    localStorage.setItem("ym_current_user", JSON.stringify(currentUser));
  }, [currentUser]);

  const switchUser = (userId: string) => {
    const found = DEMO_USERS.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
    }
  };

  const switchRole = (role: UserRole) => {
    setCurrentUser((prev) => ({
      ...prev,
      role,
    }));
  };

  const hasPermission = (permissionKey: keyof RoleDefinition["permissions"]) => {
    return !!roleDef?.permissions?.[permissionKey];
  };

  const canAccessModule = (moduleName: string) => {
    if (activeRole === "SUPER_ADMIN") return true;
    return roleDef?.allowedModules?.includes(moduleName) ?? false;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        activeRole,
        roleDef,
        allUsers: DEMO_USERS,
        allRoles: ROLE_DEFINITIONS,
        switchUser,
        switchRole,
        hasPermission,
        canAccessModule,
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
