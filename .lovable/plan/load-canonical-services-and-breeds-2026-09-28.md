# Load canonical services and breeds

## Scope
- Treat `services.csv`, `service_sop.csv`, `service_inventory.csv`, `service_staff.csv`, and `breeds.csv` as the source of truth.
- Preserve the website and Dashboard visual structures while replacing their service and breed data connections.
- Load only the exact supplied rows; do not create additional records or inferred values.

## Implementation
1. Extend the existing services structure additively so it accepts the exact `services.csv` fields without breaking the live booking flow.
2. Create the dependent service SOP, inventory, staff-qualification, and breed structures using the exact uploaded headers, grants, relationships, and staff/service identifiers.
3. Load in dependency order: services, service SOP, service inventory, service staff, then breeds.
4. Verify row totals and key relationships against the uploads.
5. Connect the React Dashboard Services view to the canonical service details, ordered SOP steps, inventory quantities, and qualified staff; connect supplied breed records where the existing Dashboard breed view expects them.
6. Keep the phone stylist terminal unchanged.

## Technical details
- Existing service rows will be updated to canonical identifiers and values rather than duplicated.
- Existing compatibility fields remain temporarily because the public booking flow still uses them; canonical duration values will also populate the current duration field.
- New public structures will use staff-only access rules and explicit grants.
- No risk scores or recommendations will be calculated from `prior_risk`; it remains imported source data only.
