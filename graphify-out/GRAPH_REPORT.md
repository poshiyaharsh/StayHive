# Graph Report - StayHive  (2026-09-25)

## Corpus Check
- 196 files · ~122,923 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1426 nodes · 3813 edges · 89 communities (63 shown, 16 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 327 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `eb5ac76a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- useAuth
- database.ts
- accounts/views.py
- bookings/views.py
- useRooms.ts
- useNotification
- compilerOptions
- CustomerViewSet
- package.json
- What You Must Do When Invoked
- test_checkpoint8.py
- api_error
- reports/views.py
- ReceptionDepartureSerializer
- api_response
- compilerOptions
- Booking
- hotels/views.py
- App.tsx
- useReception.ts
- dependencies
- staff/views.py
- ServiceRequestViewSet
- devDependencies
- StayHive Hospitality Platform — Production Deployment Guide
- RoomSerializer
- NotificationViewSet
- graphify reference: extra exports and benchmark
- lucide-react
- BookingWizard.tsx
- get_user_role
- InquiryViewSet
- useBookings.ts
- ComplaintViewSet
- HousekeepingTaskViewSet
- .oxlintrc.json
- graphify reference: query, path, explain
- scripts
- CustomUserManager
- manage.py
- vite.config.ts
- BookingPermission
- test_checkpoint2.py
- test_checkpoint3.py
- tsconfig.json
- StayHive Backend — Django REST Framework & MySQL 8.x / MariaDB
- useRestaurant.ts
- StayHive Frontend — React 19, Vite & Tailwind CSS
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- Customer
- rules/graphify.md
- extraction-spec.md
- workflows/graphify.md
- FoodOrderSerializer
- FoodOrderPermission
- cancellations/views.py
- useHotels.ts
- useHousekeeping.ts
- useSupport.ts
- client.ts
- ServiceRequestPermission
- ServiceRequestSerializer
- ReceptionPermission
- analytics/views.py
- restaurant/views.py
- Header.tsx
- NotificationContext.tsx
- notify_customer
- ReportsConfig
- constants.py
- InvoicesPage.tsx
- AdminDashboard.tsx
- ErrorBoundary
- migration_cp11.py
- gunicorn.conf.py

## God Nodes (most connected - your core abstractions)
1. `api_response()` - 167 edges
2. `api_error()` - 91 edges
3. `Customer` - 66 edges
4. `Booking` - 60 edges
5. `react` - 59 edges
6. `useNotification()` - 51 edges
7. `Staff` - 44 edges
8. `lucide-react` - 44 edges
9. `Room` - 42 edges
10. `useAuth()` - 37 edges

## Surprising Connections (you probably didn't know these)
- `get_token()` --uses--> `User`  [INFERRED]
  backend/test_checkpoint6.py → backend/apps/core/models.py
- `get_user_token()` --uses--> `User`  [INFERRED]
  backend/test_checkpoint9.py → backend/apps/core/models.py
- `authenticate_stayhive_user()` --uses--> `User`  [INFERRED]
  backend/apps/accounts/auth.py → backend/apps/core/models.py
- `RoleSerializer` --uses--> `Role`  [INFERRED]
  backend/apps/accounts/serializers.py → backend/apps/core/models.py
- `UserSerializer` --uses--> `Role`  [INFERRED]
  backend/apps/accounts/serializers.py → backend/apps/core/models.py

## Import Cycles
- None detected.

## Communities (89 total, 16 thin omitted)

### Community 0 - "useAuth"
Cohesion: 0.12
Nodes (24): ProtectedRoute(), ProtectedRouteProps, CustomerDashboard(), AppLayout(), MobileNav(), Sidebar(), SidebarProps, AuthContext (+16 more)

### Community 1 - "database.ts"
Cohesion: 0.10
Nodes (39): DatabaseContext, DatabaseContextType, AnalyticsOverview, ApiResponse, AvailableRoomType, Booking, BookingRoom, BookingStatus (+31 more)

### Community 2 - "accounts/views.py"
Cohesion: 0.14
Nodes (17): authenticate_stayhive_user(), get_tokens_for_user(), Generate JWT access and refresh tokens with user payload., Authenticate against custom User table with password check. Supports standard…, LoginSerializer, Meta, RegisterSerializer, RoleSerializer (+9 more)

### Community 3 - "bookings/views.py"
Cohesion: 0.11
Nodes (15): BookingCreateSerializer, BookingRoomSerializer, CheckInSerializer, Meta, OfferApplicationSerializer, BookingViewSet, CheckInViewSet, BookingRoom (+7 more)

### Community 4 - "useRooms.ts"
Cohesion: 0.16
Nodes (14): RoomGrid(), RoomFilters, useCreateRoom(), useCreateRoomType(), useDeleteRoom(), useDeleteRoomType(), useRooms(), useRoomTypes() (+6 more)

### Community 5 - "useNotification"
Cohesion: 0.08
Nodes (29): DatabaseProvider(), useNotification(), BillingStats, CancellationItem, CreatePaymentPayload, InvoiceFilters, InvoiceItem, PaymentItem (+21 more)

### Community 6 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 7 - "CustomerViewSet"
Cohesion: 0.16
Nodes (7): CustomerProfileSerializer, CustomerSerializer, Meta, CustomerPermission, CustomerViewSet, action, Returns or updates the authenticated customer's own profile.

### Community 8 - "package.json"
Cohesion: 0.10
Nodes (19): name, private, type, version, autoprefixer, canvas-confetti, clsx, oxlint (+11 more)

### Community 9 - "What You Must Do When Invoked"
Cohesion: 0.07
Nodes (26): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+18 more)

### Community 10 - "test_checkpoint8.py"
Cohesion: 0.11
Nodes (40): InvoiceCreateSerializer, Meta, PaymentMethodSerializer, PaymentSerializer, calculate_discount(), calculate_food_charges(), calculate_invoice_totals(), calculate_outstanding_balance() (+32 more)

### Community 11 - "api_error"
Cohesion: 0.15
Nodes (7): custom_exception_handler(), Production-safe DRF exception handler. - Captures and logs all unhandled…, api_error(), Meta, OfferPackageSerializer, OfferPackageViewSet, action

### Community 12 - "reports/views.py"
Cohesion: 0.09
Nodes (26): parse_date_range(), Parses request query params into timezone-aware datetime bounds and date…, get_role_name(), Strict role permissions for operational & management reports: - CUSTOMER: 403…, ReportPermission, export_csv(), get_bookings_report(), get_customers_report() (+18 more)

### Community 13 - "ReceptionDepartureSerializer"
Cohesion: 0.07
Nodes (5): Meta, ReceptionActiveStaySerializer, ReceptionArrivalSerializer, ReceptionDepartureSerializer, RoomStatusBoardSerializer

### Community 14 - "api_response"
Cohesion: 0.11
Nodes (6): api_response(), Standard StayHive API response structure: { "success": true, "message": "...",…, FoodViewSet, CRUD for Hotel Restaurants. - ADMIN, MANAGER: full CRUD - RESTAURANT,…, CRUD for Food Menu Items. - ADMIN, MANAGER, RESTAURANT: full CRUD - RECEPTION,…, RestaurantViewSet

### Community 15 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 16 - "Booking"
Cohesion: 0.21
Nodes (16): Booking, CancellationRequest, Room, CheckInRequestSerializer, CheckOutRequestSerializer, ReceptionCancellationSerializer, ActiveStaysView, ArrivalsView (+8 more)

### Community 17 - "hotels/views.py"
Cohesion: 0.07
Nodes (21): Gallery, HotelFacility, IsAdmin, IsCustomer, IsHousekeeping, IsManager, IsReception, IsRestaurant (+13 more)

### Community 18 - "App.tsx"
Cohesion: 0.14
Nodes (27): App(), queryClient, CommandPalette(), CommandPaletteProps, Badge(), BadgeProps, BadgeVariant, Card() (+19 more)

### Community 19 - "useReception.ts"
Cohesion: 0.14
Nodes (16): ReceptionDashboard(), CheckInPayload, CheckOutPayload, ReceptionActiveStay, ReceptionArrival, ReceptionCancellation, ReceptionDashboardStats, ReceptionDeparture (+8 more)

### Community 20 - "dependencies"
Cohesion: 0.14
Nodes (14): dependencies, axios, canvas-confetti, clsx, framer-motion, lucide-react, react, react-dom (+6 more)

### Community 21 - "staff/views.py"
Cohesion: 0.19
Nodes (8): Department, DepartmentSerializer, DepartmentViewSet, Meta, Staff management permission: - ADMIN, MANAGER: Full access. - RECEPTION: Read-…, StaffPermission, StaffSerializer, StaffViewSet

### Community 22 - "ServiceRequestViewSet"
Cohesion: 0.15
Nodes (5): action, CRUD and status transitions for Guest Service Requests: - ADMIN, MANAGER,…, CRUD for Hotel Services: - ADMIN, MANAGER: Full CRUD - RECEPTION: View services…, ServiceRequestViewSet, ServiceViewSet

### Community 23 - "devDependencies"
Cohesion: 0.17
Nodes (12): devDependencies, autoprefixer, oxlint, postcss, tailwindcss, @types/canvas-confetti, @types/node, @types/react (+4 more)

### Community 24 - "StayHive Hospitality Platform — Production Deployment Guide"
Cohesion: 0.05
Nodes (37): 10. SSL / HTTPS Configuration (Let's Encrypt), 11. Health & Readiness Verification, 12. Automated Database Backup & Disaster Recovery Plan, 13. Security Hardening Checklist, 1. Production Architecture Overview, 2. Server Prerequisites, 3. System Packages Installation, 4. MySQL Production Configuration (+29 more)

### Community 25 - "RoomSerializer"
Cohesion: 0.08
Nodes (13): Public or authenticated endpoint to query available rooms and categories using…, RoomAmenity, Meta, RoomAmenitySerializer, RoomSerializer, RoomTypeSerializer, action, Fast status transition: Available, Occupied, Reserved, Maintenance, Cleaning (+5 more)

### Community 26 - "NotificationViewSet"
Cohesion: 0.15
Nodes (9): Notification, NotificationPermission, Strict Notification Permission: - User must be authenticated. - User can only…, Meta, NotificationSerializer, NotificationPagination, NotificationViewSet, action (+1 more)

### Community 27 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 28 - "lucide-react"
Cohesion: 0.17
Nodes (22): Button(), ButtonProps, EmptyState(), EmptyStateProps, Props, State, Input, InputProps (+14 more)

### Community 29 - "BookingWizard.tsx"
Cohesion: 0.23
Nodes (8): DatePicker(), DatePickerProps, StatusBadge(), StatusBadgeProps, StatusVariant, StepItem, Stepper(), StepperProps

### Community 30 - "get_user_role"
Cohesion: 0.09
Nodes (13): ComplaintPermission, Complaint Permissions: - Customer: Create complaint, view own complaints via…, FeedbackPermission, get_user_role(), Feedback Permissions: - Admin, Manager, Reception: Full view & management…, Resolve user role reliably., FeedbackCreateSerializer, FeedbackSerializer (+5 more)

### Community 31 - "InquiryViewSet"
Cohesion: 0.19
Nodes (8): InquiryCreateSerializer, InquiryReplySerializer, InquirySerializer, Meta, InquiryPagination, InquiryViewSet, action, PageNumberPagination

### Community 32 - "useBookings.ts"
Cohesion: 0.18
Nodes (10): BookingWizard(), AvailabilityParams, BookingFilters, CreateBookingPayload, useAvailability(), useCheckInBooking(), useCheckOutBooking(), useCreateBooking() (+2 more)

### Community 33 - "ComplaintViewSet"
Cohesion: 0.16
Nodes (8): ComplaintCreateSerializer, ComplaintSerializer, ComplaintStatusUpdateSerializer, Meta, ComplaintPagination, ComplaintViewSet, action, PageNumberPagination

### Community 34 - "HousekeepingTaskViewSet"
Cohesion: 0.11
Nodes (9): HousekeepingPermission, Permissions for Housekeeping Tasks: - ADMIN, MANAGER: Full access (create,…, HousekeepingTaskSerializer, Meta, HousekeepingTaskViewSet, action, Room Housekeeping Board with operational and cleanliness statuses., CRUD and status workflows for Housekeeping Tasks: - ADMIN, MANAGER: Full… (+1 more)

### Community 35 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 36 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 37 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 39 - "manage.py"
Cohesion: 0.50
Nodes (3): main(), Django's command-line utility for administrative tasks., Run administrative tasks.

### Community 40 - "vite.config.ts"
Cohesion: 0.50
Nodes (3): @tailwindcss/vite, vite, @vitejs/plugin-react

### Community 52 - "StayHive Backend — Django REST Framework & MySQL 8.x / MariaDB"
Cohesion: 0.33
Nodes (5): 🏛️ Application Architecture, 🔑 Authentication & Role Permissions, ⚙️ MariaDB / MySQL Configuration, 🧪 Running Unit Tests & Verification, StayHive Backend — Django REST Framework & MySQL 8.x / MariaDB

### Community 53 - "useRestaurant.ts"
Cohesion: 0.16
Nodes (18): RestaurantDashboard(), useMyBookings(), CreateFoodOrderPayload, FoodItem, FoodOrderDetail, FoodOrderStats, OrderItemDetail, RestaurantItem (+10 more)

### Community 54 - "StayHive Frontend — React 19, Vite & Tailwind CSS"
Cohesion: 0.40
Nodes (4): 🎨 Design Philosophy & Features, 🛠️ Development & Production Build, 🧭 Project Structure, StayHive Frontend — React 19, Vite & Tailwind CSS

### Community 55 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 56 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 57 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 60 - "Customer"
Cohesion: 0.10
Nodes (16): AbstractBaseUser, Customer, Hotel, HousekeepingTask, Interaction, Meta, Service, ServiceRequest (+8 more)

### Community 64 - "FoodOrderSerializer"
Cohesion: 0.15
Nodes (7): FoodOrderSerializer, action, Create a new food order with atomic transaction, price snapshotting, and strict…, GET /api/food-orders/my/ Returns only the food orders belonging to the…, PATCH /api/food-orders/{id}/status/ Advance order status according to canonical…, POST /api/food-orders/{id}/cancel/ Customer or staff cancels a pending food…, GET /api/food-orders/stats/ Live Kitchen Display System (KDS) & Order…

### Community 65 - "FoodOrderPermission"
Cohesion: 0.18
Nodes (6): FoodMenuPermission, FoodOrderPermission, Permissions for Food Menu items: - Safe methods: Accessible by ADMIN, MANAGER,…, Permissions for Food Orders: - ADMIN, MANAGER, RESTAURANT: Full access to view,…, Permissions for Restaurant management: - Safe methods (GET, HEAD, OPTIONS):…, RestaurantPermission

### Community 66 - "cancellations/views.py"
Cohesion: 0.05
Nodes (31): BillingPermission, get_user_role(), PaymentMethodPermission, Role-based billing permission: - Admin, Manager: Full access. - Reception: Can…, Resolve user role reliably., Payment methods can be read by authenticated users. Only Admin/Manager can…, InvoiceSerializer, PaymentCreateSerializer (+23 more)

### Community 67 - "useHotels.ts"
Cohesion: 0.22
Nodes (7): HotelFilters, useCreateHotel(), useDeleteHotel(), useUpdateHotel(), HotelsPage(), Gallery, HotelFacility

### Community 68 - "useHousekeeping.ts"
Cohesion: 0.23
Nodes (10): HousekeepingDashboard(), CreateHousekeepingTaskPayload, HousekeepingFilters, HousekeepingRoomBoardItem, HousekeepingTaskItem, useCreateHousekeepingTask(), useHousekeepingRoomBoard(), useHousekeepingTasks() (+2 more)

### Community 69 - "useSupport.ts"
Cohesion: 0.12
Nodes (26): complaintApi, ComplaintItem, feedbackApi, FeedbackItem, FeedbackSummary, inquiryApi, InquiryItem, supportApi (+18 more)

### Community 70 - "client.ts"
Cohesion: 0.11
Nodes (12): API_BASE_URL, apiClient, analyticsApi, AnalyticsFilterParams, CustomerFilters, reportApi, ReportFilterParams, ReportResponse (+4 more)

### Community 71 - "ServiceRequestPermission"
Cohesion: 0.25
Nodes (4): Permissions for Service Requests: - ADMIN, MANAGER, RECEPTION: Full management…, Permissions for Service Management: - Safe methods (GET, HEAD, OPTIONS): ADMIN,…, ServicePermission, ServiceRequestPermission

### Community 74 - "analytics/views.py"
Cohesion: 0.18
Nodes (25): AnalyticsPermission, get_role_name(), Role-based permissions for Analytics: - CUSTOMER: 403 Forbidden (No access to…, AnalyticsOverviewView, BookingAnalyticsView, ComplaintAnalyticsView, CustomerAnalyticsView, FeedbackAnalyticsView (+17 more)

### Community 75 - "restaurant/views.py"
Cohesion: 0.13
Nodes (15): Food, FoodOrder, OrderItem, Restaurant, CreateFoodOrderSerializer, CreateOrderItemInputSerializer, FoodSerializer, Meta (+7 more)

### Community 76 - "Header.tsx"
Cohesion: 0.19
Nodes (15): Header(), HeaderProps, Theme, ThemeContext, ThemeContextType, ThemeProvider(), useTheme(), notificationApi (+7 more)

### Community 77 - "NotificationContext.tsx"
Cohesion: 0.33
Nodes (5): NotificationContext, NotificationContextType, NotificationProvider(), Toast, ToastType

### Community 78 - "notify_customer"
Cohesion: 0.11
Nodes (12): BookingSerializer, action, Transactional booking creation with date overlap verification, room auto-…, Returns the authenticated customer's own booking history., create_notification(), notify_customer(), notify_department(), notify_role() (+4 more)

### Community 84 - "InvoicesPage.tsx"
Cohesion: 0.52
Nodes (6): useBillingStats(), useInvoice(), useInvoices(), useMyInvoices(), usePaymentMethods(), InvoicesPage()

### Community 85 - "AdminDashboard.tsx"
Cohesion: 0.47
Nodes (4): AdminDashboard(), StatCard(), StatCardProps, useAnalyticsOverview()

### Community 87 - "migration_cp11.py"
Cohesion: 0.67
Nodes (3): get_existing_indexes(), StayHive — Checkpoint 11 Database Migration Applies safe, performant indexes to…, run_migration()

## Knowledge Gaps
- **263 isolated node(s):** `Meta`, `Meta`, `Meta`, `Meta`, `Meta` (+258 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 551 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `api_response()` connect `api_response` to `accounts/views.py`, `bookings/views.py`, `CustomerViewSet`, `test_checkpoint8.py`, `api_error`, `reports/views.py`, `ReceptionDepartureSerializer`, `Booking`, `hotels/views.py`, `staff/views.py`, `ServiceRequestViewSet`, `RoomSerializer`, `NotificationViewSet`, `get_user_role`, `InquiryViewSet`, `ComplaintViewSet`, `HousekeepingTaskViewSet`, `Customer`, `FoodOrderSerializer`, `cancellations/views.py`, `analytics/views.py`, `restaurant/views.py`, `notify_customer`?**
  _High betweenness centrality (0.111) - this node is a cross-community bridge._
- **Why does `Customer` connect `Customer` to `ComplaintViewSet`, `accounts/views.py`, `bookings/views.py`, `cancellations/views.py`, `CustomerViewSet`, `test_checkpoint8.py`, `analytics/views.py`, `reports/views.py`, `restaurant/views.py`, `notify_customer`, `Booking`, `ServiceRequestViewSet`, `get_user_role`, `InquiryViewSet`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `api_error()` connect `api_error` to `accounts/views.py`, `bookings/views.py`, `CustomerViewSet`, `test_checkpoint8.py`, `reports/views.py`, `api_response`, `Booking`, `hotels/views.py`, `ServiceRequestViewSet`, `RoomSerializer`, `NotificationViewSet`, `get_user_role`, `InquiryViewSet`, `ComplaintViewSet`, `HousekeepingTaskViewSet`, `Customer`, `FoodOrderSerializer`, `cancellations/views.py`, `analytics/views.py`, `restaurant/views.py`, `notify_customer`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Are the 25 inferred relationships involving `Customer` (e.g. with `RegisterView` and `AnalyticsOverviewView`) actually correct?**
  _`Customer` has 25 INFERRED edges - model-reasoned connections that need verification._
- **Are the 28 inferred relationships involving `Booking` (e.g. with `AnalyticsOverviewView` and `BookingAnalyticsView`) actually correct?**
  _`Booking` has 28 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Meta`, `Meta`, `Meta` to the rest of the system?**
  _263 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `useAuth` be split into smaller, more focused modules?**
  _Cohesion score 0.12298387096774194 - nodes in this community are weakly interconnected._