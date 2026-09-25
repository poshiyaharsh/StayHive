# Graph Report - StayHive  (2026-09-25)

## Corpus Check
- 190 files · ~116,562 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1373 nodes · 3716 edges · 84 communities (60 shown, 14 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 327 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5f5d71b4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- useAuth
- database.ts
- accounts/views.py
- Booking
- RoomGrid.tsx
- useNotification
- compilerOptions
- CustomerViewSet
- package.json
- What You Must Do When Invoked
- test_checkpoint8.py
- offers/views.py
- reports/services.py
- BookingSerializer
- api_response
- compilerOptions
- ._do_cancel
- hotels/views.py
- App.tsx
- useReception.ts
- dependencies
- staff/views.py
- ServiceRequestViewSet
- devDependencies
- StayHive — Production-Grade Hotel Management & Booking Platform
- RoomSerializer
- NotificationViewSet
- graphify reference: extra exports and benchmark
- react
- BookingWizard.tsx
- feedback/views.py
- get_user_role
- useBookings.ts
- ComplaintViewSet
- api_error
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
- FoodOrderViewSet
- FoodOrderPermission
- get_user_role
- ServicesPage.tsx
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
- test_checkpoint10.py
- ReportsConfig
- constants.py

## God Nodes (most connected - your core abstractions)
1. `api_response()` - 167 edges
2. `api_error()` - 87 edges
3. `Customer` - 65 edges
4. `Booking` - 59 edges
5. `react` - 58 edges
6. `useNotification()` - 51 edges
7. `Staff` - 43 edges
8. `lucide-react` - 43 edges
9. `Room` - 41 edges
10. `useAuth()` - 37 edges

## Surprising Connections (you probably didn't know these)
- `get_token()` --uses--> `User`  [INFERRED]
  backend/test_checkpoint6.py → backend/apps/core/models.py
- `authenticate_stayhive_user()` --uses--> `User`  [INFERRED]
  backend/apps/accounts/auth.py → backend/apps/core/models.py
- `RoleSerializer` --uses--> `Role`  [INFERRED]
  backend/apps/accounts/serializers.py → backend/apps/core/models.py
- `UserSerializer` --uses--> `Role`  [INFERRED]
  backend/apps/accounts/serializers.py → backend/apps/core/models.py
- `UserSerializer` --uses--> `User`  [INFERRED]
  backend/apps/accounts/serializers.py → backend/apps/core/models.py

## Import Cycles
- None detected.

## Communities (84 total, 14 thin omitted)

### Community 0 - "useAuth"
Cohesion: 0.12
Nodes (23): ProtectedRoute(), ProtectedRouteProps, AdminDashboard(), CustomerDashboard(), Sidebar(), SidebarProps, AuthContext, AuthContextType (+15 more)

### Community 1 - "database.ts"
Cohesion: 0.08
Nodes (42): DatabaseContext, DatabaseContextType, HotelFilters, AnalyticsOverview, ApiResponse, AvailableRoomType, Booking, BookingRoom (+34 more)

### Community 2 - "accounts/views.py"
Cohesion: 0.15
Nodes (16): authenticate_stayhive_user(), get_tokens_for_user(), Generate JWT access and refresh tokens with user payload., Authenticate against custom User table with password check. Supports standard…, LoginSerializer, Meta, RegisterSerializer, RoleSerializer (+8 more)

### Community 3 - "Booking"
Cohesion: 0.11
Nodes (20): BookingCreateSerializer, BookingRoomSerializer, CheckInSerializer, Meta, OfferApplicationSerializer, BookingViewSet, CheckInViewSet, CancellationRequestCreateSerializer (+12 more)

### Community 4 - "RoomGrid.tsx"
Cohesion: 0.12
Nodes (25): RoomGrid(), EmptyState(), EmptyStateProps, SearchInput(), SearchInputProps, Skeleton(), SkeletonProps, useCreateHotel() (+17 more)

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
Cohesion: 0.09
Nodes (45): InvoiceCreateSerializer, InvoiceSerializer, Meta, PaymentCreateSerializer, PaymentMethodSerializer, PaymentSerializer, calculate_discount(), calculate_food_charges() (+37 more)

### Community 11 - "offers/views.py"
Cohesion: 0.25
Nodes (4): Meta, OfferPackageSerializer, OfferPackageViewSet, action

### Community 12 - "reports/services.py"
Cohesion: 0.11
Nodes (27): parse_date_range(), Parses request query params into timezone-aware datetime bounds and date…, get_role_name(), Strict role permissions for operational & management reports: - CUSTOMER: 403…, ReportPermission, export_csv(), get_bookings_report(), get_customers_report() (+19 more)

### Community 13 - "BookingSerializer"
Cohesion: 0.06
Nodes (15): BookingSerializer, Meta, ReceptionActiveStaySerializer, ReceptionArrivalSerializer, ReceptionCancellationSerializer, ReceptionDepartureSerializer, RoomStatusBoardSerializer, ActiveStaysView (+7 more)

### Community 14 - "api_response"
Cohesion: 0.09
Nodes (6): api_response(), Standard StayHive API response structure: { "success": true, "message": "...",…, FoodViewSet, CRUD for Hotel Restaurants. - ADMIN, MANAGER: full CRUD - RESTAURANT,…, CRUD for Food Menu Items. - ADMIN, MANAGER, RESTAURANT: full CRUD - RECEPTION,…, RestaurantViewSet

### Community 15 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 16 - "._do_cancel"
Cohesion: 0.22
Nodes (3): action, Public or authenticated endpoint to query available rooms and categories using…, Returns the authenticated customer's own booking history.

### Community 17 - "hotels/views.py"
Cohesion: 0.07
Nodes (21): Gallery, HotelFacility, IsAdmin, IsCustomer, IsHousekeeping, IsManager, IsReception, IsRestaurant (+13 more)

### Community 18 - "App.tsx"
Cohesion: 0.10
Nodes (25): App(), queryClient, AppLayout(), CommandPalette(), CommandPaletteProps, MobileNav(), useDatabase(), useBooking() (+17 more)

### Community 19 - "useReception.ts"
Cohesion: 0.14
Nodes (16): ReceptionDashboard(), CheckInPayload, CheckOutPayload, ReceptionActiveStay, ReceptionArrival, ReceptionCancellation, ReceptionDashboardStats, ReceptionDeparture (+8 more)

### Community 20 - "dependencies"
Cohesion: 0.14
Nodes (14): dependencies, axios, canvas-confetti, clsx, framer-motion, lucide-react, react, react-dom (+6 more)

### Community 21 - "staff/views.py"
Cohesion: 0.25
Nodes (6): Department, DepartmentSerializer, DepartmentViewSet, Meta, StaffSerializer, StaffViewSet

### Community 22 - "ServiceRequestViewSet"
Cohesion: 0.15
Nodes (5): action, CRUD and status transitions for Guest Service Requests: - ADMIN, MANAGER,…, CRUD for Hotel Services: - ADMIN, MANAGER: Full CRUD - RECEPTION: View services…, ServiceRequestViewSet, ServiceViewSet

### Community 23 - "devDependencies"
Cohesion: 0.17
Nodes (12): devDependencies, autoprefixer, oxlint, postcss, tailwindcss, @types/canvas-confetti, @types/node, @types/react (+4 more)

### Community 24 - "StayHive — Production-Grade Hotel Management & Booking Platform"
Cohesion: 0.13
Nodes (14): 🏗️ Architecture & Technology Stack, 🗄️ Database Schema (33 Interconnected Tables), 👥 Default User Personas & Credentials, 🌟 Key Features, 📄 License, Luxury Design & Experience, Multi-Persona Architecture, Prerequisites (+6 more)

### Community 25 - "RoomSerializer"
Cohesion: 0.08
Nodes (12): RoomAmenity, Meta, RoomAmenitySerializer, RoomSerializer, RoomTypeSerializer, action, Fast status transition: Available, Occupied, Reserved, Maintenance, Cleaning, RoomAmenityViewSet (+4 more)

### Community 26 - "NotificationViewSet"
Cohesion: 0.15
Nodes (9): Notification, NotificationPermission, Strict Notification Permission: - User must be authenticated. - User can only…, Meta, NotificationSerializer, NotificationPagination, NotificationViewSet, action (+1 more)

### Community 27 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 28 - "react"
Cohesion: 0.26
Nodes (15): StatCard(), StatCardProps, Badge(), BadgeProps, BadgeVariant, Button(), ButtonProps, Card() (+7 more)

### Community 29 - "BookingWizard.tsx"
Cohesion: 0.17
Nodes (11): DatePicker(), DatePickerProps, Select(), SelectOption, SelectProps, StatusBadge(), StatusBadgeProps, StatusVariant (+3 more)

### Community 30 - "feedback/views.py"
Cohesion: 0.13
Nodes (9): FeedbackCreateSerializer, FeedbackSerializer, Meta, FeedbackPagination, FeedbackViewSet, action, APIView, PageNumberPagination (+1 more)

### Community 31 - "get_user_role"
Cohesion: 0.09
Nodes (17): ComplaintPermission, Complaint Permissions: - Customer: Create complaint, view own complaints via…, Inquiry, FeedbackPermission, get_user_role(), Feedback Permissions: - Admin, Manager, Reception: Full view & management…, Resolve user role reliably., InquiryPermission (+9 more)

### Community 32 - "useBookings.ts"
Cohesion: 0.18
Nodes (10): BookingWizard(), AvailabilityParams, BookingFilters, CreateBookingPayload, useAvailability(), useCheckInBooking(), useCheckOutBooking(), useCreateBooking() (+2 more)

### Community 33 - "ComplaintViewSet"
Cohesion: 0.17
Nodes (9): ComplaintCreateSerializer, ComplaintSerializer, ComplaintStatusUpdateSerializer, Meta, ComplaintPagination, ComplaintViewSet, action, PageNumberPagination (+1 more)

### Community 34 - "api_error"
Cohesion: 0.09
Nodes (14): Transactional booking creation with date overlap verification, room auto-…, Customer or staff creates a cancellation request., api_error(), HousekeepingPermission, Permissions for Housekeeping Tasks: - ADMIN, MANAGER: Full access (create,…, HousekeepingTaskSerializer, Meta, HousekeepingTaskViewSet (+6 more)

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
Cohesion: 0.14
Nodes (16): RestaurantDashboard(), CreateFoodOrderPayload, FoodItem, FoodOrderDetail, FoodOrderStats, OrderItemDetail, RestaurantItem, useCancelFoodOrder() (+8 more)

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
Nodes (23): AbstractBaseUser, Customer, Hotel, HousekeepingTask, Interaction, Meta, OfferPackage, Role (+15 more)

### Community 64 - "FoodOrderViewSet"
Cohesion: 0.12
Nodes (11): CreateFoodOrderSerializer, FoodOrderSerializer, UpdateOrderStatusSerializer, FoodOrderViewSet, action, Food Order operations with strict transactional safety, price snapshotting,…, Create a new food order with atomic transaction, price snapshotting, and strict…, GET /api/food-orders/my/ Returns only the food orders belonging to the… (+3 more)

### Community 65 - "FoodOrderPermission"
Cohesion: 0.18
Nodes (6): FoodMenuPermission, FoodOrderPermission, Permissions for Food Menu items: - Safe methods: Accessible by ADMIN, MANAGER,…, Permissions for Food Orders: - ADMIN, MANAGER, RESTAURANT: Full access to view,…, Permissions for Restaurant management: - Safe methods (GET, HEAD, OPTIONS):…, RestaurantPermission

### Community 66 - "get_user_role"
Cohesion: 0.08
Nodes (18): BillingPermission, get_user_role(), PaymentMethodPermission, Role-based billing permission: - Admin, Manager: Full access. - Reception: Can…, Resolve user role reliably., Payment methods can be read by authenticated users. Only Admin/Manager can…, PaymentMethodViewSet, PaymentViewSet (+10 more)

### Community 67 - "ServicesPage.tsx"
Cohesion: 0.20
Nodes (16): useMyBookings(), CreateServiceRequestPayload, ServiceFilters, ServiceItem, ServiceRequestFilters, ServiceRequestItem, useCancelServiceRequest(), useCreateService() (+8 more)

### Community 68 - "useHousekeeping.ts"
Cohesion: 0.23
Nodes (10): HousekeepingDashboard(), CreateHousekeepingTaskPayload, HousekeepingFilters, HousekeepingRoomBoardItem, HousekeepingTaskItem, useCreateHousekeepingTask(), useHousekeepingRoomBoard(), useHousekeepingTasks() (+2 more)

### Community 69 - "useSupport.ts"
Cohesion: 0.11
Nodes (28): Input, InputProps, complaintApi, ComplaintItem, feedbackApi, FeedbackItem, FeedbackSummary, inquiryApi (+20 more)

### Community 70 - "client.ts"
Cohesion: 0.11
Nodes (12): API_BASE_URL, apiClient, analyticsApi, AnalyticsFilterParams, CustomerFilters, reportApi, ReportFilterParams, ReportResponse (+4 more)

### Community 71 - "ServiceRequestPermission"
Cohesion: 0.25
Nodes (4): Permissions for Service Requests: - ADMIN, MANAGER, RECEPTION: Full management…, Permissions for Service Management: - Safe methods (GET, HEAD, OPTIONS): ADMIN,…, ServicePermission, ServiceRequestPermission

### Community 74 - "analytics/views.py"
Cohesion: 0.26
Nodes (18): AnalyticsPermission, get_role_name(), Role-based permissions for Analytics: - CUSTOMER: 403 Forbidden (No access to…, AnalyticsOverviewView, BookingAnalyticsView, ComplaintAnalyticsView, CustomerAnalyticsView, FeedbackAnalyticsView (+10 more)

### Community 75 - "restaurant/views.py"
Cohesion: 0.16
Nodes (11): Food, FoodOrder, OrderItem, Restaurant, CreateOrderItemInputSerializer, FoodSerializer, Meta, OrderItemSerializer (+3 more)

### Community 76 - "Header.tsx"
Cohesion: 0.19
Nodes (15): Header(), HeaderProps, Theme, ThemeContext, ThemeContextType, ThemeProvider(), useTheme(), notificationApi (+7 more)

### Community 77 - "NotificationContext.tsx"
Cohesion: 0.33
Nodes (5): NotificationContext, NotificationContextType, NotificationProvider(), Toast, ToastType

### Community 78 - "test_checkpoint10.py"
Cohesion: 0.22
Nodes (7): create_notification(), notify_customer(), notify_department(), notify_users(), Central, safe, and deduplicated notification creator., Notify staff members belonging to a department (e.g. 'Restaurant',…, STAYHIVE — CHECKPOINT 10: NOTIFICATIONS + ANALYTICS + REPORTS TEST SUITE…

## Knowledge Gaps
- **241 isolated node(s):** `Meta`, `Meta`, `Meta`, `Meta`, `Meta` (+236 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 515 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `api_response()` connect `api_response` to `accounts/views.py`, `Booking`, `CustomerViewSet`, `test_checkpoint8.py`, `offers/views.py`, `reports/services.py`, `BookingSerializer`, `._do_cancel`, `hotels/views.py`, `staff/views.py`, `ServiceRequestViewSet`, `RoomSerializer`, `NotificationViewSet`, `feedback/views.py`, `get_user_role`, `ComplaintViewSet`, `api_error`, `Customer`, `FoodOrderViewSet`, `get_user_role`, `analytics/views.py`, `restaurant/views.py`, `test_checkpoint10.py`?**
  _High betweenness centrality (0.116) - this node is a cross-community bridge._
- **Why does `Customer` connect `Customer` to `FoodOrderViewSet`, `ComplaintViewSet`, `accounts/views.py`, `Booking`, `get_user_role`, `CustomerViewSet`, `test_checkpoint8.py`, `analytics/views.py`, `reports/services.py`, `restaurant/views.py`, `test_checkpoint10.py`, `ServiceRequestViewSet`, `feedback/views.py`, `get_user_role`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `api_error()` connect `api_error` to `accounts/views.py`, `Booking`, `CustomerViewSet`, `test_checkpoint8.py`, `offers/views.py`, `reports/services.py`, `BookingSerializer`, `api_response`, `._do_cancel`, `hotels/views.py`, `ServiceRequestViewSet`, `RoomSerializer`, `NotificationViewSet`, `feedback/views.py`, `get_user_role`, `ComplaintViewSet`, `Customer`, `FoodOrderViewSet`, `get_user_role`, `analytics/views.py`, `restaurant/views.py`, `test_checkpoint10.py`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Are the 25 inferred relationships involving `Customer` (e.g. with `RegisterView` and `AnalyticsOverviewView`) actually correct?**
  _`Customer` has 25 INFERRED edges - model-reasoned connections that need verification._
- **Are the 28 inferred relationships involving `Booking` (e.g. with `AnalyticsOverviewView` and `BookingAnalyticsView`) actually correct?**
  _`Booking` has 28 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Meta`, `Meta`, `Meta` to the rest of the system?**
  _241 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `useAuth` be split into smaller, more focused modules?**
  _Cohesion score 0.1206896551724138 - nodes in this community are weakly interconnected._