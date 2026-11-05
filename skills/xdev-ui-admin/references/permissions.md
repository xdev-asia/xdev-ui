# Permissions

The UI shapes what a role sees; the server must check every request again.

```ts
export type Capability = "users.create" | "users.update" | "users.delete" | "roles.update" | "settings.update" | "audit.export";
export function can(roles: Role[], role: RoleId, capability: Capability): boolean {
  if (role === "owner") return true;
  const [resource, action] = MAP[capability];
  return roles.find((r) => r.id === role)?.permissions[resource][action] ?? false;
}
```

## Hide or disable

| situation | do |
|---|---|
| The role can never do it (create, delete) | hide the button |
| The role may view but not change a form or a matrix | disable the controls and show a `Banner` that says why |
| Nothing is selected yet | disable the bulk buttons, keep the bar |
| The role may not open the page | hide its `NavList` item and show the not-found page for the URL |

- Pass the role and the matrix to views as props, so tests can render a viewer and an admin.
- One capability name per action; do not scatter role names through components.
- After the matrix is saved, reload the roles so the shell updates at once.
