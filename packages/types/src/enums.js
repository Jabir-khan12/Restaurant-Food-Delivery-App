// ─── User Roles ───────────────────────────────────────────────────────────────

export const UserRole = {
  ADMIN: 'admin',
  OWNER: 'owner',
  KITCHEN: 'kitchen',
  RIDER: 'rider',
  CUSTOMER: 'customer',
};

// ─── Account Status ───────────────────────────────────────────────────────────

export const AccountStatus = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  PENDING_VERIFICATION: 'pending_verification',
  DELETED: 'deleted',
};

// ─── Restaurant Status ────────────────────────────────────────────────────────

export const RestaurantStatus = {
  PENDING: 'pending',
  DOCUMENTS_SUBMITTED: 'documents_submitted',
  VERIFIED: 'verified',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
};

// ─── Order Status ─────────────────────────────────────────────────────────────

export const OrderStatus = {
  PLACED: 'placed',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  PICKED_UP: 'picked_up',
  ON_THE_WAY: 'on_the_way',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

// ─── Payment Gateway ──────────────────────────────────────────────────────────

export const PaymentGateway = {
  STRIPE: 'stripe',
  EASYPAISA: 'easypaisa',
  JAZZCASH: 'jazzcash',
  COD: 'cod',
};

// ─── Payment Status ───────────────────────────────────────────────────────────

export const PaymentStatus = {
  PENDING: 'pending',
  AUTHORIZED: 'authorized',
  CAPTURED: 'captured',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded',
};

// ─── KYC Status ───────────────────────────────────────────────────────────────

export const KycStatus = {
  PENDING: 'pending',
  SUBMITTED: 'submitted',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
};

// ─── Notification Channel ─────────────────────────────────────────────────────

export const NotificationChannel = {
  IN_APP: 'in_app',
  EMAIL: 'email',
  PUSH: 'push',
};

// ─── Notification Status ──────────────────────────────────────────────────────

export const NotificationStatus = {
  PENDING: 'pending',
  SENT: 'sent',
  READ: 'read',
  FAILED: 'failed',
};

// ─── Dispute Status ───────────────────────────────────────────────────────────

export const DisputeStatus = {
  OPEN: 'open',
  INVESTIGATING: 'investigating',
  RESOLVED: 'resolved',
  ESCALATED: 'escalated',
};

// ─── Moderation Status ────────────────────────────────────────────────────────

export const ModerationStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// ─── Promo Type ───────────────────────────────────────────────────────────────

export const PromoType = {
  PERCENTAGE: 'percentage',
  FLAT: 'flat',
};

// ─── Vehicle Type ─────────────────────────────────────────────────────────────

export const VehicleType = {
  BIKE: 'bike',
  CAR: 'car',
  BICYCLE: 'bicycle',
};
