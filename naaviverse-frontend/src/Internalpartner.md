# Naaviverse Internal & External Partner Architecture and Implementation Concept

## 1. Document Purpose

This document explains the complete partner concept in Naaviverse, including:

- The existing and completed External Partner flow.
- The new Internal Partner concept.
- The role of the Super Admin in creating and managing Internal Partners.
- How Internal Partner credentials should be created.
- How Internal Partners should log in and change their password.
- How the existing Partner platform should be reused.
- The differences between Internal and External Partners.
- Marketplace ownership and payment behavior.
- Recommended frontend, backend, database, authentication, and authorization changes.
- A phased implementation plan.

The purpose of this document is to provide enough context that any developer or AI coding assistant can understand the requirement before modifying the existing codebase.

---

# 2. High-Level Business Concept

Naaviverse has two types of partners:

1. External Partners
2. Internal Partners

The main difference is who owns/manages the partner relationship and how the partner enters the platform.

## External Partner

An External Partner is a third-party business, institution, mentor, vendor, distributor, service provider, or other organization/person that comes to the Naaviverse platform from outside.

They register themselves and follow the existing Partner onboarding and approval process.

The External Partner functionality is already implemented.

## Internal Partner

An Internal Partner is a partner that comes from the Naaviverse side and is directly created and managed by Naaviverse.

Internal Partners do NOT register themselves.

The Super Admin creates their account and initial credentials.

After receiving credentials, the Internal Partner logs in through the Partner platform and can change their password.

Internal Partners can use the applicable existing Partner features, but their financial/payment behavior differs from External Partners because their marketplace revenue belongs directly to Naaviverse.

---

# 3. External Partner — Existing Completed Flow

The External Partner functionality is already completed and should not be unnecessarily redesigned or broken while implementing Internal Partners.

Existing flow:

```text
External Partner
        ↓
Partner Registration
        ↓
Account Created / Pending Approval
        ↓
Admin Approval
        ↓
Partner Login
        ↓
Partner Dashboard
        ↓
Create/Manage Marketplace Products or Services
        ↓
Customer Purchase
        ↓
Payment / Transaction
        ↓
Naaviverse Commission + Partner Revenue/Settlement
```

External Partners may already have functionality such as:

- Partner registration
- Admin approval
- Partner login
- Partner dashboard
- Partner-exclusive page
- Marketplace listings
- Products/services
- Paths and related partner features
- Orders
- Transactions
- Earnings/revenue
- Commission calculation
- Settlement/payout functionality

These features belong to the completed External Partner implementation.

## Important Rule

Do not rebuild the External Partner system for the Internal Partner feature.

The new implementation should extend the existing Partner architecture wherever possible.

---

# 4. External Partner Business Ownership

External Partners are independent third parties.

Therefore, when an External Partner creates a marketplace product/service and a customer purchases it, the financial relationship involves both:

- External Partner
- Naaviverse

Conceptually:

```text
Customer
   ↓
Marketplace Purchase
   ↓
Payment
   ↓
External Partner Sale
   +
Naaviverse Commission
   ↓
Settlement / Payout Logic
```

Example:

```text
Product Price = ₹5,000
Naaviverse Commission = 10%

Gross Payment = ₹5,000
Naaviverse Commission = ₹500
External Partner Earning = ₹4,500
```

The exact settlement behavior depends on the already implemented payment architecture.

This existing External Partner payment functionality should remain unchanged unless integration changes are required.

---

# 5. New Feature — Internal Partner

The new requirement is to introduce Internal Partners.

An Internal Partner is a partner account created directly by the Naaviverse Super Admin.

Examples may include:

- Naaviverse-managed service providers
- Naaviverse-owned offerings
- Internal organizations or teams operating as partners
- Selected partners whose accounts are directly controlled/created by Naaviverse

The key rule is:

> An Internal Partner cannot create their own account through public Partner registration.

Only the authorized Super Admin should create an Internal Partner account.

---

# 6. Internal Partner Complete Flow

The proposed Internal Partner flow is:

