# Graph Report - StayHive  (2026-09-24)

## Corpus Check
- 164 files · ~96,912 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1150 nodes · 2990 edges · 75 communities (56 shown, 12 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 305 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ab16664b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- useAuth
- database.ts
- accounts/views.py
- models.py
- useRooms.ts
- useNotification
- compilerOptions
- CustomerViewSet
- package.json
- What You Must Do When Invoked
- test_checkpoint8.py
- offers/views.py
- Customer
- Booking
- restaurant/views.py
- compilerOptions
- BookingViewSet
- hotels/views.py
- App.tsx
- ReceptionDashboard.tsx
- dependencies
- staff/views.py
- api_error
- devDependencies
- StayHive — Production-Grade Hotel Management & Booking Platform
- RoomSerializer
- NotificationViewSet
- graphify reference: extra exports and benchmark
- lucide-react
- BookingWizard.tsx
- Feedback
- Inquiry
- useBookings.ts
- complaints/views.py
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
- User
- rules/graphify.md
- extraction-spec.md
- workflows/graphify.md
- api_response
- FoodOrderPermission
- get_user_role
- useServices.ts
- NotificationContext.tsx
- react
- useHotels.ts
- ServiceRequestSerializer
- ProfilePage.tsx
- ReceptionPermission
- APIView

## God Nodes (most connected - your core abstractions)
1. `api_response()` - 137 edges
2. `api_error()` - 73 edges
3. `react` - 57 edges
4. `useNotification()` - 51 edges
5. `Booking` - 48 edges
6. `Customer` - 42 edges
7. `lucide-react` - 42 edges
8. `useDatabase()` - 39 edges
9. `Room` - 34 edges
10. `Meta` - 33 edges

## Surprising Connections (you probably didn't know these)
- `get_user_role()` --uses--> `Customer`  [INFERRED]
  backend/apps/billing/permissions.py → backend/apps/core/models.py
- `get_user_role()` --uses--> `Staff`  [INFERRED]
  backend/apps/billing/permissions.py → backend/apps/core/models.py
- `BillingPermission` --uses--> `Customer`  [INFERRED]
  backend/apps/billing/permissions.py → backend/apps/core/models.py
- `InvoiceViewSet` --uses--> `BillingPermission`  [INFERRED]
  backend/apps/billing/views.py → backend/apps/billing/permissions.py
- `PaymentViewSet` --uses--> `BillingPermission`  [INFERRED]
  backend/apps/billing/views.py → backend/apps/billing/permissions.py

## Import Cycles
- None detected.

## Communities (75 total, 12 thin omitted)

### Community 0 - "useAuth"
Cohesion: 0.10
Nodes (27): ProtectedRoute(), ProtectedRouteProps, AdminDashboard(), CustomerDashboard(), AppLayout(), CommandPalette(), CommandPaletteProps, Header() (+19 more)

### Community 1 - "database.ts"
Cohesion: 0.09
Nodes (39): DatabaseContext, DatabaseContextType, DatabaseProvider(), AnalyticsOverview, ApiResponse, AvailableRoomType, BookingRoom, BookingStatus (+31 more)

### Community 2 - "accounts/views.py"
Cohesion: 0.15
Nodes (16): authenticate_stayhive_user(), get_tokens_for_user(), Generate JWT access and refresh tokens with user payload., Authenticate against custom User table with password check. Supports standard…, LoginSerializer, Meta, RegisterSerializer, RoleSerializer (+8 more)

### Community 3 - "models.py"
Cohesion: 0.12
Nodes (22): AnalyticsOverviewView, APIView, BookingCreateSerializer, BookingRoomSerializer, CheckInSerializer, Meta, OfferApplicationSerializer, CheckInViewSet (+14 more)

### Community 4 - "useRooms.ts"
Cohesion: 0.12
Nodes (17): API_BASE_URL, apiClient, RoomGrid(), CustomerFilters, RoomFilters, useCreateRoom(), useCreateRoomType(), useDeleteRoom() (+9 more)

### Community 5 - "useNotification"
Cohesion: 0.11
Nodes (20): useNotification(), BillingStats, CancellationItem, CreatePaymentPayload, InvoiceFilters, InvoiceItem, PaymentItem, PaymentMethodItem (+12 more)

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
Cohesion: 0.17
Nodes (26): calculate_discount(), calculate_food_charges(), calculate_invoice_totals(), calculate_refundable_amount(), calculate_refunded_amount(), calculate_room_charges(), calculate_service_charges(), calculate_tax() (+18 more)

### Community 11 - "offers/views.py"
Cohesion: 0.25
Nodes (4): Meta, OfferPackageSerializer, OfferPackageViewSet, action

### Community 12 - "Customer"
Cohesion: 0.11
Nodes (27): InvoiceCreateSerializer, InvoiceSerializer, Meta, PaymentCreateSerializer, PaymentMethodSerializer, PaymentSerializer, calculate_outstanding_balance(), calculate_paid_amount() (+19 more)

### Community 13 - "Booking"
Cohesion: 0.08
Nodes (21): APIView, Booking, CancellationRequest, Room, CheckInRequestSerializer, CheckOutRequestSerializer, Meta, ReceptionActiveStaySerializer (+13 more)

### Community 14 - "restaurant/views.py"
Cohesion: 0.09
Nodes (19): Food, OrderItem, Restaurant, CreateFoodOrderSerializer, CreateOrderItemInputSerializer, FoodOrderSerializer, FoodSerializer, Meta (+11 more)

### Community 15 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 16 - "BookingViewSet"
Cohesion: 0.13
Nodes (6): BookingSerializer, BookingViewSet, action, Transactional booking creation with date overlap verification, room auto-…, Public or authenticated endpoint to query available rooms and categories using…, Returns the authenticated customer's own booking history.

### Community 17 - "hotels/views.py"
Cohesion: 0.07
Nodes (21): Gallery, HotelFacility, IsAdmin, IsCustomer, IsHousekeeping, IsManager, IsReception, IsRestaurant (+13 more)

### Community 18 - "App.tsx"
Cohesion: 0.11
Nodes (24): App(), queryClient, useDatabase(), Theme, ThemeContext, ThemeContextType, ThemeProvider(), useBooking() (+16 more)

### Community 19 - "ReceptionDashboard.tsx"
Cohesion: 0.17
Nodes (19): ReceptionDashboard(), useHotels(), CheckInPayload, CheckOutPayload, ReceptionActiveStay, ReceptionArrival, ReceptionCancellation, ReceptionDashboardStats (+11 more)

### Community 20 - "dependencies"
Cohesion: 0.14
Nodes (14): dependencies, axios, canvas-confetti, clsx, framer-motion, lucide-react, react, react-dom (+6 more)

### Community 21 - "staff/views.py"
Cohesion: 0.25
Nodes (6): Department, DepartmentSerializer, DepartmentViewSet, Meta, StaffSerializer, StaffViewSet

### Community 22 - "api_error"
Cohesion: 0.20
Nodes (4): api_error(), action, CRUD and status transitions for Guest Service Requests: - ADMIN, MANAGER,…, ServiceRequestViewSet

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
Cohesion: 0.29
Nodes (5): Notification, Meta, NotificationSerializer, NotificationViewSet, action

### Community 27 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 28 - "lucide-react"
Cohesion: 0.31
Nodes (10): Badge(), BadgeProps, BadgeVariant, Button(), ButtonProps, Card(), CardProps, useMyInvoices() (+2 more)

### Community 29 - "BookingWizard.tsx"
Cohesion: 0.14
Nodes (14): StatCard(), StatCardProps, DatePicker(), DatePickerProps, Select(), SelectOption, SelectProps, StatusBadge() (+6 more)

### Community 30 - "Feedback"
Cohesion: 0.31
Nodes (5): Feedback, FeedbackSerializer, FeedbackViewSet, Meta, action

### Community 31 - "Inquiry"
Cohesion: 0.31
Nodes (5): Inquiry, InquirySerializer, InquiryViewSet, Meta, action

### Community 32 - "useBookings.ts"
Cohesion: 0.15
Nodes (12): BookingWizard(), AvailabilityParams, BookingFilters, CreateBookingPayload, useAvailability(), useCheckInBooking(), useCheckOutBooking(), useCreateBooking() (+4 more)

### Community 33 - "complaints/views.py"
Cohesion: 0.29
Nodes (4): ComplaintSerializer, ComplaintViewSet, Meta, action

### Community 34 - "HousekeepingTaskViewSet"
Cohesion: 0.11
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

### Community 60 - "User"
Cohesion: 0.10
Nodes (10): AbstractBaseUser, BookingRoom, Role, User, get_token(), STAYHIVE — CHECKPOINT 6: RESTAURANT + FOOD ORDER MANAGEMENT VERIFICATION SUITE…, get_token(), STAYHIVE — CHECKPOINT 7: SERVICES + HOUSEKEEPING MANAGEMENT VERIFICATION SUITE… (+2 more)

### Community 64 - "api_response"
Cohesion: 0.09
Nodes (8): api_response(), Standard StayHive API response structure: { "success": true, "message": "...",…, FoodViewSet, CRUD for Hotel Restaurants. - ADMIN, MANAGER: full CRUD - RESTAURANT,…, CRUD for Food Menu Items. - ADMIN, MANAGER, RESTAURANT: full CRUD - RECEPTION,…, RestaurantViewSet, CRUD for Hotel Services: - ADMIN, MANAGER: Full CRUD - RECEPTION: View services…, ServiceViewSet

### Community 65 - "FoodOrderPermission"
Cohesion: 0.18
Nodes (6): FoodMenuPermission, FoodOrderPermission, Permissions for Food Menu items: - Safe methods: Accessible by ADMIN, MANAGER,…, Permissions for Food Orders: - ADMIN, MANAGER, RESTAURANT: Full access to view,…, Permissions for Restaurant management: - Safe methods (GET, HEAD, OPTIONS):…, RestaurantPermission

### Community 66 - "get_user_role"
Cohesion: 0.09
Nodes (19): BillingPermission, get_user_role(), PaymentMethodPermission, Role-based billing permission: - Admin, Manager: Full access. - Reception: Can…, Resolve user role reliably., Payment methods can be read by authenticated users. Only Admin/Manager can…, CancellationPermission, Role-based permission for Cancellation Requests and Refunds: - Admin, Manager:… (+11 more)

### Community 67 - "useServices.ts"
Cohesion: 0.18
Nodes (12): CreateServiceRequestPayload, ServiceFilters, ServiceItem, ServiceRequestFilters, ServiceRequestItem, useCancelServiceRequest(), useCreateService(), useCreateServiceRequest() (+4 more)

### Community 68 - "NotificationContext.tsx"
Cohesion: 0.12
Nodes (16): HousekeepingDashboard(), NotificationContext, NotificationContextType, NotificationProvider(), Toast, ToastType, CreateHousekeepingTaskPayload, HousekeepingFilters (+8 more)

### Community 69 - "react"
Cohesion: 0.27
Nodes (11): EmptyState(), EmptyStateProps, Input, InputProps, Modal(), ModalProps, SearchInput(), SearchInputProps (+3 more)

### Community 70 - "useHotels.ts"
Cohesion: 0.20
Nodes (8): HotelFilters, useCreateHotel(), useDeleteHotel(), useUpdateHotel(), HotelsPage(), Gallery, Hotel, HotelFacility

### Community 71 - "ServiceRequestSerializer"
Cohesion: 0.14
Nodes (6): Permissions for Service Requests: - ADMIN, MANAGER, RECEPTION: Full management…, Permissions for Service Management: - Safe methods (GET, HEAD, OPTIONS): ADMIN,…, ServicePermission, ServiceRequestPermission, Meta, ServiceRequestSerializer

### Community 72 - "ProfilePage.tsx"
Cohesion: 0.83
Nodes (3): useCurrentCustomer(), useUpdateCustomer(), ProfilePage()

## Knowledge Gaps
- **231 isolated node(s):** `PaymentItem`, `PaymentMethodItem`, `RefundItem`, `CancellationItem`, `BillingStats` (+226 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 454 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `api_response()` connect `api_response` to `complaints/views.py`, `accounts/views.py`, `models.py`, `get_user_role`, `HousekeepingTaskViewSet`, `CustomerViewSet`, `offers/views.py`, `Customer`, `Booking`, `restaurant/views.py`, `BookingViewSet`, `hotels/views.py`, `staff/views.py`, `api_error`, `RoomSerializer`, `NotificationViewSet`, `Feedback`, `Inquiry`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **Why does `Booking` connect `Booking` to `get_user_role`, `models.py`, `test_checkpoint8.py`, `Customer`, `restaurant/views.py`, `BookingViewSet`, `api_error`, `RoomSerializer`, `User`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `Customer` connect `Customer` to `accounts/views.py`, `models.py`, `get_user_role`, `CustomerViewSet`, `test_checkpoint8.py`, `Booking`, `restaurant/views.py`, `BookingViewSet`, `api_error`, `User`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Are the 37 inferred relationships involving `api_response()` (e.g. with `.billing_stats()` and `.create()`) actually correct?**
  _`api_response()` has 37 INFERRED edges - model-reasoned connections that need verification._
- **Are the 21 inferred relationships involving `api_error()` (e.g. with `.billing_stats()` and `.create()`) actually correct?**
  _`api_error()` has 21 INFERRED edges - model-reasoned connections that need verification._
- **Are the 24 inferred relationships involving `Booking` (e.g. with `AnalyticsOverviewView` and `calculate_discount()`) actually correct?**
  _`Booking` has 24 INFERRED edges - model-reasoned connections that need verification._
- **What connects `PaymentItem`, `PaymentMethodItem`, `RefundItem` to the rest of the system?**
  _231 weakly-connected nodes found - possible documentation gaps or missing edges._