# Graph Report - StayHive  (2026-09-24)

## Corpus Check
- 164 files · ~96,912 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1150 nodes · 3014 edges · 75 communities (56 shown, 12 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 245 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `668599ba`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App.tsx
- database.ts
- accounts/views.py
- test_checkpoint8.py
- useRooms.ts
- useNotification
- compilerOptions
- CustomerViewSet
- package.json
- What You Must Do When Invoked
- services.py
- offers/views.py
- billing/views.py
- reception/views.py
- restaurant/views.py
- compilerOptions
- BookingViewSet
- hotels/views.py
- Room
- useReception.ts
- dependencies
- Staff
- ServiceRequestViewSet
- devDependencies
- StayHive — Production-Grade Hotel Management & Booking Platform
- RoomViewSet
- NotificationViewSet
- graphify reference: extra exports and benchmark
- get_user_role
- .status_update
- Feedback
- Inquiry
- useBookings.ts
- complaints/views.py
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
- User
- rules/graphify.md
- extraction-spec.md
- workflows/graphify.md
- api_response
- FoodOrderPermission
- cancellations/views.py
- ServicesPage.tsx
- useHousekeeping.ts
- Booking
- useHotels.ts
- ServiceRequestPermission
- PaymentViewSet
- RoomTypeSerializer
- ServiceRequestSerializer

## God Nodes (most connected - your core abstractions)
1. `api_response()` - 141 edges
2. `api_error()` - 77 edges
3. `react` - 57 edges
4. `useNotification()` - 51 edges
5. `Booking` - 48 edges
6. `Customer` - 42 edges
7. `lucide-react` - 42 edges
8. `useDatabase()` - 39 edges
9. `Room` - 34 edges
10. `Meta` - 33 edges

## Surprising Connections (you probably didn't know these)
- `get_token()` --uses--> `User`  [INFERRED]
  backend/test_critical_scenario_cp7.py → backend/apps/core/models.py
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

## Communities (75 total, 12 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.06
Nodes (96): App(), queryClient, ProtectedRoute(), ProtectedRouteProps, BookingWizard(), AdminDashboard(), CustomerDashboard(), StatCard() (+88 more)

### Community 1 - "database.ts"
Cohesion: 0.10
Nodes (39): DatabaseContext, DatabaseContextType, AnalyticsOverview, ApiResponse, AvailableRoomType, Booking, BookingRoom, BookingStatus (+31 more)

### Community 2 - "accounts/views.py"
Cohesion: 0.15
Nodes (16): authenticate_stayhive_user(), get_tokens_for_user(), Generate JWT access and refresh tokens with user payload., Authenticate against custom User table with password check. Supports standard…, LoginSerializer, Meta, RegisterSerializer, RoleSerializer (+8 more)

### Community 3 - "test_checkpoint8.py"
Cohesion: 0.19
Nodes (21): BookingRoomSerializer, CheckInSerializer, Meta, OfferApplicationSerializer, CheckInViewSet, BookingRoom, CancellationRequest, CheckIn (+13 more)

### Community 4 - "useRooms.ts"
Cohesion: 0.17
Nodes (13): RoomGrid(), RoomFilters, useCreateRoom(), useCreateRoomType(), useDeleteRoom(), useDeleteRoomType(), useRoomTypes(), useUpdateRoom() (+5 more)

### Community 5 - "useNotification"
Cohesion: 0.11
Nodes (21): DatabaseProvider(), useNotification(), BillingStats, CancellationItem, CreatePaymentPayload, InvoiceFilters, InvoiceItem, PaymentItem (+13 more)

### Community 6 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 7 - "CustomerViewSet"
Cohesion: 0.15
Nodes (7): CustomerProfileSerializer, CustomerSerializer, Meta, CustomerPermission, CustomerViewSet, action, Returns or updates the authenticated customer's own profile.

### Community 8 - "package.json"
Cohesion: 0.10
Nodes (19): name, private, type, version, autoprefixer, canvas-confetti, clsx, oxlint (+11 more)

### Community 9 - "What You Must Do When Invoked"
Cohesion: 0.07
Nodes (26): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+18 more)