```text
Super Admin
     ↓
Internal Partner Management
     ↓
Create Internal Partner
     ↓
Enter Partner Details
     ↓
Create / Generate Initial Credentials
     ↓
System Creates Internal Partner Account
     ↓
Account is Authorized Without Normal External Approval
     ↓
Credentials Provided to Internal Partner
     ↓
Internal Partner Opens Existing Partner Login
     ↓
Logs In Using Created Credentials
     ↓
Changes Temporary Password
     ↓
Accesses Partner Dashboard
     ↓
Uses Allowed Partner Features
```

There is:

- No public registration.
- No self-signup.
- No normal External Partner approval workflow.

The account exists because the Super Admin explicitly created it.

---

# 7. Super Admin Responsibility

The Super Admin should be the authority responsible for Internal Partner management.

Recommended Super Admin capabilities:

- Create Internal Partner
- View all Internal Partners
- View Internal Partner details
- Edit Internal Partner details
- Create/generate initial credentials
- Activate an Internal Partner
- Deactivate an Internal Partner
- Reset Internal Partner password/access
- View account status
- View who created the account
- View created date
- Optionally manage permissions

Recommended navigation:

```text
Super Admin Dashboard
        ↓
Partner Management
        │
        ├── External Partners
        │      Existing functionality
        │
        └── Internal Partners
               │
               ├── View All
               ├── Create Internal Partner
               ├── View Details
               ├── Edit
               ├── Activate / Deactivate
               └── Reset Access
```

---

# 8. Internal Partner Creation UI

A new Super Admin page or section should be added:

```text
Internal Partners
```

Example list:

```text
-------------------------------------------------------------
Partner Name       Email             Status       Created By
-------------------------------------------------------------
Naavi Career       career@...        Active       Super Admin
Naavi Education    education@...     Active       Super Admin
Naavi Mentor       mentor@...        Inactive     Super Admin
-------------------------------------------------------------

                    + Create Internal Partner
```

When Super Admin clicks:

```text
Create Internal Partner
```

a form should open.

Possible fields:

```text
Partner Name *
Organization Name
Contact Person *
Email Address *
Phone Number
Partner Category
Description

Login Email *
Temporary Password *
Confirm Password *

Account Status
- Active
- Inactive

[Cancel] [Create Internal Partner]
```

The exact fields should be adapted to the existing Partner model instead of creating duplicate fields.

---

# 9. Login Credentials

If the existing Partner authentication system uses:

```text
Email
Password
```

the Internal Partner should use the same login structure.

There is no need to introduce a separate username unless the existing application already requires one.

Example credentials:

```text
Login Email:
careerpartner@naaviverse.com

Temporary Password:
********
```

The Super Admin creates or generates the initial credentials.

The Internal Partner then uses the existing Partner Login page.

---

# 10. Recommended Password Flow

The recommended approach is a temporary password with a forced password change.

Flow:

```text
Super Admin Creates Internal Partner
        ↓
Temporary Password Created
        ↓
Password Hashed and Stored
        ↓
Credentials Given to Internal Partner
        ↓
Internal Partner Logs In
        ↓
System Detects First Login / Temporary Password
        ↓
User Must Change Password
        ↓
New Private Password Saved
        ↓
Partner Dashboard Access
```

Recommended field concept:

```text
must_change_password = true
```

After successful password change:

```text
must_change_password = false
```

This is safer because the Super Admin may know the original temporary password.

After changing it, only the Internal Partner knows the new password.

---

# 11. Password Security

Passwords must NEVER be stored as plain text.

Wrong:

```text
password = "Temp@123"
```

Correct concept:

```text
Temporary Password
       ↓
Password Hashing (for example bcrypt)
       ↓
Hashed Password Stored in Database
```

The Super Admin should not have a "View Existing Password" feature.

If access needs to be restored, use:

```text
Reset Password
```

instead.

Password reset flow:

```text
Super Admin
     ↓
Select Internal Partner
     ↓
Reset Password
     ↓
New Temporary Password
     ↓
must_change_password = true
     ↓
Internal Partner Logs In
     ↓
Forced Password Change
```

---

# 12. Internal Partner Login

A separate Internal Partner login page is not required unless there is a specific business/UI requirement.

Recommended approach:

```text
Existing Partner Login
        ↓
Email + Password
        ↓
Backend Authenticates Account
        ↓
Backend Reads Partner Type
        │
        ├── INTERNAL
        │
        └── EXTERNAL
        ↓
Partner Dashboard
```

