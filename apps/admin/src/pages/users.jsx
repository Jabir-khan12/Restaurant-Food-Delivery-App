export default function AdminUsersPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold">Users</h2>
      <p className="mt-1 text-muted-foreground">Manage user accounts, roles, and statuses</p>
      <div className="mt-6 rounded-lg border bg-card p-6">
        <p className="text-muted-foreground">
          User management table with role filter, account status toggle, and search.
        </p>
      </div>
    </div>
  );
}
