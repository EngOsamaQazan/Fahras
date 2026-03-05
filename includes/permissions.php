<?php
/**
 * Fahras Permissions Matrix
 *
 * Role hierarchy and capabilities:
 *
 * super_admin:
 *   - Full system access
 *   - Manage all users including other admins
 *   - View/manage all violations
 *   - Run scans and sync
 *   - View activity log
 *
 * admin:
 *   - Same as super_admin except cannot manage super_admin users
 *   - Full violation management
 *   - Run scans and sync
 *   - View activity log
 *
 * company_admin:
 *   - View clients for their company
 *   - Add/import clients for their company
 *   - View violations for their company only
 *   - Dispute violations for their company
 *   - Search
 *
 * user:
 *   - Search
 *   - Add clients for their company
 *   - Import clients for their company
 *
 * viewer:
 *   - Search only
 *   - View violations (read-only)
 *
 * All permission functions are defined in bootstrap.php.
 */