The user should not manually select:

```text
Are you Internal or External?
```

The system already knows the account type from the database.

---

# 13. Partner Classification

The existing Partner model should be extended with a reliable classification.

Recommended concept:

```text
partner_type
```

Allowed values:

```text
internal
external
```

Existing/self-registered partners:

```text
partner_type = external
```

Super Admin-created partners:

```text
partner_type = internal
```

Also useful:

```text
creation_source
```

Values:

```text
self_registered
admin_created
```

Example:

```text
External Partner:
partner_type = external
creation_source = self_registered

Internal Partner:
partner_type = internal
creation_source = admin_created
```

---

# 14. Critical Security Rule — Partner Type Must Be Server Controlled

A normal frontend/public request must NOT be allowed to decide:

```json
{
  "partner_type": "internal"
}
```

Otherwise a malicious user could potentially manipulate a request and attempt to create an Internal Partner account.

Only a protected Super Admin backend API should be capable of creating an Internal Partner.

The backend itself should force:

```text
partner_type = internal
creation_source = admin_created
```

The value must not be trusted from public frontend input.

---

# 15. Internal Partner Approval Behavior

External Partner:

```text
Register
   ↓
Pending
   ↓
Admin Review
   ↓
Approved / Rejected
   ↓
Access
```

Internal Partner:

```text
Super Admin Creates Account
   ↓
Already Authorized
   ↓
Credentials Created
   ↓
Login
```

An Internal Partner should normally bypass the External Partner approval workflow.

It does not make sense to:

```text
Super Admin Creates Internal Partner
        ↓
Same Account Waits for Normal Approval
```

The Super Admin's act of creating the account is already the authorization.

---

# 16. Approval Status vs Account Status

Approval and account access should be treated as different concepts.

Example:

```text
approval_status = approved
account_status = active
```

Later, Super Admin may stop access:

```text
approval_status = approved
account_status = inactive
```

This allows the account and its historical data to remain in the system while preventing login/access.

Recommended account states could include:

```text
active
inactive
```

or, if needed:

```text
invited
active
disabled
```

Do not overload approval status to represent every account condition.

---

# 17. Deactivate Instead of Delete

Internal Partner accounts may become connected to:

- Marketplace items
- Products/services
- Paths
- Orders
- Customer purchases
- Transactions
- Other relational data

Deleting the account can break relationships.

Recommended approach:

```text
Deactivate Account
```

rather than permanently deleting it.

When inactive:

```text
Login Attempt
     ↓
Credentials Valid
     ↓
Account Status = Inactive
     ↓
Access Denied
```

Possible message:

```text
Your account is currently inactive.
Please contact the Naaviverse administrator.
```

---

# 18. Reuse the Existing Partner Dashboard

Do not build a completely separate Internal Partner Dashboard unless the UI/business requirements become completely different.

Recommended architecture:

```text
                 EXISTING PARTNER DASHBOARD
                           │
                   Read partner_type
                    ┌──────┴──────┐
                    │             │
                INTERNAL       EXTERNAL
                    │             │
              Shared Features   Shared Features
                    │             │
                    │         External-only Features
```

Shared features may include, depending on current implementation:

- Profile
- Marketplace
- Products/services
- Paths
- Orders
- Other standard Partner features

External-only features may include:

- Partner-exclusive page
- Earnings
- Commission
- Settlement
- Payout
- External financial management

The exact feature list must be mapped against the existing codebase.

---

# 19. External Exclusive Page

The External Partner exclusive page is already completed.

It should remain an External Partner-specific feature.

Conceptually:

```text
partner_type = external
    ↓
Exclusive Page Available
```

```text
partner_type = internal
    ↓
Exclusive Page Not Required
```

Do not redesign the completed External Partner exclusive page as part of this feature.

---

# 20. Internal Partner Marketplace Behavior

Internal Partners may use the existing Partner Marketplace functionality to create/manage applicable products or services.

However, the financial ownership differs.

For Internal Partner marketplace items:

```text
Marketplace Item
      ↓
Owned/Managed through Internal Partner
      ↓
Customer Adds to Cart
      ↓
Customer Pays
      ↓
Revenue Goes to Naaviverse
```

