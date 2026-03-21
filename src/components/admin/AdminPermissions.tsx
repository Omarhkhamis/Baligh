'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { verifyPermission, type AdminRole, type PermissionAction, type PermissionResource } from '@/lib/permissions';

const AdminPermissionsContext = createContext<AdminRole | null>(null);

export function AdminPermissionsProvider({
    role,
    children,
}: {
    role: AdminRole;
    children: ReactNode;
}) {
    return (
        <AdminPermissionsContext.Provider value={role}>
            {children}
        </AdminPermissionsContext.Provider>
    );
}

export function usePermissions() {
    const role = useContext(AdminPermissionsContext);

    if (!role) {
        throw new Error('usePermissions must be used within AdminPermissionsProvider');
    }

    return useMemo(
        () => ({
            role,
            isSuperAdmin: role === 'SUPER_ADMIN',
            hasRole: (allowed: AdminRole | AdminRole[]) =>
                Array.isArray(allowed) ? allowed.includes(role) : role === allowed,
            can: (resource: PermissionResource, action: PermissionAction) =>
                verifyPermission(role, resource, action),
        }),
        [role]
    );
}

export function RequireRole({
    role,
    children,
    fallback = null,
}: {
    role: AdminRole | AdminRole[];
    children: ReactNode;
    fallback?: ReactNode;
}) {
    const { hasRole } = usePermissions();
    return hasRole(role) ? <>{children}</> : <>{fallback}</>;
}

export function RequirePermission({
    resource,
    action,
    children,
    fallback = null,
}: {
    resource: PermissionResource;
    action: PermissionAction;
    children: ReactNode;
    fallback?: ReactNode;
}) {
    const { can } = usePermissions();
    return can(resource, action) ? <>{children}</> : <>{fallback}</>;
}
