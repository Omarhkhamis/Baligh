export const ADMIN_ROLES = ['SUPER_ADMIN', 'ANALYST', 'EDITOR', 'VIEWER'] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];
export type PermissionResource = 'news' | 'studies' | 'reports' | 'team';
export type PermissionAction = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const editorPermissions: Record<PermissionResource, ReadonlySet<PermissionAction>> = {
    news: new Set(['GET', 'POST', 'PUT', 'PATCH']),
    studies: new Set(['GET', 'POST', 'PUT', 'PATCH']),
    reports: new Set([]),
    team: new Set([]),
};

const analystPermissions: Record<PermissionResource, ReadonlySet<PermissionAction>> = {
    news: new Set(['GET']),
    studies: new Set(['GET']),
    reports: new Set(['GET', 'PUT', 'PATCH']),
    team: new Set([]),
};

const viewerPermissions: Record<PermissionResource, ReadonlySet<PermissionAction>> = {
    news: new Set([]),
    studies: new Set([]),
    reports: new Set([]),
    team: new Set([]),
};

function normalizeAction(action: PermissionAction): PermissionAction {
    return action === 'PUT' ? 'PATCH' : action;
}

export function isAdminRole(value: unknown): value is AdminRole {
    return typeof value === 'string' && ADMIN_ROLES.includes(value as AdminRole);
}

export function verifyPermission(
    userRole: AdminRole,
    resource: PermissionResource,
    action: PermissionAction
): boolean {
    if (userRole === 'SUPER_ADMIN') {
        return true;
    }

    const permissionMap =
        userRole === 'ANALYST'
            ? analystPermissions
            : userRole === 'VIEWER'
                ? viewerPermissions
                : editorPermissions;
    return permissionMap[resource].has(normalizeAction(action));
}

export function formatRoleLabel(role: AdminRole): string {
    if (role === 'SUPER_ADMIN') {
        return 'Super Admin';
    }
    if (role === 'ANALYST') {
        return 'Analyst';
    }
    if (role === 'VIEWER') {
        return 'Viewer';
    }
    return 'Editor';
}