### Community 10 - "services.py"
Cohesion: 0.18
Nodes (19): calculate_discount(), calculate_food_charges(), calculate_invoice_totals(), calculate_refundable_amount(), calculate_refunded_amount(), calculate_room_charges(), calculate_service_charges(), calculate_tax() (+11 more)

### Community 11 - "offers/views.py"
Cohesion: 0.25
Nodes (4): Meta, OfferPackageSerializer, OfferPackageViewSet, action

### Community 12 - "billing/views.py"
Cohesion: 0.12
Nodes (23): InvoiceCreateSerializer, InvoiceSerializer, Meta, PaymentCreateSerializer, PaymentMethodSerializer, PaymentSerializer, calculate_outstanding_balance(), calculate_paid_amount() (+15 more)

### Community 13 - "reception/views.py"
Cohesion: 0.06
Nodes (21): BookingSerializer, CheckInRequestSerializer, CheckOutRequestSerializer, Meta, ReceptionActiveStaySerializer, ReceptionArrivalSerializer, ReceptionCancellationSerializer, ReceptionDepartureSerializer (+13 more)

### Community 14 - "restaurant/views.py"
Cohesion: 0.13
Nodes (14): Food, OrderItem, Restaurant, CreateFoodOrderSerializer, CreateOrderItemInputSerializer, FoodOrderSerializer, FoodSerializer, Meta (+6 more)

### Community 15 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 16 - "BookingViewSet"
Cohesion: 0.27
Nodes (4): BookingCreateSerializer, BookingViewSet, Transactional booking creation with date overlap verification, room auto-…, Public or authenticated endpoint to query available rooms and categories using…

### Community 17 - "hotels/views.py"
Cohesion: 0.07
Nodes (21): Gallery, HotelFacility, IsAdmin, IsCustomer, IsHousekeeping, IsManager, IsReception, IsRestaurant (+13 more)

### Community 18 - "Room"
Cohesion: 0.19
Nodes (7): Room, RoomAmenity, Meta, RoomAmenitySerializer, RoomSerializer, RoomPermission, RoomTypePermission

### Community 19 - "useReception.ts"
Cohesion: 0.14
Nodes (16): ReceptionDashboard(), CheckInPayload, CheckOutPayload, ReceptionActiveStay, ReceptionArrival, ReceptionCancellation, ReceptionDashboardStats, ReceptionDeparture (+8 more)

### Community 20 - "dependencies"
Cohesion: 0.14
Nodes (14): dependencies, axios, canvas-confetti, clsx, framer-motion, lucide-react, react, react-dom (+6 more)