There is no external partner commission split or external settlement requirement because the Internal Partner is a Naaviverse-side account.

---

# 21. Internal vs External Payment Difference

## External Partner

```text
Customer
   ↓
Purchase External Partner Item
   ↓
Payment
   ↓
External Partner Revenue
   +
Naaviverse Commission
   ↓
Settlement / Payout Logic
```

## Internal Partner

```text
Customer
   ↓
Purchase Internal Partner Item
   ↓
Payment
   ↓
Naaviverse Revenue
```

There should be no unnecessary middle settlement layer between Naaviverse and an Internal Partner.

---

# 22. Add to Cart

The existing Add to Cart functionality should ideally remain shared.

Both types of products can use:

```text
Marketplace Item
      ↓
Add to Cart
      ↓
Cart
      ↓
Checkout
```

The major difference should be handled through ownership/payment logic, not by building two completely separate carts.

---

# 23. Marketplace Ownership Data

Each marketplace item should have enough information to identify its seller/owner.

Conceptually:

```text
Marketplace Item
│
├── partner_id
├── partner_type
└── revenue_owner
```

Possible values:

Internal:

```text
partner_type = internal
revenue_owner = naaviverse
```

External:

```text
partner_type = external
revenue_owner = partner
```

However, `partner_type` should preferably be derived from the actual Partner account on the backend rather than trusted from frontend input.

Example concept:

```text
Authenticated Partner
        ↓
Backend Loads Partner Record
        ↓
Read partner_type
        ↓
Create Marketplace Item
        ↓
Assign Financial Ownership Automatically
```

This prevents frontend manipulation.

---

# 24. Mixed Cart Consideration

The architecture should support the possibility that a customer may add items from different partner types.

Example:

```text
Cart

Item A
Internal Partner
₹1,000

Item B
External Partner X
₹2,000

Item C
External Partner Y
₹3,000

Total = ₹6,000
```

The system should not assume the entire order has one financial owner.

Order/payment records should preserve ownership at the item/seller level.

Conceptually:

```text
Order
Total = ₹6,000

Order Item A
Seller Type = Internal
Revenue Owner = Naaviverse

Order Item B
Seller Type = External
Revenue Owner = External Partner X

Order Item C
Seller Type = External
Revenue Owner = External Partner Y
```

This allows correct financial calculation and reporting.

---

# 25. Internal Partner Transactions

Internal Partners may still need to view operational information such as:

- Orders
- Customer purchases
- Product sales activity
- Service usage

But they do not necessarily need External Partner financial functionality such as:

- Partner payout
- Settlement request
- Withdrawal
- Commission earnings

Therefore:

```text
Internal Partner:
Orders / Sales Activity = May be visible
External Settlement Features = Not required
```

Do not automatically hide all transaction/order information just because the partner is Internal.

Separate operational transaction visibility from financial payout functionality.

---

# 26. Recommended Super Admin Internal Partner Page

Example:

```text
INTERNAL PARTNERS

-----------------------------------------------------------
Name           Email            Status        Actions
-----------------------------------------------------------
Naavi Career   career@...       Active        View/Edit
Naavi Mentor   mentor@...       Active        View/Edit
Naavi Edu      edu@...          Inactive      View/Edit
-----------------------------------------------------------

                    + CREATE INTERNAL PARTNER
```

Details page:

```text
INTERNAL PARTNER DETAILS

Partner Name
Organization
Contact Person
Email
Phone
Category

Partner Type: Internal
Account Status: Active
Created By: Super Admin
Created Date: ...

Password Status:
Temporary Password / Password Changed

Marketplace Items: ...
Orders: ...

Actions:

[Edit Details]
[Reset Password]
[Deactivate Account]
```

---

# 27. Recommended Data Model Concept

Do not blindly create a new model before checking the existing Partner schema.

Prefer extending the existing Partner model.

Conceptual fields:

```text
Partner

Identity
├── name
├── email
├── phone
└── organization

Classification
├── partner_type
└── creation_source

Authentication
├── password (hashed)
└── must_change_password

Account
├── approval_status
└── account_status

Administration
├── created_by
└── timestamps
```

Possible Mongoose-style concept:

