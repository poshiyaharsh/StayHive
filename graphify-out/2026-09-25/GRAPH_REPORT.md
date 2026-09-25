# Graph Report - StayHive  (2026-09-25)

## Corpus Check
- 197 files · ~126,160 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1436 nodes · 3853 edges · 97 communities (62 shown, 24 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 327 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8126c099`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- useAuth
- database.ts
- accounts/views.py
- Room
- useRooms.ts
- useNotification
- compilerOptions
- CustomerViewSet
- package.json
- What You Must Do When Invoked
- test_checkpoint8.py
- OfferPackageViewSet
- reports/services.py
- ReceptionDepartureSerializer
- api_response
- compilerOptions
- reception/views.py
- hotels/views.py
- App.tsx
- ReceptionDashboard.tsx
- dependencies
- Booking
- ServiceRequestViewSet
- devDependencies
- StayHive Hospitality Platform — Production Deployment Guide
- api_error
- NotificationViewSet
- graphify reference: extra exports and benchmark
- react
- BookingWizard.tsx
- get_user_role
- RoomSerializer
- useBookings.ts
- ComplaintViewSet
- notify_role
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
- HousekeepingDashboard.tsx
- useSupport.ts
- client.ts
- ServiceRequestPermission
- ServiceRequestSerializer
- RoomGrid.tsx
- analytics/views.py
- restaurant/views.py
- Header.tsx
- useServices.ts
- notify_customer
- ReportsConfig
- constants.py
- ReceptionActiveStaySerializer
- ReceptionArrivalSerializer
- ErrorBoundary
- migration_cp11.py
- gunicorn.conf.py
- reception/urls.py
- RoomStatusBoardSerializer
- ReceptionCancellationSerializer
- test_checkpoint12.py
- CheckInPermission
- OfferPermission
- CSVRenderer

## God Nodes (most connected - your core abstractions)
1. `api_response()` - 167 edges
2. `api_error()` - 91 edges
3. `Customer` - 67 edges
4. `Booking` - 61 edges
5. `react` - 59 edges
6. `useNotification()` - 51 edges
7. `Staff` - 45 edges
8. `lucide-react` - 44 edges
9. `Room` - 43 edges
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

## Communities (97 total, 24 thin omitted)

### Community 0 - "useAuth"
Cohesion: 0.12
Nodes (25): ProtectedRoute(), ProtectedRouteProps, CustomerDashboard(), AppLayout(), CommandPalette(), CommandPaletteProps, MobileNav(), Sidebar() (+17 more)

### Community 1 - "database.ts"
Cohesion: 0.10
Nodes (39): DatabaseContext, DatabaseContextType, AnalyticsOverview, ApiResponse, AvailableRoomType, Booking, BookingRoom, BookingStatus (+31 more)

### Community 2 - "accounts/views.py"
Cohesion: 0.14
Nodes (17): authenticate_stayhive_user(), get_tokens_for_user(), Generate JWT access and refresh tokens with user payload., Authenticate against custom User table with password check. Supports standard…, LoginSerializer, Meta, RegisterSerializer, RoleSerializer (+9 more)

### Community 3 - "Room"
Cohesion: 0.15
Nodes (18): BookingCreateSerializer, BookingRoomSerializer, CheckInSerializer, Meta, OfferApplicationSerializer, BookingViewSet, CheckInViewSet, BookingRoom (+10 more)

### Community 4 - "useRooms.ts"
Cohesion: 0.21
Nodes (8): RoomGrid(), RoomFilters, useCreateRoom(), useDeleteRoom(), useUpdateRoom(), useUpdateRoomStatus(), RoomAmenity, RoomStatus

### Community 5 - "useNotification"
Cohesion: 0.11
Nodes (21): DatabaseProvider(), useNotification(), BillingStats, CancellationItem, CreatePaymentPayload, InvoiceFilters, InvoiceItem, PaymentItem (+13 more)

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
Cohesion: 0.10
Nodes (44): InvoiceCreateSerializer, InvoiceSerializer, Meta, PaymentMethodSerializer, PaymentSerializer, calculate_discount(), calculate_food_charges(), calculate_invoice_totals() (+36 more)

### Community 12 - "reports/services.py"
Cohesion: 0.13
Nodes (23): get_role_name(), Strict role permissions for operational & management reports: - CUSTOMER: 403…, ReportPermission, export_csv(), get_bookings_report(), get_customers_report(), get_food_report(), get_housekeeping_report() (+15 more)

### Community 14 - "api_response"
Cohesion: 0.10
Nodes (8): parse_date_range(), Parses request query params into timezone-aware datetime bounds and date…, api_response(), Standard StayHive API response structure: { "success": true, "message": "...",…, FoodViewSet, CRUD for Hotel Restaurants. - ADMIN, MANAGER: full CRUD - RESTAURANT,…, CRUD for Food Menu Items. - ADMIN, MANAGER, RESTAURANT: full CRUD - RECEPTION,…, RestaurantViewSet

### Community 15 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 16 - "reception/views.py"
Cohesion: 0.29
Nodes (6): CheckInRequestSerializer, CheckOutRequestSerializer, CheckInView, CheckOutView, Ensures only FRONT DESK (RECEPTION, MANAGER, ADMIN) can access reception…, ReceptionPermission

### Community 17 - "hotels/views.py"
Cohesion: 0.07
Nodes (21): Gallery, HotelFacility, IsAdmin, IsCustomer, IsHousekeeping, IsManager, IsReception, IsRestaurant (+13 more)

### Community 18 - "App.tsx"
Cohesion: 0.13
Nodes (20): App(), queryClient, AdminDashboard(), useDatabase(), useAnalyticsOverview(), useBooking(), useCancelBooking(), useCustomers() (+12 more)

### Community 19 - "ReceptionDashboard.tsx"
Cohesion: 0.17
Nodes (19): ReceptionDashboard(), useHotels(), CheckInPayload, CheckOutPayload, ReceptionActiveStay, ReceptionArrival, ReceptionCancellation, ReceptionDashboardStats (+11 more)

### Community 20 - "dependencies"
Cohesion: 0.14
Nodes (14): dependencies, axios, canvas-confetti, clsx, framer-motion, lucide-react, react, react-dom (+6 more)

### Community 21 - "Booking"
Cohesion: 0.11
Nodes (14): ComplaintStatusUpdateSerializer, ComplaintPagination, PageNumberPagination, Booking, Complaint, Feedback, Inquiry, FeedbackPagination (+6 more)

### Community 22 - "ServiceRequestViewSet"
Cohesion: 0.14
Nodes (5): action, CRUD and status transitions for Guest Service Requests: - ADMIN, MANAGER,…, CRUD for Hotel Services: - ADMIN, MANAGER: Full CRUD - RECEPTION: View services…, ServiceRequestViewSet, ServiceViewSet

### Community 23 - "devDependencies"
Cohesion: 0.17
Nodes (12): devDependencies, autoprefixer, oxlint, postcss, tailwindcss, @types/canvas-confetti, @types/node, @types/react (+4 more)

### Community 24 - "StayHive Hospitality Platform — Production Deployment Guide"
Cohesion: 0.05
Nodes (36): 10. SSL / HTTPS Configuration (Let's Encrypt), 11. Health & Readiness Verification, 12. Automated Database Backup & Disaster Recovery Plan, 13. Security Hardening Checklist, 1. Production Architecture Overview, 2. Server Prerequisites, 3. System Packages Installation, 4. MySQL Production Configuration (+28 more)

### Community 25 - "api_error"
Cohesion: 0.09
Nodes (8): custom_exception_handler(), Production-safe DRF exception handler. - Captures and logs all unhandled…, api_error(), action, Fast status transition: Available, Occupied, Reserved, Maintenance, Cleaning, RoomAmenityViewSet, RoomTypeViewSet, RoomViewSet

### Community 26 - "NotificationViewSet"
Cohesion: 0.15
Nodes (9): Notification, NotificationPermission, Strict Notification Permission: - User must be authenticated. - User can only…, Meta, NotificationSerializer, NotificationPagination, NotificationViewSet, action (+1 more)

### Community 27 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 28 - "react"
Cohesion: 0.20
Nodes (19): Badge(), BadgeProps, BadgeVariant, Button(), ButtonProps, Card(), CardProps, EmptyStateProps (+11 more)

### Community 29 - "BookingWizard.tsx"
Cohesion: 0.12
Nodes (18): BookingWizard(), StatCard(), StatCardProps, DatePicker(), DatePickerProps, Select(), SelectOption, SelectProps (+10 more)

### Community 30 - "get_user_role"
Cohesion: 0.06
Nodes (21): ComplaintPermission, Complaint Permissions: - Customer: Create complaint, view own complaints via…, FeedbackPermission, get_user_role(), Feedback Permissions: - Admin, Manager, Reception: Full view & management…, Resolve user role reliably., FeedbackCreateSerializer, FeedbackSerializer (+13 more)

### Community 31 - "RoomSerializer"
Cohesion: 0.13
Nodes (8): Public or authenticated endpoint to query available rooms and categories using…, RoomAmenity, Meta, RoomAmenitySerializer, RoomSerializer, RoomTypeSerializer, RoomPermission, RoomTypePermission

### Community 32 - "useBookings.ts"
Cohesion: 0.13
Nodes (11): NotificationContext, NotificationContextType, NotificationProvider(), Toast, ToastType, AvailabilityParams, BookingFilters, CreateBookingPayload (+3 more)

### Community 33 - "ComplaintViewSet"
Cohesion: 0.21
Nodes (5): ComplaintCreateSerializer, ComplaintSerializer, Meta, ComplaintViewSet, action

### Community 34 - "notify_role"
Cohesion: 0.06
Nodes (22): Department, HousekeepingPermission, Permissions for Housekeeping Tasks: - ADMIN, MANAGER: Full access (create,…, HousekeepingTaskSerializer, Meta, HousekeepingTaskViewSet, action, Room Housekeeping Board with operational and cleanliness statuses. (+14 more)

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
Cohesion: 0.09
Nodes (15): AbstractBaseUser, PaymentMethodPermission, Payment methods can be read by authenticated users. Only Admin/Manager can…, Customer, Hotel, Service, ServiceRequest, Staff (+7 more)

### Community 64 - "FoodOrderSerializer"
Cohesion: 0.15
Nodes (7): FoodOrderSerializer, action, Create a new food order with atomic transaction, price snapshotting, and strict…, GET /api/food-orders/my/ Returns only the food orders belonging to the…, PATCH /api/food-orders/{id}/status/ Advance order status according to canonical…, POST /api/food-orders/{id}/cancel/ Customer or staff cancels a pending food…, GET /api/food-orders/stats/ Live Kitchen Display System (KDS) & Order…

### Community 65 - "FoodOrderPermission"
Cohesion: 0.18
Nodes (6): FoodMenuPermission, FoodOrderPermission, Permissions for Food Menu items: - Safe methods: Accessible by ADMIN, MANAGER,…, Permissions for Food Orders: - ADMIN, MANAGER, RESTAURANT: Full access to view,…, Permissions for Restaurant management: - Safe methods (GET, HEAD, OPTIONS):…, RestaurantPermission

### Community 66 - "cancellations/views.py"
Cohesion: 0.06
Nodes (26): BillingPermission, get_user_role(), Role-based billing permission: - Admin, Manager: Full access. - Reception: Can…, Resolve user role reliably., PaymentCreateSerializer, InvoiceViewSet, PaymentViewSet, action (+18 more)

### Community 67 - "useHotels.ts"
Cohesion: 0.22
Nodes (7): HotelFilters, useCreateHotel(), useDeleteHotel(), useUpdateHotel(), HotelsPage(), Gallery, HotelFacility

### Community 68 - "HousekeepingDashboard.tsx"
Cohesion: 0.36
Nodes (8): HousekeepingDashboard(), useCreateHousekeepingTask(), useHousekeepingRoomBoard(), useHousekeepingTasks(), useMyHousekeepingTasks(), useUpdateHousekeepingTaskStatus(), useRooms(), HousekeepingPage()

### Community 69 - "useSupport.ts"
Cohesion: 0.11
Nodes (28): Input, InputProps, complaintApi, ComplaintItem, feedbackApi, FeedbackItem, FeedbackSummary, inquiryApi (+20 more)

### Community 70 - "client.ts"
Cohesion: 0.09
Nodes (14): API_BASE_URL, apiClient, analyticsApi, AnalyticsFilterParams, CustomerFilters, CreateHousekeepingTaskPayload, HousekeepingFilters, HousekeepingRoomBoardItem (+6 more)

### Community 71 - "ServiceRequestPermission"
Cohesion: 0.25
Nodes (4): Permissions for Service Requests: - ADMIN, MANAGER, RECEPTION: Full management…, Permissions for Service Management: - Safe methods (GET, HEAD, OPTIONS): ADMIN,…, ServicePermission, ServiceRequestPermission

### Community 73 - "RoomGrid.tsx"
Cohesion: 0.26
Nodes (10): EmptyState(), Modal(), ModalProps, Skeleton(), SkeletonProps, useCreateRoomType(), useDeleteRoomType(), useRoomTypes() (+2 more)

### Community 74 - "analytics/views.py"
Cohesion: 0.28
Nodes (17): AnalyticsPermission, get_role_name(), Role-based permissions for Analytics: - CUSTOMER: 403 Forbidden (No access to…, AnalyticsOverviewView, BookingAnalyticsView, ComplaintAnalyticsView, CustomerAnalyticsView, FeedbackAnalyticsView (+9 more)

### Community 75 - "restaurant/views.py"
Cohesion: 0.13
Nodes (15): Food, FoodOrder, OrderItem, Restaurant, CreateFoodOrderSerializer, CreateOrderItemInputSerializer, FoodSerializer, Meta (+7 more)

### Community 76 - "Header.tsx"
Cohesion: 0.19
Nodes (15): Header(), HeaderProps, Theme, ThemeContext, ThemeContextType, ThemeProvider(), useTheme(), notificationApi (+7 more)

### Community 77 - "useServices.ts"
Cohesion: 0.18
Nodes (12): CreateServiceRequestPayload, ServiceFilters, ServiceItem, ServiceRequestFilters, ServiceRequestItem, useCancelServiceRequest(), useCreateService(), useCreateServiceRequest() (+4 more)

### Community 78 - "notify_customer"
Cohesion: 0.14
Nodes (7): BookingSerializer, action, Transactional booking creation with date overlap verification, room auto-…, Returns the authenticated customer's own booking history., notify_customer(), notify_department(), Notify staff members belonging to a department (e.g. 'Restaurant',…

### Community 87 - "migration_cp11.py"
Cohesion: 0.67
Nodes (3): get_existing_indexes(), StayHive — Checkpoint 11 Database Migration Applies safe, performant indexes to…, run_migration()

### Community 89 - "reception/urls.py"
Cohesion: 0.32
Nodes (4): ActiveStaysView, ArrivalsView, APIView, ReceptionSearchView

### Community 90 - "RoomStatusBoardSerializer"
Cohesion: 0.33
Nodes (3): Meta, RoomStatusBoardSerializer, RoomStatusBoardView

## Knowledge Gaps
- **262 isolated node(s):** `Meta`, `Meta`, `Meta`, `Meta`, `Meta` (+257 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 558 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `api_response()` connect `api_response` to `accounts/views.py`, `Room`, `CustomerViewSet`, `test_checkpoint8.py`, `OfferPackageViewSet`, `reports/services.py`, `ReceptionDepartureSerializer`, `reception/views.py`, `hotels/views.py`, `Booking`, `ServiceRequestViewSet`, `api_error`, `NotificationViewSet`, `get_user_role`, `RoomSerializer`, `ComplaintViewSet`, `notify_role`, `Customer`, `FoodOrderSerializer`, `cancellations/views.py`, `analytics/views.py`, `restaurant/views.py`, `notify_customer`, `ReceptionArrivalSerializer`, `reception/urls.py`, `RoomStatusBoardSerializer`, `ReceptionCancellationSerializer`, `.get_queryset`?**
  _High betweenness centrality (0.112) - this node is a cross-community bridge._
- **Why does `Customer` connect `Customer` to `ComplaintViewSet`, `accounts/views.py`, `Room`, `cancellations/views.py`, `notify_role`, `CustomerViewSet`, `test_checkpoint8.py`, `analytics/views.py`, `reports/services.py`, `restaurant/views.py`, `reception/views.py`, `Booking`, `ServiceRequestViewSet`, `test_checkpoint12.py`, `get_user_role`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `api_error()` connect `api_error` to `accounts/views.py`, `Room`, `CustomerViewSet`, `test_checkpoint8.py`, `OfferPackageViewSet`, `reports/services.py`, `api_response`, `reception/views.py`, `hotels/views.py`, `Booking`, `ServiceRequestViewSet`, `NotificationViewSet`, `get_user_role`, `RoomSerializer`, `ComplaintViewSet`, `notify_role`, `Customer`, `FoodOrderSerializer`, `cancellations/views.py`, `analytics/views.py`, `restaurant/views.py`, `notify_customer`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Are the 25 inferred relationships involving `Customer` (e.g. with `RegisterView` and `AnalyticsOverviewView`) actually correct?**
  _`Customer` has 25 INFERRED edges - model-reasoned connections that need verification._
- **Are the 28 inferred relationships involving `Booking` (e.g. with `AnalyticsOverviewView` and `BookingAnalyticsView`) actually correct?**
  _`Booking` has 28 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Meta`, `Meta`, `Meta` to the rest of the system?**
  _262 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `useAuth` be split into smaller, more focused modules?**
  _Cohesion score 0.11942959001782531 - nodes in this community are weakly interconnected._