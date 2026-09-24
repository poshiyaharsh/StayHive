# Graph Report - StayHive  (2026-09-23)

## Corpus Check
- 145 files · ~73,132 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 886 nodes · 2189 edges · 64 communities (43 shown, 14 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 152 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cd8e6139`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App.tsx
- database.ts
- accounts/views.py
- models.py
- useNotification
- rooms/views.py
- compilerOptions
- CustomerViewSet
- package.json
- What You Must Do When Invoked
- staff/views.py
- api_response
- billing/views.py
- reception/views.py
- restaurant/views.py
- compilerOptions
- BookingViewSet
- hotels/views.py
- Hotel
- ReceptionDashboard.tsx
- dependencies
- useHotels.ts
- services/views.py
- devDependencies
- StayHive — Production-Grade Hotel Management & Booking Platform
- RoomTypeSerializer
- NotificationViewSet
- graphify reference: extra exports and benchmark
- NotificationContext.tsx
- ReceptionActiveStaySerializer
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
- Staff
- StayHive Frontend — React 19, Vite & Tailwind CSS
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- ReceptionPermission
- rules/graphify.md
- extraction-spec.md
- workflows/graphify.md

## God Nodes (most connected - your core abstractions)
1. `api_response()` - 101 edges
2. `react` - 57 edges
3. `api_error()` - 53 edges
4. `useDatabase()` - 49 edges
5. `lucide-react` - 42 edges
6. `Meta` - 33 edges
7. `useNotification()` - 30 edges
8. `Booking` - 29 edges
9. `BookingViewSet` - 28 edges
10. `Button()` - 28 edges

## Surprising Connections (you probably didn't know these)
- `authenticate_stayhive_user()` --uses--> `User`  [INFERRED]
  backend/apps/accounts/auth.py → backend/apps/core/models.py
- `RoleSerializer` --uses--> `Role`  [INFERRED]
  backend/apps/accounts/serializers.py → backend/apps/core/models.py
- `UserSerializer` --uses--> `Role`  [INFERRED]
  backend/apps/accounts/serializers.py → backend/apps/core/models.py
- `UserSerializer` --uses--> `User`  [INFERRED]
  backend/apps/accounts/serializers.py → backend/apps/core/models.py
- `RegisterSerializer` --uses--> `Role`  [INFERRED]
  backend/apps/accounts/serializers.py → backend/apps/core/models.py

## Import Cycles
- None detected.

## Communities (64 total, 14 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.06
Nodes (91): App(), queryClient, ProtectedRoute(), ProtectedRouteProps, AdminDashboard(), CustomerDashboard(), HousekeepingDashboard(), RestaurantDashboard() (+83 more)

### Community 1 - "database.ts"
Cohesion: 0.10
Nodes (39): DatabaseContext, DatabaseContextType, AnalyticsOverview, ApiResponse, AvailableRoomType, Booking, BookingRoom, BookingStatus (+31 more)

### Community 2 - "accounts/views.py"
Cohesion: 0.15
Nodes (16): authenticate_stayhive_user(), get_tokens_for_user(), Generate JWT access and refresh tokens with user payload., Authenticate against custom User table with password check. Supports standard…, LoginSerializer, Meta, RegisterSerializer, RoleSerializer (+8 more)

### Community 3 - "models.py"
Cohesion: 0.13
Nodes (23): AbstractBaseUser, BookingCreateSerializer, BookingRoomSerializer, CheckInSerializer, Meta, OfferApplicationSerializer, CheckInViewSet, BookingRoom (+15 more)

### Community 4 - "useNotification"
Cohesion: 0.16
Nodes (17): RoomGrid(), DatabaseProvider(), useNotification(), RoomFilters, useCreateRoom(), useCreateRoomType(), useDeleteRoom(), useDeleteRoomType() (+9 more)

### Community 5 - "rooms/views.py"
Cohesion: 0.13
Nodes (8): RoomAmenity, RoomAmenitySerializer, action, Fast status transition: Available, Occupied, Reserved, Maintenance, Cleaning, RoomAmenityViewSet, RoomPermission, RoomTypePermission, RoomViewSet

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

### Community 10 - "staff/views.py"
Cohesion: 0.25
Nodes (6): Department, DepartmentSerializer, DepartmentViewSet, Meta, StaffSerializer, StaffViewSet

### Community 11 - "api_response"
Cohesion: 0.14
Nodes (8): api_error(), api_response(), Standard StayHive API response structure: { "success": true, "message": "...",…, Meta, OfferPackageSerializer, OfferPackageViewSet, action, RoomTypeViewSet

### Community 12 - "billing/views.py"
Cohesion: 0.11
Nodes (17): InvoiceSerializer, InvoiceViewSet, Meta, PaymentMethodSerializer, PaymentMethodViewSet, PaymentSerializer, PaymentViewSet, action (+9 more)

### Community 13 - "reception/views.py"
Cohesion: 0.09
Nodes (19): Booking, Room, CheckInRequestSerializer, CheckOutRequestSerializer, Meta, ReceptionArrivalSerializer, ReceptionCancellationSerializer, ReceptionDepartureSerializer (+11 more)

### Community 14 - "restaurant/views.py"
Cohesion: 0.17
Nodes (13): Food, OrderItem, Restaurant, FoodOrderSerializer, FoodOrderViewSet, FoodSerializer, FoodViewSet, Meta (+5 more)

### Community 15 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 16 - "BookingViewSet"
Cohesion: 0.14
Nodes (6): BookingSerializer, BookingViewSet, action, Transactional booking creation with date overlap verification, room auto-…, Public or authenticated endpoint to query available rooms and categories using…, Returns the authenticated customer's own booking history.

### Community 17 - "hotels/views.py"
Cohesion: 0.08
Nodes (21): Gallery, HotelFacility, IsAdmin, IsCustomer, IsHousekeeping, IsManager, IsReception, IsRestaurant (+13 more)

### Community 18 - "Hotel"
Cohesion: 0.22
Nodes (4): AnalyticsOverviewView, APIView, Hotel, RoomSerializer

### Community 19 - "ReceptionDashboard.tsx"
Cohesion: 0.19
Nodes (17): ReceptionDashboard(), useHotels(), CheckInPayload, CheckOutPayload, ReceptionActiveStay, ReceptionArrival, ReceptionCancellation, ReceptionDashboardStats (+9 more)

### Community 20 - "dependencies"
Cohesion: 0.14
Nodes (14): dependencies, axios, canvas-confetti, clsx, framer-motion, lucide-react, react, react-dom (+6 more)

### Community 21 - "useHotels.ts"
Cohesion: 0.16
Nodes (10): API_BASE_URL, apiClient, HotelFilters, useCreateHotel(), useDeleteHotel(), useUpdateHotel(), HotelsPage(), Gallery (+2 more)

### Community 22 - "services/views.py"
Cohesion: 0.24
Nodes (7): Service, Meta, action, ServiceRequestSerializer, ServiceRequestViewSet, ServiceSerializer, ServiceViewSet

### Community 23 - "devDependencies"
Cohesion: 0.17
Nodes (12): devDependencies, autoprefixer, oxlint, postcss, tailwindcss, @types/canvas-confetti, @types/node, @types/react (+4 more)

### Community 24 - "StayHive — Production-Grade Hotel Management & Booking Platform"
Cohesion: 0.13
Nodes (14): 🏗️ Architecture & Technology Stack, 🗄️ Database Schema (33 Interconnected Tables), 👥 Default User Personas & Credentials, 🌟 Key Features, 📄 License, Luxury Design & Experience, Multi-Persona Architecture, Prerequisites (+6 more)

### Community 26 - "NotificationViewSet"
Cohesion: 0.29
Nodes (5): Notification, Meta, NotificationSerializer, NotificationViewSet, action

### Community 27 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 28 - "NotificationContext.tsx"
Cohesion: 0.17
Nodes (10): NotificationContext, NotificationContextType, NotificationProvider(), Toast, ToastType, CustomerFilters, useCurrentCustomer(), useUpdateCustomer() (+2 more)

### Community 30 - "Feedback"
Cohesion: 0.31
Nodes (5): Feedback, FeedbackSerializer, FeedbackViewSet, Meta, action

### Community 31 - "Inquiry"
Cohesion: 0.31
Nodes (5): Inquiry, InquirySerializer, InquiryViewSet, Meta, action

### Community 32 - "useBookings.ts"
Cohesion: 0.18
Nodes (10): BookingWizard(), AvailabilityParams, BookingFilters, CreateBookingPayload, useAvailability(), useCheckInBooking(), useCheckOutBooking(), useCreateBooking() (+2 more)

### Community 33 - "complaints/views.py"
Cohesion: 0.29
Nodes (4): ComplaintSerializer, ComplaintViewSet, Meta, action

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

### Community 53 - "Staff"
Cohesion: 0.40
Nodes (3): Staff, HousekeepingTaskSerializer, Meta

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

## Knowledge Gaps
- **213 isolated node(s):** `Meta`, `Meta`, `Meta`, `Meta`, `Meta` (+208 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 356 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `api_response()` connect `api_response` to `complaints/views.py`, `accounts/views.py`, `models.py`, `HousekeepingTaskViewSet`, `rooms/views.py`, `CustomerViewSet`, `staff/views.py`, `billing/views.py`, `reception/views.py`, `restaurant/views.py`, `BookingViewSet`, `hotels/views.py`, `Staff`, `services/views.py`, `NotificationViewSet`, `ReceptionActiveStaySerializer`, `Feedback`, `Inquiry`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **Why does `react` connect `App.tsx` to `database.ts`, `useNotification`, `package.json`, `ReceptionDashboard.tsx`, `NotificationContext.tsx`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `api_error()` connect `api_response` to `complaints/views.py`, `accounts/views.py`, `models.py`, `rooms/views.py`, `CustomerViewSet`, `billing/views.py`, `reception/views.py`, `restaurant/views.py`, `BookingViewSet`, `hotels/views.py`, `Staff`, `services/views.py`, `Feedback`, `Inquiry`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **What connects `Meta`, `Meta`, `Meta` to the rest of the system?**
  _213 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05870186151876293 - nodes in this community are weakly interconnected._
- **Should `database.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0951219512195122 - nodes in this community are weakly interconnected._
- **Should `models.py` be split into smaller, more focused modules?**
  _Cohesion score 0.13076923076923078 - nodes in this community are weakly interconnected._