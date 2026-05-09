export default function AdminAuditPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold">Audit Logs</h2>
      <p className="mt-1 text-muted-foreground">System-wide activity log for compliance and debugging</p>
      <div className="mt-6 rounded-lg border bg-card p-6">
        <p className="text-muted-foreground">
          Searchable audit log viewer with actor, action, entity, and timestamp filters.
          Connects to the AuditLog model.
        </p>
      </div>
    </div>
  );
}
