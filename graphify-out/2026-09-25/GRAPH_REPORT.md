# Graph Report - StayHive  (2026-09-24)

## Corpus Check
- 173 files · ~105,659 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1240 nodes · 3267 edges · 80 communities (61 shown, 11 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 271 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ab16664b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- useAuth
- database.ts
- Role
- test_checkpoint8.py
- useRooms.ts
- useNotification
- compilerOptions
- CustomerViewSet
- package.json
- What You Must Do When Invoked
- billing/views.py
- offers/views.py
- InvoiceViewSet
- Booking
- restaurant/views.py
- compilerOptions
- api_response
- hotels/views.py
- App.tsx
- ReceptionDashboard.tsx
- dependencies
- housekeeping/views.py
- ServiceRequestViewSet
- devDependencies
- StayHive — Production-Grade Hotel Management & Booking Platform
- RoomSerializer
- NotificationViewSet
- graphify reference: extra exports and benchmark
- react
- BookingWizard.tsx
- FeedbackViewSet
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
- PaymentViewSet
- FoodOrderPermission
- get_user_role
- useServices.ts
- useHousekeeping.ts
- useSupport.ts
- useHotels.ts
- ServiceRequestPermission
- Decimal
- ReceptionPermission
- cancellations/views.py
- get_user_role
- InvoicesPage.tsx
- NotificationContext.tsx
- SupportSummaryView

## God Nodes (most connected - your core abstractions)
1. `api_response()` - 153 edges
2. `api_error()` - 84 edges
3. `Customer` - 59 edges
4. `react` - 57 edges
5. `Booking` - 55 edges
6. `useNotification()` - 51 edges
7. `lucide-react` - 42 edges
8. `Staff` - 39 edges
9. `useAuth()` - 37 edges
10. `useDatabase()` - 37 edges

## Surprising Connections (you probably didn't know these)
- `get_token()` --uses--> `User`  [INFERRED]
  backend/test_checkpoint7.py → backend/apps/core/models.py
- `authenticate_stayhive_user()` --uses--> `User`  [INFERRED]
  backend/apps/accounts/auth.py → backend/apps/core/models.py
- `UserSerializer` --uses--> `User`  [INFERRED]
  backend/apps/accounts/serializers.py → backend/apps/core/models.py
- `RegisterSerializer` --uses--> `User`  [INFERRED]
  backend/apps/accounts/serializers.py → backend/apps/core/models.py
- `RegisterView` --uses--> `Customer`  [INFERRED]
  backend/apps/accounts/views.py → backend/apps/core/models.py

## Import Cycles
- None detected.

## Communities (80 total, 11 thin omitted)

### Community 0 - "useAuth"
Cohesion: 0.13
Nodes (24): ProtectedRoute(), ProtectedRouteProps, AppLayout(), CommandPalette(), CommandPaletteProps, Header(), HeaderProps, MobileNav() (+16 more)

### Community 1 - "database.ts"
Cohesion: 0.10
Nodes (39): DatabaseContext, DatabaseContextType, AnalyticsOverview, ApiResponse, AvailableRoomType, Booking, BookingRoom, BookingStatus (+31 more)

### Community 2 - "Role"
Cohesion: 0.19
Nodes (16): authenticate_stayhive_user(), get_tokens_for_user(), Generate JWT access and refresh tokens with user payload., Authenticate against custom User table with password check. Supports standard…, LoginSerializer, Meta, RegisterSerializer, RoleSerializer (+8 more)

### Community 3 - "test_checkpoint8.py"
Cohesion: 0.15
Nodes (25): BookingCreateSerializer, BookingRoomSerializer, CheckInSerializer, Meta, OfferApplicationSerializer, BookingViewSet, CheckInViewSet, BookingRoom (+17 more)

### Community 4 - "useRooms.ts"
Cohesion: 0.17
Nodes (13): RoomGrid(), RoomFilters, useCreateRoom(), useCreateRoomType(), useDeleteRoom(), useDeleteRoomType(), useRoomTypes(), useUpdateRoom() (+5 more)

### Community 5 - "useNotification"
Cohesion: 0.12
Nodes (16): DatabaseProvider(), useNotification(), BillingStats, CancellationItem, CreatePaymentPayload, InvoiceFilters, InvoiceItem, PaymentItem (+8 more)

### Community 6 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 7 - "CustomerViewSet"
Cohesion: 0.18
Nodes (7): CustomerProfileSerializer, CustomerSerializer, Meta, CustomerPermission, CustomerViewSet, action, Returns or updates the authenticated customer's own profile.

### Community 8 - "package.json"
Cohesion: 0.10
Nodes (19): name, private, type, version, autoprefixer, canvas-confetti, clsx, oxlint (+11 more)

### Community 9 - "What You Must Do When Invoked"
Cohesion: 0.07
Nodes (26): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+18 more)