```js
{
  name: String,

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: String,

  partner_type: {
    type: String,
    enum: ["internal", "external"],
    default: "external"
  },

  creation_source: {
    type: String,
    enum: ["self_registered", "admin_created"]
  },

  approval_status: {
    type: String,
    enum: ["pending", "approved", "rejected"]
  },

  account_status: {
    type: String,
    enum: ["active", "inactive"]
  },

  must_change_password: {
    type: Boolean,
    default: false
  },

  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin"
  }
}
```

This is conceptual.

Before implementation, inspect the existing models and reuse existing fields wherever possible.

---

# 28. Existing Partner Migration

The project already has External Partners.

When adding `partner_type`, existing Partner records must not accidentally become Internal.

Recommended migration/default strategy:

```text
Existing Partners
      ↓
partner_type = external
```

New public/self-registered Partner:

```text
partner_type = external
creation_source = self_registered
```

New Super Admin-created Internal Partner:

```text
partner_type = internal
creation_source = admin_created
```

Migration must be planned carefully to avoid breaking existing Partner accounts.

---

# 29. Recommended Backend APIs

Exact route names should follow the existing project structure.

Conceptually:

```text
POST
/api/admin/internal-partners

GET
/api/admin/internal-partners

GET
/api/admin/internal-partners/:id

PATCH / PUT
/api/admin/internal-partners/:id

PATCH
/api/admin/internal-partners/:id/status

POST
/api/admin/internal-partners/:id/reset-password
```

Existing Partner login should preferably be reused:

```text
POST
/api/partner/login
```

Password change endpoint may be existing or added:

```text
POST / PATCH
/api/partner/change-password
```

Do not duplicate APIs if equivalent secure endpoints already exist.

---

# 30. Create Internal Partner Backend Logic

Conceptual backend flow:

```text
Request from Super Admin
        ↓
Authenticate Super Admin
        ↓
Authorize Internal Partner Creation Permission
        ↓
Validate Input
        ↓
Check Duplicate Email
        ↓
Hash Temporary Password
        ↓
Create Partner Record
        ↓
Backend Forces:
partner_type = internal
creation_source = admin_created
approval_status = approved
must_change_password = true
created_by = current Super Admin
        ↓
Save
        ↓
Return Safe Partner Data
```

Never return the stored password hash.

---

# 31. Authentication vs Authorization

These are different.

Authentication:

> Who is this user?

Authorization:

> What is this user allowed to do?

After Partner login, the backend should know:

```text
role = partner
partner_type = internal
```

or:

```text
role = partner
partner_type = external
```

Frontend can use this to control UI.

Backend must also enforce permissions.

Example:

```text
External-only Settlement API
        ↓
Authenticate Partner
        ↓
Check partner_type
        ↓
External → Allow
Internal → Deny
```

Hiding a menu in React is not enough security.

Backend authorization must enforce the same rule.

---

# 32. JWT / Session Concept

If the application uses JWT, the authenticated identity may include or resolve:

```text
userId
role
partner_type
```

Example concept:

```js
{
  userId: partner._id,
  role: "partner",
  partnerType: "internal"
}
```

However, critical permissions should still be validated securely against current database state when appropriate, especially if account type/status can change.

---

# 33. Capability-Based Access

Avoid scattering too many checks like:

```text
if internal...
if external...
```

throughout the application.

A capability model is cleaner.

Concept:

```js
const partnerCapabilities = {
  internal: {
    marketplace: true,
    paths: true,
    orders: true,
    exclusivePage: false,
    earnings: false,
    settlements: false,
    payouts: false
  },

  external: {
    marketplace: true,
    paths: true,
    orders: true,
    exclusivePage: true,
    earnings: true,
    settlements: true,
    payouts: true
  }
};
```

The exact capabilities should be based on final business requirements.

This makes future changes easier.

---

# 34. Frontend Changes

Likely frontend work:

## Super Admin

Add:

```text
Internal Partners
Create Internal Partner
View Internal Partners
Edit Internal Partner
Activate / Deactivate
Reset Password
```

## Partner Login

Reuse existing login.

Add logic for:

```text
must_change_password = true
```

If true:

```text
Redirect to Change Password
```

After password change:

```text
Redirect to Partner Dashboard
```

## Partner Dashboard