### Community 21 - "Staff"
Cohesion: 0.11
Nodes (12): Department, HousekeepingTask, Staff, HousekeepingPermission, Permissions for Housekeeping Tasks: - ADMIN, MANAGER: Full access (create,…, HousekeepingTaskSerializer, Meta, DepartmentSerializer (+4 more)

### Community 22 - "ServiceRequestViewSet"
Cohesion: 0.14
Nodes (5): action, CRUD and status transitions for Guest Service Requests: - ADMIN, MANAGER,…, CRUD for Hotel Services: - ADMIN, MANAGER: Full CRUD - RECEPTION: View services…, ServiceRequestViewSet, ServiceViewSet

### Community 23 - "devDependencies"
Cohesion: 0.17
Nodes (12): devDependencies, autoprefixer, oxlint, postcss, tailwindcss, @types/canvas-confetti, @types/node, @types/react (+4 more)

### Community 24 - "StayHive — Production-Grade Hotel Management & Booking Platform"
Cohesion: 0.13
Nodes (14): 🏗️ Architecture & Technology Stack, 🗄️ Database Schema (33 Interconnected Tables), 👥 Default User Personas & Credentials, 🌟 Key Features, 📄 License, Luxury Design & Experience, Multi-Persona Architecture, Prerequisites (+6 more)

### Community 25 - "RoomViewSet"
Cohesion: 0.15
Nodes (4): action, Fast status transition: Available, Occupied, Reserved, Maintenance, Cleaning, RoomAmenityViewSet, RoomViewSet

### Community 26 - "NotificationViewSet"
Cohesion: 0.29
Nodes (5): Notification, Meta, NotificationSerializer, NotificationViewSet, action

### Community 27 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 28 - "get_user_role"
Cohesion: 0.19
Nodes (7): BillingPermission, get_user_role(), Role-based billing permission: - Admin, Manager: Full access. - Reception: Can…, Resolve user role reliably., Admin/Manager dashboard financial analytics., CancellationPermission, Role-based permission for Cancellation Requests and Refunds: - Admin, Manager:…

### Community 29 - ".status_update"
Cohesion: 0.22
Nodes (5): action, GET /api/food-orders/my/ Returns only the food orders belonging to the…, PATCH /api/food-orders/{id}/status/ Advance order status according to canonical…, POST /api/food-orders/{id}/cancel/ Customer or staff cancels a pending food…, GET /api/food-orders/stats/ Live Kitchen Display System (KDS) & Order…

### Community 30 - "Feedback"
Cohesion: 0.31
Nodes (5): Feedback, FeedbackSerializer, FeedbackViewSet, Meta, action

### Community 31 - "Inquiry"
Cohesion: 0.31
Nodes (5): Inquiry, InquirySerializer, InquiryViewSet, Meta, action

### Community 32 - "useBookings.ts"
Cohesion: 0.13
Nodes (11): NotificationContext, NotificationContextType, NotificationProvider(), Toast, ToastType, AvailabilityParams, BookingFilters, CreateBookingPayload (+3 more)

### Community 33 - "complaints/views.py"
Cohesion: 0.29
Nodes (4): ComplaintSerializer, ComplaintViewSet, Meta, action

### Community 34 - "api_error"
Cohesion: 0.11
Nodes (7): action, Returns the authenticated customer's own booking history., api_error(), HousekeepingTaskViewSet, action, Room Housekeeping Board with operational and cleanliness statuses., CRUD and status workflows for Housekeeping Tasks: - ADMIN, MANAGER: Full…

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

### Community 60 - "User"
Cohesion: 0.18
Nodes (6): AbstractBaseUser, User, get_token(), STAYHIVE — CHECKPOINT 6: RESTAURANT + FOOD ORDER MANAGEMENT VERIFICATION SUITE…, get_token(), STAYHIVE — CHECKPOINT 7: SERVICES + HOUSEKEEPING MANAGEMENT VERIFICATION SUITE…

### Community 64 - "api_response"
Cohesion: 0.13
Nodes (6): api_response(), Standard StayHive API response structure: { "success": true, "message": "...",…, FoodViewSet, CRUD for Hotel Restaurants. - ADMIN, MANAGER: full CRUD - RESTAURANT,…, CRUD for Food Menu Items. - ADMIN, MANAGER, RESTAURANT: full CRUD - RECEPTION,…, RestaurantViewSet

### Community 65 - "FoodOrderPermission"
Cohesion: 0.18
Nodes (6): FoodMenuPermission, FoodOrderPermission, Permissions for Food Menu items: - Safe methods: Accessible by ADMIN, MANAGER,…, Permissions for Food Orders: - ADMIN, MANAGER, RESTAURANT: Full access to view,…, Permissions for Restaurant management: - Safe methods (GET, HEAD, OPTIONS):…, RestaurantPermission

### Community 66 - "cancellations/views.py"
Cohesion: 0.16
Nodes (12): CancellationRequestCreateSerializer, CancellationRequestSerializer, Meta, RefundCreateSerializer, RefundSerializer, CancellationRequestViewSet, action, Staff action: approve or reject cancellation request. (+4 more)

### Community 67 - "ServicesPage.tsx"
Cohesion: 0.20
Nodes (16): useMyBookings(), CreateServiceRequestPayload, ServiceFilters, ServiceItem, ServiceRequestFilters, ServiceRequestItem, useCancelServiceRequest(), useCreateService() (+8 more)

### Community 68 - "useHousekeeping.ts"
Cohesion: 0.21
Nodes (11): HousekeepingDashboard(), CreateHousekeepingTaskPayload, HousekeepingFilters, HousekeepingRoomBoardItem, HousekeepingTaskItem, useCreateHousekeepingTask(), useHousekeepingRoomBoard(), useHousekeepingTasks() (+3 more)

### Community 69 - "Booking"
Cohesion: 0.12
Nodes (11): AnalyticsOverviewView, APIView, Booking, Complaint, Customer, Hotel, Service, ServiceSerializer (+3 more)

### Community 70 - "useHotels.ts"
Cohesion: 0.14
Nodes (11): API_BASE_URL, apiClient, CustomerFilters, useCurrentCustomer(), useUpdateCustomer(), HotelFilters, ProfilePage(), Gallery (+3 more)

### Community 71 - "ServiceRequestPermission"
Cohesion: 0.25
Nodes (4): Permissions for Service Requests: - ADMIN, MANAGER, RECEPTION: Full management…, Permissions for Service Management: - Safe methods (GET, HEAD, OPTIONS): ADMIN,…, ServicePermission, ServiceRequestPermission

### Community 72 - "PaymentViewSet"
Cohesion: 0.24
Nodes (4): PaymentMethodPermission, Payment methods can be read by authenticated users. Only Admin/Manager can…, PaymentMethodViewSet, PaymentViewSet

## Knowledge Gaps
- **231 isolated node(s):** `Meta`, `Meta`, `Meta`, `Meta`, `Meta` (+226 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 454 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `api_response()` connect `api_response` to `accounts/views.py`, `test_checkpoint8.py`, `CustomerViewSet`, `offers/views.py`, `billing/views.py`, `reception/views.py`, `restaurant/views.py`, `BookingViewSet`, `hotels/views.py`, `Room`, `Staff`, `ServiceRequestViewSet`, `RoomViewSet`, `NotificationViewSet`, `get_user_role`, `.status_update`, `Feedback`, `Inquiry`, `complaints/views.py`, `api_error`, `cancellations/views.py`, `Booking`, `PaymentViewSet`, `RoomTypeSerializer`?**
  _High betweenness centrality (0.112) - this node is a cross-community bridge._
- **Why does `api_error()` connect `api_error` to `accounts/views.py`, `test_checkpoint8.py`, `CustomerViewSet`, `offers/views.py`, `billing/views.py`, `reception/views.py`, `restaurant/views.py`, `BookingViewSet`, `hotels/views.py`, `Room`, `Staff`, `ServiceRequestViewSet`, `RoomViewSet`, `get_user_role`, `.status_update`, `Feedback`, `Inquiry`, `complaints/views.py`, `api_response`, `cancellations/views.py`, `Booking`, `RoomTypeSerializer`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `Customer` connect `Booking` to `accounts/views.py`, `test_checkpoint8.py`, `cancellations/views.py`, `CustomerViewSet`, `billing/views.py`, `reception/views.py`, `restaurant/views.py`, `User`, `BookingViewSet`, `ServiceRequestViewSet`, `get_user_role`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Are the 24 inferred relationships involving `Booking` (e.g. with `AnalyticsOverviewView` and `calculate_discount()`) actually correct?**
  _`Booking` has 24 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Meta`, `Meta`, `Meta` to the rest of the system?**
  _231 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.055595864320696534 - nodes in this community are weakly interconnected._
- **Should `database.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0951219512195122 - nodes in this community are weakly interconnected._