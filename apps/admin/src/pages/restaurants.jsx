export default function AdminRestaurantsPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold">Restaurants</h2>
      <p className="mt-1 text-muted-foreground">Manage restaurant listings, approvals, and status</p>
      <div className="mt-6 rounded-lg border bg-card p-6">
        <p className="text-muted-foreground">
          Restaurant management with approval workflow, status changes, and owner details.
          Connects to /api/v1/restaurants endpoints.
        </p>
      </div>
    </div>
  );
}