Read Partner type/capabilities.

Show shared features normally.

Hide or disable External-only functionality for Internal Partners.

Do not duplicate the entire dashboard unnecessarily.

---

# 35. Backend Changes

Likely backend work:

- Extend existing Partner model.
- Add Internal Partner creation APIs.
- Add Super Admin authorization.
- Add Internal Partner list/detail/update APIs.
- Add activate/deactivate behavior.
- Add/reset password functionality if not already available.
- Add `must_change_password` behavior.
- Update Partner login response if needed.
- Add backend guards for External-only features.
- Update marketplace ownership logic.
- Update payment/transaction logic for Internal Partner items.
- Preserve existing External Partner behavior.

---

# 36. Database Changes

Likely database changes:

Partner:

```text
partner_type
creation_source
created_by
account_status
must_change_password
```

Only add fields that are not already represented by existing schema fields.

Marketplace/Service/Product:

Ensure ownership can be resolved through:

```text
partner_id
```

and, where needed:

```text
revenue_owner
```

Avoid unnecessary duplicated data if ownership can safely be derived.

Orders/Transactions:

Ensure each purchased item can preserve:

```text
seller/partner
partner type or ownership context
financial allocation
```

This is especially important for mixed carts.

---

# 37. Internal Partner Creation Sequence

Detailed sequence:

```text
1. Super Admin logs in.

2. Opens:
   Partner Management → Internal Partners

3. Clicks:
   Create Internal Partner

4. Enters:
   - Partner details
   - Email
   - Initial temporary password

5. Frontend calls protected Super Admin API.

6. Backend:
   - verifies Super Admin
   - validates fields
   - checks duplicate email
   - hashes password
   - creates Partner

7. Backend automatically sets:
   partner_type = internal
   creation_source = admin_created
   approval_status = approved
   account_status = active
   must_change_password = true
   created_by = current Super Admin

8. Internal Partner account is created.

9. Credentials are securely provided to the Internal Partner.

10. Internal Partner opens existing Partner Login.

11. Enters email + temporary password.

12. Backend authenticates.

13. System detects:
    must_change_password = true

14. Redirect to Change Password.

15. Internal Partner creates new private password.

16. Backend hashes new password.

17. Set:
    must_change_password = false

18. Internal Partner gets normal allowed dashboard access.
```

---

# 38. Internal Partner Account Lifecycle

```text
                    SUPER ADMIN
                         │
                Create Internal Partner
                         │
                 Create Credentials
                         │
                 Account Authorized
                         │
                 INTERNAL PARTNER
                         │
                      Login
                         │
                Change First Password
                         │
                  Partner Dashboard
                         │
                Use Allowed Features
                         │
             ┌───────────┴───────────┐
             │                       │
          Active                Super Admin
             │                       │
      Continue Access          Can Reset Password
                               Can Edit Account
                               Can Deactivate
```

---

# 39. Complete Internal vs External Comparison

| Feature | External Partner | Internal Partner |
|---|---|---|
| Source | Outside Naaviverse | Naaviverse side |
| Public/self registration | Yes | No |
| Created by | Partner themselves | Super Admin |
| Normal admin approval | Yes | No / automatically authorized |
| Login | Existing Partner Login | Existing Partner Login |
| Initial credentials | Registration flow | Created by Super Admin |
| Change password | Existing functionality | Yes |
| Forced first password change | Optional/current behavior | Recommended |
| Partner Dashboard | Yes | Reuse same dashboard |
| Marketplace | Yes | Yes, as permitted |
| Paths/normal partner features | Yes | Yes, as permitted |
| Exclusive Partner Page | Yes/current completed flow | Not required |
| Orders | Yes | Yes, if applicable |
| Earnings | Yes | Not external-style earnings |
| Commission | Naaviverse commission applies | No external partner commission split |
| Settlement/Payout | Existing external flow | Not required |
| Revenue owner | External Partner + Naaviverse commission | Naaviverse |
| Account management | Existing flow | Super Admin managed |
| Deactivation | As supported | Super Admin controlled |

---

# 40. Features That Must Not Be Broken

The following completed External Partner behavior should remain working:

