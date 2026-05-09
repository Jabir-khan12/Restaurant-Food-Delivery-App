export default function AdminRidersPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold">Riders</h2>
      <p className="mt-1 text-muted-foreground">Manage rider accounts, KYC approvals, and assignments</p>
      <div className="mt-6 rounded-lg border bg-card p-6">
        <p className="text-muted-foreground">
          Rider management with KYC status tracking, approval workflow, and live status.
          Connects to /api/v1/riders/admin endpoints.
        </p>
      </div>
    </div>
  );
}
