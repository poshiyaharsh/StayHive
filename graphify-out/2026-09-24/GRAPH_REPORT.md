# Graph Report - StayHive  (2026-09-24)

## Corpus Check
- 149 files · ~78,244 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 954 nodes · 2344 edges · 67 communities (50 shown, 10 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 163 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b7f6b414`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App.tsx
- database.ts
- accounts/views.py
- models.py
- useNotification
- api_response
- compilerOptions
- CustomerViewSet
- package.json
- What You Must Do When Invoked
- Staff
- offers/views.py
- billing/views.py
- reception/views.py
- restaurant/views.py
- compilerOptions
- BookingViewSet
- hotels/views.py
- RoomType
- ReceptionDashboard.tsx
- dependencies
- useHotels.ts
- Booking
- devDependencies
- StayHive — Production-Grade Hotel Management & Booking Platform
- RoomTypeSerializer
- NotificationViewSet
- graphify reference: extra exports and benchmark
- NotificationContext.tsx
- FoodOrderViewSet
- Feedback
- Inquiry
- useBookings.ts
- complaints/views.py
- HousekeepingTask
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
- FoodViewSet
- FoodOrderPermission
- CancellationRequest

## God Nodes (most connected - your core abstractions)
1. `api_response()` - 115 edges
2. `react` - 57 edges
3. `api_error()` - 55 edges
4. `useDatabase()` - 45 edges
5. `lucide-react` - 42 edges
6. `useNotification()` - 34 edges
7. `Meta` - 33 edges
8. `Booking` - 31 edges
9. `BookingViewSet` - 28 edges
10. `Button()` - 28 edges

## Surprising Connections (you probably didn't know these)
- `authenticate_stayhive_user()` --uses--> `User`  [INFERRED]
  backend/apps/accounts/auth.py → backend/apps/core/models.py
- `UserSerializer` --uses--> `User`  [INFERRED]
  backend/apps/accounts/serializers.py → backend/apps/core/models.py
- `RegisterSerializer` --uses--> `User`  [INFERRED]
  backend/apps/accounts/serializers.py → backend/apps/core/models.py
- `RegisterView` --uses--> `Customer`  [INFERRED]
  backend/apps/accounts/views.py → backend/apps/core/models.py
- `AnalyticsOverviewView` --uses--> `Booking`  [INFERRED]
  backend/apps/analytics/views.py → backend/apps/core/models.py

## Import Cycles
- None detected.

## Communities (67 total, 10 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.06
Nodes (95): App(), queryClient, ProtectedRoute(), ProtectedRouteProps, BookingWizard(), AdminDashboard(), CustomerDashboard(), HousekeepingDashboard() (+87 more)

### Community 1 - "database.ts"
Cohesion: 0.10
Nodes (39): DatabaseContext, DatabaseContextType, AnalyticsOverview, ApiResponse, AvailableRoomType, Booking, BookingRoom, BookingStatus (+31 more)

### Community 2 - "accounts/views.py"
Cohesion: 0.15
Nodes (17): authenticate_stayhive_user(), get_tokens_for_user(), Generate JWT access and refresh tokens with user payload., Authenticate against custom User table with password check. Supports standard…, LoginSerializer, Meta, RegisterSerializer, RoleSerializer (+9 more)

### Community 3 - "models.py"
Cohesion: 0.19
Nodes (18): AnalyticsOverviewView, APIView, BookingRoomSerializer, CheckInSerializer, Meta, OfferApplicationSerializer, CheckInViewSet, CheckIn (+10 more)

### Community 4 - "useNotification"
Cohesion: 0.15
Nodes (18): RoomGrid(), DatabaseProvider(), useNotification(), useCancelFoodOrder(), RoomFilters, useCreateRoom(), useCreateRoomType(), useDeleteRoom() (+10 more)

### Community 5 - "api_response"
Cohesion: 0.11
Nodes (10): action, Returns the authenticated customer's own booking history., action, api_error(), api_response(), Standard StayHive API response structure: { "success": true, "message": "...",…, action, action (+2 more)

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

### Community 10 - "Staff"
Cohesion: 0.23
Nodes (7): Department, Staff, DepartmentSerializer, DepartmentViewSet, Meta, StaffSerializer, StaffViewSet

### Community 11 - "offers/views.py"
Cohesion: 0.25
Nodes (4): Meta, OfferPackageSerializer, OfferPackageViewSet, action

### Community 12 - "billing/views.py"
Cohesion: 0.19
Nodes (9): InvoiceSerializer, InvoiceViewSet, Meta, PaymentMethodSerializer, PaymentMethodViewSet, PaymentSerializer, PaymentViewSet, action (+1 more)

### Community 13 - "reception/views.py"
Cohesion: 0.06
Nodes (21): BookingSerializer, CheckInRequestSerializer, CheckOutRequestSerializer, Meta, ReceptionActiveStaySerializer, ReceptionArrivalSerializer, ReceptionCancellationSerializer, ReceptionDepartureSerializer (+13 more)

### Community 14 - "restaurant/views.py"
Cohesion: 0.17
Nodes (10): Food, OrderItem, Restaurant, CreateFoodOrderSerializer, CreateOrderItemInputSerializer, FoodSerializer, Meta, OrderItemSerializer (+2 more)

### Community 15 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 16 - "BookingViewSet"
Cohesion: 0.27
Nodes (4): BookingCreateSerializer, BookingViewSet, Transactional booking creation with date overlap verification, room auto-…, Public or authenticated endpoint to query available rooms and categories using…

### Community 17 - "hotels/views.py"
Cohesion: 0.08
Nodes (20): Gallery, HotelFacility, IsAdmin, IsCustomer, IsHousekeeping, IsManager, IsReception, IsRestaurant (+12 more)

### Community 18 - "RoomType"
Cohesion: 0.19
Nodes (7): RoomAmenity, RoomType, Meta, RoomAmenitySerializer, RoomSerializer, RoomPermission, RoomTypePermission

### Community 19 - "ReceptionDashboard.tsx"
Cohesion: 0.19
Nodes (17): ReceptionDashboard(), useHotels(), CheckInPayload, CheckOutPayload, ReceptionActiveStay, ReceptionArrival, ReceptionCancellation, ReceptionDashboardStats (+9 more)

### Community 20 - "dependencies"
Cohesion: 0.14
Nodes (14): dependencies, axios, canvas-confetti, clsx, framer-motion, lucide-react, react, react-dom (+6 more)

### Community 21 - "useHotels.ts"
Cohesion: 0.22
Nodes (7): HotelFilters, useCreateHotel(), useDeleteHotel(), useUpdateHotel(), HotelsPage(), Gallery, HotelFacility

### Community 22 - "Booking"
Cohesion: 0.23
Nodes (8): Booking, Service, Meta, action, ServiceRequestSerializer, ServiceRequestViewSet, ServiceSerializer, ServiceViewSet

### Community 23 - "devDependencies"
Cohesion: 0.17
Nodes (12): devDependencies, autoprefixer, oxlint, postcss, tailwindcss, @types/canvas-confetti, @types/node, @types/react (+4 more)

### Community 24 - "StayHive — Production-Grade Hotel Management & Booking Platform"
Cohesion: 0.13
Nodes (14): 🏗️ Architecture & Technology Stack, 🗄️ Database Schema (33 Interconnected Tables), 👥 Default User Personas & Credentials, 🌟 Key Features, 📄 License, Luxury Design & Experience, Multi-Persona Architecture, Prerequisites (+6 more)

### Community 25 - "RoomTypeSerializer"
Cohesion: 0.14
Nodes (3): RoomTypeSerializer, RoomAmenityViewSet, RoomTypeViewSet

### Community 26 - "NotificationViewSet"
Cohesion: 0.29
Nodes (5): Notification, Meta, NotificationSerializer, NotificationViewSet, action

### Community 27 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 28 - "NotificationContext.tsx"
Cohesion: 0.33
Nodes (5): NotificationContext, NotificationContextType, NotificationProvider(), Toast, ToastType

### Community 29 - "FoodOrderViewSet"
Cohesion: 0.15
Nodes (9): FoodOrderSerializer, FoodOrderViewSet, action, Food Order operations with strict transactional safety, price snapshotting,…, Create a new food order with atomic transaction, price snapshotting, and strict…, GET /api/food-orders/my/ Returns only the food orders belonging to the…, PATCH /api/food-orders/{id}/status/ Advance order status according to canonical…, POST /api/food-orders/{id}/cancel/ Customer or staff cancels a pending food… (+1 more)

### Community 30 - "Feedback"
Cohesion: 0.31
Nodes (5): Feedback, FeedbackSerializer, FeedbackViewSet, Meta, action

### Community 31 - "Inquiry"
Cohesion: 0.31
Nodes (5): Inquiry, InquirySerializer, InquiryViewSet, Meta, action

### Community 32 - "useBookings.ts"
Cohesion: 0.14
Nodes (11): API_BASE_URL, apiClient, AvailabilityParams, BookingFilters, CreateBookingPayload, useCheckInBooking(), useCheckOutBooking(), CustomerFilters (+3 more)

### Community 33 - "complaints/views.py"
Cohesion: 0.29
Nodes (4): ComplaintSerializer, ComplaintViewSet, Meta, action

### Community 34 - "HousekeepingTask"
Cohesion: 0.29
Nodes (5): HousekeepingTask, HousekeepingTaskSerializer, HousekeepingTaskViewSet, Meta, action

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
Nodes (16): RestaurantDashboard(), CreateFoodOrderPayload, FoodItem, FoodOrderDetail, FoodOrderStats, OrderItemDetail, RestaurantItem, useCreateFoodOrder() (+8 more)

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
Cohesion: 0.15
Nodes (6): AbstractBaseUser, BookingRoom, Customer, User, get_token(), STAYHIVE — CHECKPOINT 6: RESTAURANT + FOOD ORDER MANAGEMENT VERIFICATION SUITE…

### Community 64 - "FoodViewSet"
Cohesion: 0.12
Nodes (4): FoodViewSet, CRUD for Hotel Restaurants. - ADMIN, MANAGER: full CRUD - RESTAURANT,…, CRUD for Food Menu Items. - ADMIN, MANAGER, RESTAURANT: full CRUD - RECEPTION,…, RestaurantViewSet

### Community 65 - "FoodOrderPermission"
Cohesion: 0.18
Nodes (6): FoodMenuPermission, FoodOrderPermission, Permissions for Food Menu items: - Safe methods: Accessible by ADMIN, MANAGER,…, Permissions for Food Orders: - ADMIN, MANAGER, RESTAURANT: Full access to view,…, Permissions for Restaurant management: - Safe methods (GET, HEAD, OPTIONS):…, RestaurantPermission

### Community 66 - "CancellationRequest"
Cohesion: 0.38
Nodes (8): CancellationRequestSerializer, CancellationRequestViewSet, Meta, RefundSerializer, RefundViewSet, CancellationRequest, Payment, Refund

## Knowledge Gaps
- **218 isolated node(s):** `Meta`, `Meta`, `Meta`, `Meta`, `Meta` (+213 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 387 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `api_response()` connect `api_response` to `accounts/views.py`, `models.py`, `CustomerViewSet`, `Staff`, `offers/views.py`, `billing/views.py`, `reception/views.py`, `restaurant/views.py`, `BookingViewSet`, `hotels/views.py`, `RoomType`, `Booking`, `RoomTypeSerializer`, `NotificationViewSet`, `FoodOrderViewSet`, `Feedback`, `Inquiry`, `complaints/views.py`, `HousekeepingTask`, `FoodViewSet`, `CancellationRequest`?**
  _High betweenness centrality (0.101) - this node is a cross-community bridge._
- **Why does `api_error()` connect `api_response` to `complaints/views.py`, `accounts/views.py`, `models.py`, `CancellationRequest`, `HousekeepingTask`, `CustomerViewSet`, `offers/views.py`, `billing/views.py`, `reception/views.py`, `restaurant/views.py`, `BookingViewSet`, `hotels/views.py`, `RoomType`, `Booking`, `RoomTypeSerializer`, `FoodOrderViewSet`, `Feedback`, `Inquiry`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `react` connect `App.tsx` to `database.ts`, `useNotification`, `package.json`, `ReceptionDashboard.tsx`, `useRestaurant.ts`, `NotificationContext.tsx`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `Meta`, `Meta`, `Meta` to the rest of the system?**
  _218 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05651340996168582 - nodes in this community are weakly interconnected._
- **Should `database.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0951219512195122 - nodes in this community are weakly interconnected._
- **Should `accounts/views.py` be split into smaller, more focused modules?**
  _Cohesion score 0.14942528735632185 - nodes in this community are weakly interconnected._