```text
External Partner Registration
External Partner Approval
External Partner Login
External Partner Dashboard
External Partner Exclusive Page
Marketplace
Transactions
Earnings
Commission
Settlement/Payout
Existing External Payment Logic
```

Internal Partner implementation must be additive and backward-compatible wherever possible.

---

# 41. What NOT to Do

Avoid:

```text
❌ Creating a completely separate InternalPartner collection without need.

❌ Building a second full Partner Dashboard from scratch.

❌ Creating a separate authentication system unnecessarily.

❌ Allowing Internal Partner public signup.

❌ Sending Internal Partners through the normal External approval flow.

❌ Storing passwords in plain text.

❌ Allowing Super Admin to view current passwords.

❌ Trusting frontend input to set partner_type = internal.

❌ Implementing access restrictions only in frontend.

❌ Permanently deleting accounts that have related marketplace/order data.

❌ Rewriting completed External Partner functionality unnecessarily.

❌ Treating all cart items as having the same revenue owner.
```

---

# 42. Recommended Architecture

```text
                              NAAVIVERSE
                                  │
                            SUPER ADMIN
                                  │
                       Partner Management
                    ┌─────────────┴─────────────┐
                    │                           │
             EXTERNAL PARTNERS          INTERNAL PARTNERS
                    │                           │
              Self Register              Super Admin Creates
                    │                           │
              Admin Approval             Credentials Created
                    │                           │
              Account Access             Automatically Authorized
                    │                           │
                    └─────────────┬─────────────┘
                                  │
                         Existing Partner Login
                                  │
                         Authentication System
                                  │
                           Read Partner Type
                       ┌──────────┴──────────┐
                       │                     │
                   INTERNAL              EXTERNAL
                       │                     │
                 Shared Partner         Shared Partner
                   Features               Features
                       │                     │
                 No External-           Exclusive Page
                 Settlement             Earnings
                 Logic                  Commission
                       │                 Settlement
                       │
                       └──────── Marketplace ────────┘
                                  │
                              Add to Cart
                                  │
                               Checkout
                                  │
                               Payment
                                  │
                         Determine Ownership
                       ┌──────────┴──────────┐
                       │                     │
                   INTERNAL              EXTERNAL
                       │                     │
                   Revenue to           External Partner
                   Naaviverse           Revenue
                                             +
                                      Naaviverse Commission
                                             ↓
                                      Settlement/Payout
```

---

# 43. Recommended Implementation Phases

## Phase 1 — Understand Existing Code

Before modifying anything, inspect:

- Existing Partner model/schema
- Partner registration controller
- Partner login/authentication controller
- Admin/Super Admin models and middleware
- Existing Partner approval logic
- Partner routes
- Partner Dashboard frontend
- Marketplace models/controllers
- Cart
- Orders
- Transactions
- Payment/commission/settlement implementation
- Password change/reset implementation

Goal:

Reuse existing code and avoid duplicate architecture.

---

## Phase 2 — Partner Classification

Add or adapt:

```text
partner_type = internal | external
```

Add if needed:

```text
creation_source
created_by
account_status
must_change_password
```

Ensure all existing Partner accounts remain:

```text
external
```

unless intentionally migrated otherwise.

---

## Phase 3 — Super Admin Internal Partner APIs

Implement protected functionality for:

```text
Create
List
View
Edit
Activate
Deactivate
Reset Password
```

Only authorized Super Admin access should be allowed.

---

## Phase 4 — Super Admin Frontend

Create:

```text
Internal Partners List
Create Internal Partner Form
Internal Partner Details
Edit
Activate/Deactivate
Reset Password
```

---

## Phase 5 — Authentication and Password

Reuse existing Partner login.

Add:

```text
Internal Partner Authentication
First Login Detection
Forced Password Change
Password Reset
Inactive Account Blocking
```

---

## Phase 6 — Dashboard Access

Reuse existing Partner Dashboard.

Implement capability/type-based access.

Example:

```text
Internal:
Shared features only

External:
Shared features
+
Exclusive/financial external features
```

Enforce restrictions in both frontend and backend.

---

## Phase 7 — Marketplace Ownership

Ensure marketplace items are connected to the authenticated Partner.

Backend determines:

```text
Internal → Naaviverse revenue
External → Existing external ownership/commission flow
```