### Community 10 - "billing/views.py"
Cohesion: 0.15
Nodes (25): PaymentMethodSerializer, calculate_discount(), calculate_food_charges(), calculate_invoice_totals(), calculate_outstanding_balance(), calculate_paid_amount(), calculate_room_charges(), calculate_service_charges() (+17 more)

### Community 11 - "offers/views.py"
Cohesion: 0.25
Nodes (4): Meta, OfferPackageSerializer, OfferPackageViewSet, action

### Community 12 - "InvoiceViewSet"
Cohesion: 0.13
Nodes (12): InvoiceCreateSerializer, InvoiceSerializer, Meta, PaymentSerializer, InvoiceViewSet, action, Explicitly regenerate / recalculate an invoice., Customer-specific invoice list. (+4 more)

### Community 13 - "Booking"
Cohesion: 0.07
Nodes (21): BookingSerializer, Booking, Room, CheckInRequestSerializer, CheckOutRequestSerializer, Meta, ReceptionActiveStaySerializer, ReceptionArrivalSerializer (+13 more)

### Community 14 - "restaurant/views.py"
Cohesion: 0.06
Nodes (22): OrderItem, Restaurant, CreateFoodOrderSerializer, CreateOrderItemInputSerializer, FoodOrderSerializer, FoodSerializer, Meta, OrderItemSerializer (+14 more)

### Community 15 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 16 - "api_response"
Cohesion: 0.08
Nodes (10): action, Transactional booking creation with date overlap verification, room auto-…, Public or authenticated endpoint to query available rooms and categories using…, Returns the authenticated customer's own booking history., api_error(), api_response(), Standard StayHive API response structure: { "success": true, "message": "...",…, HotelViewSet (+2 more)

### Community 17 - "hotels/views.py"
Cohesion: 0.09
Nodes (19): Gallery, HotelFacility, IsAdmin, IsCustomer, IsHousekeeping, IsManager, IsReception, IsRestaurant (+11 more)

### Community 18 - "App.tsx"
Cohesion: 0.10
Nodes (25): App(), queryClient, useDatabase(), Theme, ThemeContext, ThemeContextType, ThemeProvider(), useBooking() (+17 more)

### Community 19 - "ReceptionDashboard.tsx"
Cohesion: 0.17
Nodes (19): ReceptionDashboard(), useHotels(), CheckInPayload, CheckOutPayload, ReceptionActiveStay, ReceptionArrival, ReceptionCancellation, ReceptionDashboardStats (+11 more)

### Community 20 - "dependencies"
Cohesion: 0.14
Nodes (14): dependencies, axios, canvas-confetti, clsx, framer-motion, lucide-react, react, react-dom (+6 more)

### Community 21 - "housekeeping/views.py"
Cohesion: 0.25
Nodes (6): Department, DepartmentSerializer, DepartmentViewSet, Meta, StaffSerializer, StaffViewSet

### Community 22 - "ServiceRequestViewSet"
Cohesion: 0.16
Nodes (5): action, CRUD and status transitions for Guest Service Requests: - ADMIN, MANAGER,…, CRUD for Hotel Services: - ADMIN, MANAGER: Full CRUD - RECEPTION: View services…, ServiceRequestViewSet, ServiceViewSet

### Community 23 - "devDependencies"
Cohesion: 0.17
Nodes (12): devDependencies, autoprefixer, oxlint, postcss, tailwindcss, @types/canvas-confetti, @types/node, @types/react (+4 more)

### Community 24 - "StayHive — Production-Grade Hotel Management & Booking Platform"
Cohesion: 0.13
Nodes (14): 🏗️ Architecture & Technology Stack, 🗄️ Database Schema (33 Interconnected Tables), 👥 Default User Personas & Credentials, 🌟 Key Features, 📄 License, Luxury Design & Experience, Multi-Persona Architecture, Prerequisites (+6 more)

### Community 25 - "RoomSerializer"
Cohesion: 0.09
Nodes (12): RoomAmenity, Meta, RoomAmenitySerializer, RoomSerializer, RoomTypeSerializer, action, Fast status transition: Available, Occupied, Reserved, Maintenance, Cleaning, RoomAmenityViewSet (+4 more)

