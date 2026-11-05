export type RoleId = "admin" | "viewer";
export type Capability = "items.create" | "items.update";

/** What the console checks before it shows a control. The server must check again; this only shapes the UI. */
const GRANTS: Record<RoleId, Capability[]> = { admin: ["items.create", "items.update"], viewer: [] };

export const can = (role: RoleId, capability: Capability): boolean => GRANTS[role].includes(capability);