Do not trust the frontend to choose financial ownership.

---

## Phase 8 — Cart, Orders, and Payments

Keep common cart behavior where possible.

At checkout:

```text
Identify seller/owner per item
        ↓
Internal Item
→ Naaviverse Revenue

External Item
→ Existing External Commission/Settlement Flow
```

Support mixed carts correctly.

---

## Phase 9 — Testing

Test at minimum:

### External Regression

- Existing External registration still works.
- Approval still works.
- Login still works.
- Dashboard still works.
- Exclusive page still works.
- Marketplace still works.
- Transactions/commission/settlement still work.

### Internal Creation

- Only Super Admin can create Internal Partner.
- Duplicate email is rejected.
- Password is hashed.
- Internal type is set by backend.
- Account is authorized correctly.

### Internal Login

- Correct credentials work.
- Incorrect credentials fail.
- First login requires password change if implemented.
- New password works.
- Old temporary password stops working.
- Inactive account cannot access platform.

### Authorization

- Internal Partner cannot access External-only APIs by manually entering URLs.
- External Partner behavior remains unchanged.
- Public requests cannot create Internal Partner accounts.

### Marketplace/Payment

- Internal product purchase routes revenue correctly to Naaviverse.
- External purchase follows existing flow.
- Mixed cart ownership is handled correctly.
- Order records preserve seller/ownership context.

---

# 44. Core Development Principle

The Internal Partner feature should NOT be treated as an entirely new independent Partner system.

The clean architecture is:

```text
EXISTING PARTNER SYSTEM
        +
Partner Classification
(INTERNAL / EXTERNAL)
        +
Super Admin Internal Partner Creation
        +
Credential and Password Management
        +
Capability-Based Access
        +
Different Financial Ownership Rules
```

This allows Naaviverse to reuse:

- Existing Partner login
- Existing Partner Dashboard
- Existing Marketplace functionality
- Existing Paths/features
- Existing authentication infrastructure

while adding only the behavior that is genuinely different for Internal Partners.

---

# 45. Final Requirement Summary

## Already Completed — External Partner

```text
External Partner
        ↓
Self Registration
        ↓
Admin Approval
        ↓
Partner Login
        ↓
Partner Dashboard
        ↓
Marketplace / Partner Features
        ↓
Exclusive Page
        ↓
Customer Purchase
        ↓
Transactions
        ↓
Naaviverse Commission
        +
External Partner Revenue
        ↓
Settlement / Payout
```

This flow should remain intact.

## New Feature — Internal Partner

```text
Super Admin
        ↓
Create Internal Partner
        ↓
Enter Partner Details
        ↓
Create Initial Credentials
        ↓
Backend Creates:
partner_type = internal
        ↓
Account Automatically Authorized
        ↓
Internal Partner Receives Credentials
        ↓
Uses Existing Partner Login
        ↓
First Login
        ↓
Change Temporary Password
        ↓
Existing Partner Dashboard
        ↓
Use Allowed Shared Partner Features
        ↓
Create/Manage Marketplace Items
        ↓
Customer Adds to Cart
        ↓
Checkout / Payment
        ↓
Revenue Goes to Naaviverse
        ↓
No External Partner Commission/Settlement Middleware
```

## Main Rule

> External Partners come from outside Naaviverse, register themselves, require approval, and participate in external commission/settlement logic.

> Internal Partners come from the Naaviverse side, are created only by the Super Admin with initial credentials, use the existing Partner platform after login/password change, and their marketplace revenue belongs directly to Naaviverse without external partner settlement logic.

---

# 46. Next Coding Step

Before coding, provide the relevant existing files to the developer/AI, especially:

```text
1. Partner model/schema
2. Partner registration controller
3. Partner login/auth controller
4. Partner routes
5. Super Admin/Admin model and auth middleware
6. Super Admin routes/controllers
7. Partner Dashboard routing/components
8. Marketplace model/controller/routes
9. Cart model/controller/routes
10. Order/transaction models and controllers
11. Payment/commission/settlement code
12. Existing password change/reset code
```

The implementation should then be planned file-by-file based on the actual current architecture.

Do not replace working External Partner logic unless required.

Prefer minimal, backward-compatible changes that add Internal Partner support to the existing Partner system.