### Community 26 - "NotificationViewSet"
Cohesion: 0.29
Nodes (5): Notification, Meta, NotificationSerializer, NotificationViewSet, action

### Community 27 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 28 - "react"
Cohesion: 0.22
Nodes (19): Badge(), BadgeProps, BadgeVariant, Button(), ButtonProps, Card(), CardProps, EmptyState() (+11 more)

### Community 29 - "BookingWizard.tsx"
Cohesion: 0.14
Nodes (14): StatCard(), StatCardProps, DatePicker(), DatePickerProps, Select(), SelectOption, SelectProps, StatusBadge() (+6 more)

### Community 30 - "FeedbackViewSet"
Cohesion: 0.16
Nodes (7): FeedbackCreateSerializer, FeedbackSerializer, Meta, FeedbackPagination, FeedbackViewSet, action, PageNumberPagination

### Community 31 - "InquiryViewSet"
Cohesion: 0.23
Nodes (8): Inquiry, InquiryCreateSerializer, InquiryReplySerializer, InquirySerializer, Meta, InquiryPagination, InquiryViewSet, PageNumberPagination

### Community 32 - "useBookings.ts"
Cohesion: 0.18
Nodes (10): BookingWizard(), AvailabilityParams, BookingFilters, CreateBookingPayload, useAvailability(), useCheckInBooking(), useCheckOutBooking(), useCreateBooking() (+2 more)

### Community 33 - "ComplaintViewSet"
Cohesion: 0.17
Nodes (9): ComplaintCreateSerializer, ComplaintSerializer, ComplaintStatusUpdateSerializer, Meta, ComplaintPagination, ComplaintViewSet, action, PageNumberPagination (+1 more)

### Community 34 - "HousekeepingTaskViewSet"
Cohesion: 0.12
Nodes (8): HousekeepingPermission, Permissions for Housekeeping Tasks: - ADMIN, MANAGER: Full access (create,…, HousekeepingTaskSerializer, Meta, HousekeepingTaskViewSet, action, Room Housekeeping Board with operational and cleanliness statuses., CRUD and status workflows for Housekeeping Tasks: - ADMIN, MANAGER: Full…

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
Nodes (10): AbstractBaseUser, Customer, Staff, User, get_token(), STAYHIVE — CHECKPOINT 6: RESTAURANT + FOOD ORDER MANAGEMENT VERIFICATION SUITE…, get_user_token(), STAYHIVE — CHECKPOINT 9: FEEDBACK + COMPLAINTS + INQUIRIES VERIFICATION SUITE… (+2 more)

### Community 64 - "PaymentViewSet"
Cohesion: 0.19
Nodes (5): PaymentMethodPermission, Payment methods can be read by authenticated users. Only Admin/Manager can…, PaymentCreateSerializer, PaymentMethodViewSet, PaymentViewSet

### Community 65 - "FoodOrderPermission"
Cohesion: 0.18
Nodes (6): FoodMenuPermission, FoodOrderPermission, Permissions for Food Menu items: - Safe methods: Accessible by ADMIN, MANAGER,…, Permissions for Food Orders: - ADMIN, MANAGER, RESTAURANT: Full access to view,…, Permissions for Restaurant management: - Safe methods (GET, HEAD, OPTIONS):…, RestaurantPermission

### Community 66 - "get_user_role"
Cohesion: 0.13
Nodes (9): BillingPermission, get_user_role(), Role-based billing permission: - Admin, Manager: Full access. - Reception: Can…, Resolve user role reliably., CancellationPermission, Role-based permission for Cancellation Requests and Refunds: - Admin, Manager:…, CancellationRequestViewSet, action (+1 more)

### Community 67 - "useServices.ts"
Cohesion: 0.18
Nodes (12): CreateServiceRequestPayload, ServiceFilters, ServiceItem, ServiceRequestFilters, ServiceRequestItem, useCancelServiceRequest(), useCreateService(), useCreateServiceRequest() (+4 more)

### Community 68 - "useHousekeeping.ts"
Cohesion: 0.21
Nodes (11): HousekeepingDashboard(), CreateHousekeepingTaskPayload, HousekeepingFilters, HousekeepingRoomBoardItem, HousekeepingTaskItem, useCreateHousekeepingTask(), useHousekeepingRoomBoard(), useHousekeepingTasks() (+3 more)

### Community 69 - "useSupport.ts"
Cohesion: 0.12
Nodes (26): complaintApi, ComplaintItem, feedbackApi, FeedbackItem, FeedbackSummary, inquiryApi, InquiryItem, supportApi (+18 more)

### Community 70 - "useHotels.ts"
Cohesion: 0.13
Nodes (12): API_BASE_URL, apiClient, CustomerFilters, HotelFilters, useCreateHotel(), useDeleteHotel(), useUpdateHotel(), HotelsPage() (+4 more)

### Community 71 - "ServiceRequestPermission"
Cohesion: 0.25
Nodes (4): Permissions for Service Requests: - ADMIN, MANAGER, RECEPTION: Full management…, Permissions for Service Management: - Safe methods (GET, HEAD, OPTIONS): ADMIN,…, ServicePermission, ServiceRequestPermission

### Community 72 - "Decimal"
Cohesion: 0.11
Nodes (10): AnalyticsOverviewView, APIView, Hotel, Service, Meta, ServiceRequestSerializer, ServiceSerializer, get_token() (+2 more)

### Community 74 - "cancellations/views.py"
Cohesion: 0.22
Nodes (14): calculate_refundable_amount(), calculate_refunded_amount(), Sum of completed/initiated refunds for a payment., Maximum refundable amount remaining on a payment., CancellationRequestCreateSerializer, CancellationRequestSerializer, Meta, RefundCreateSerializer (+6 more)

### Community 75 - "get_user_role"
Cohesion: 0.17
Nodes (8): ComplaintPermission, Complaint Permissions: - Customer: Create complaint, view own complaints via…, FeedbackPermission, get_user_role(), Feedback Permissions: - Admin, Manager, Reception: Full view & management…, Resolve user role reliably., InquiryPermission, Inquiry Permissions: - Public / Unauthenticated: Allowed to submit inquiry…

### Community 76 - "InvoicesPage.tsx"
Cohesion: 0.26
Nodes (10): AdminDashboard(), CustomerDashboard(), useBillingStats(), useInvoice(), useInvoices(), useMyInvoices(), usePaymentMethods(), useMyServiceRequests() (+2 more)

### Community 77 - "NotificationContext.tsx"
Cohesion: 0.33
Nodes (5): NotificationContext, NotificationContextType, NotificationProvider(), Toast, ToastType

### Community 78 - "SupportSummaryView"
Cohesion: 0.40
Nodes (3): HealthCheckView, APIView, SupportSummaryView

## Knowledge Gaps
- **237 isolated node(s):** `Meta`, `Meta`, `Meta`, `Meta`, `Meta` (+232 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 480 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `api_response()` connect `api_response` to `Role`, `test_checkpoint8.py`, `CustomerViewSet`, `billing/views.py`, `offers/views.py`, `InvoiceViewSet`, `Booking`, `restaurant/views.py`, `hotels/views.py`, `housekeeping/views.py`, `ServiceRequestViewSet`, `RoomSerializer`, `NotificationViewSet`, `FeedbackViewSet`, `InquiryViewSet`, `ComplaintViewSet`, `HousekeepingTaskViewSet`, `PaymentViewSet`, `get_user_role`, `Decimal`, `cancellations/views.py`?**
  _High betweenness centrality (0.095) - this node is a cross-community bridge._
- **Why does `Customer` connect `Customer` to `ComplaintViewSet`, `Role`, `get_user_role`, `test_checkpoint8.py`, `CustomerViewSet`, `Decimal`, `billing/views.py`, `cancellations/views.py`, `InvoiceViewSet`, `get_user_role`, `Booking`, `restaurant/views.py`, `ServiceRequestViewSet`, `FeedbackViewSet`, `InquiryViewSet`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `Booking` connect `Booking` to `ComplaintViewSet`, `get_user_role`, `test_checkpoint8.py`, `Decimal`, `billing/views.py`, `cancellations/views.py`, `InvoiceViewSet`, `restaurant/views.py`, `ServiceRequestViewSet`, `RoomSerializer`, `Customer`, `FeedbackViewSet`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Are the 22 inferred relationships involving `Customer` (e.g. with `RegisterView` and `BillingPermission`) actually correct?**
  _`Customer` has 22 INFERRED edges - model-reasoned connections that need verification._
- **Are the 26 inferred relationships involving `Booking` (e.g. with `AnalyticsOverviewView` and `calculate_discount()`) actually correct?**
  _`Booking` has 26 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Meta`, `Meta`, `Meta` to the rest of the system?**
  _237 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `useAuth` be split into smaller, more focused modules?**
  _Cohesion score 0.12701612903225806 - nodes in this community are weakly interconnected._