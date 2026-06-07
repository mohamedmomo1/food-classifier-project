# BEFIT - Graduation Project Documentation Diagrams

هذا المستند يحتوي على الرسوم التخطيطية البرمجية لمشروع التخرج لتطبيق **BEFIT**.
This document contains the official software engineering and database diagrams designed for the **BEFIT** graduation project.

---

## 1. System Context Diagram | مخطط سياق النظام

Shows the high-level boundaries of the BEFIT application and how it communicates with users, coaches, camera hardware, and system administrators.
يوضح الحدود العامة للنظام وتفاعله مع العناصر الخارجية والمستخدمين.

```mermaid
graph TD
  subgraph BEFIT_System_Boundary ["BEFIT Web Application"]
    befit["🏋️ BEFIT System"]
  end

  subgraph Actors ["Actors & External Systems"]
    sub["👤 Subscriber"]
    coach["👨‍🏫 Coach"]
    camera["📷 Camera Hardware"]
    admin["🔑 System Admin"]
  end

  sub -->|Logs meals, scans food, subscribes to plans| befit
  befit -->|Displays macros, plans, progress logs| sub

  coach -->|Creates plans, views client history| befit
  befit -->|Displays student progress & plans| coach

  camera -->|Captures food snapshots| befit
  befit -->|Triggers prediction requests| camera

  admin -->|Seeds foods, monitors logs, maintains system| befit
  befit -->|Provides health logs & user stats| admin
```

---

## 2. Use Case Diagram | مخطط حالات الاستخدام

Illustrates the roles of the Coach versus the Subscriber and the specific actions they can perform within the system.
يوضح أدوار كل من المشترك والكوتش وحالات الاستخدام الخاصة بكل منهما.

```mermaid
graph LR
  subgraph BEFIT_System ["BEFIT System Boundary"]
    uc1((UC1: Register / Login))
    uc2((UC2: Search & Browse Food))
    uc3((UC3: Log Meals Manually))
    uc4((UC4: Scan Food SmartScanner))
    uc5((UC5: View Daily Progress))
    uc6((UC6: Subscribe to Diet Plan))
    uc7((UC7: Cancel Subscription))
    uc8((UC8: View Reports))
    
    uc9((UC9: Create Diet Plan))
    uc10((UC10: Edit/Delete Plans))
    uc11((UC11: Monitor Subscriber History))
  end

  subgraph Actors
    Subscriber((👤 Subscriber))
    Coach((👨‍🏫 Coach))
  end

  %% Subscriber Relations
  Subscriber --> uc1
  Subscriber --> uc2
  Subscriber --> uc3
  Subscriber --> uc4
  Subscriber --> uc5
  Subscriber --> uc6
  Subscriber --> uc7
  Subscriber --> uc8

  %% Coach Relations
  Coach --> uc1
  Coach --> uc9
  Coach --> uc10
  Coach --> uc11
  Coach --> uc2

  %% Use Case dependencies
  uc4 -.->|"<<include>> Predict Image"| uc3
  uc6 -.->|"<<include>> Search Plan"| uc1
```

---

## 3. System Architecture Diagram | مخطط هندسة النظام

Displays the three-tier system architecture: React single-page frontend application, Django REST backend framework with YOLO classifier model integration, and MongoDB storage.
يوضح البنية الهندسية ثلاثية الطبقات للتطبيق: الواجهة الأمامية، الخلفية، المعالجة، وقاعدة البيانات.

```mermaid
graph TD
  subgraph Presentation_Layer ["Presentation Layer - Frontend"]
    SPA["React 18 + Vite SPA"]
    Router["React Router v6"]
    ToastContext["Toast & Confirm Context"]
    LangContext["Language Context (i18n)"]
    Components["UI Components (SmartScanner, SubscriberPanel, CoachPanel, FoodSearch, MealHistory)"]
    Styles["Vanilla CSS (Dark Mode & Responsive)"]
  end

  subgraph Application_Layer ["Application Layer - Backend"]
    DRF["Django REST Framework APIs"]
    AuthModule["Authentication Module (bcrypt)"]
    FoodModule["Food Search & Predict Module"]
    MealModule["Meal Log CRUD Module"]
    PlanModule["Diet Plan CRUD Module"]
    SubModule["Subscription Module"]
    MLPipeline["YOLO Inference Engine (PyTorch)"]
  end

  subgraph Data_Layer ["Data & Storage Layer"]
    PyMongo["PyMongo Database Client"]
    MongoDB[("MongoDB Database")]
    StaticAssets["Local File Assets (/static/food_images/)"]
  end

  SPA --> Router
  SPA --> ToastContext
  SPA --> LangContext
  Components --> SPA
  Components --> Styles

  Components -->|REST HTTP Requests| DRF
  DRF --> AuthModule
  DRF --> FoodModule
  DRF --> MealModule
  DRF --> PlanModule
  DRF --> SubModule

  FoodModule --> MLPipeline
  
  AuthModule --> PyMongo
  FoodModule --> PyMongo
  MealModule --> PyMongo
  PlanModule --> PyMongo
  SubModule --> PyMongo

  PyMongo --> MongoDB
  Components -->|Load Static Images| StaticAssets
```

---

## 4. Entity Relationship Diagram (ERD) | مخطط علاقات الكيانات

Defines the structure of MongoDB collections, field types, primary keys, indexes, and multiplicities matching our database schema.
يوضح هيكل الجداول والروابط والماكروز والخصائص لكل كيان في قاعدة البيانات.

```mermaid
erDiagram
  USERS {
    ObjectId _id PK
    string name
    string email UK
    string password_hash
    int age
    string gender
    double weight_kg
    double height_cm
    string activity_level
    string user_type "subscriber | coach"
    ObjectId coach_id FK "References USERS(_id)"
    string language "ar | en"
    date created_at
    date updated_at
  }

  FOOD {
    ObjectId _id PK
    int food_id
    string name
    string name_ar
    double calories
    double protein
    double carbs
    double fat
    string serving_unit
    string meal_type "breakfast | lunch | dinner | snack"
    string image_url
    date created_at
  }

  MEAL_LOGS {
    ObjectId _id PK
    ObjectId user_id FK "References USERS(_id)"
    ObjectId food_id FK "References FOOD(_id)"
    string food_name
    string food_name_ar
    string meal_type
    double quantity
    string serving_unit
    double calories_consumed
    double protein_consumed
    double carbs_consumed
    double fat_consumed
    date date
    date logged_at
  }

  DIET_PLANS {
    ObjectId _id PK
    ObjectId coach_id FK "References USERS(_id)"
    string name
    string description
    object daily_targets "Calories, Protein, Carbs, Fat"
    boolean is_active
    date created_at
    date updated_at
  }

  DIET_PLAN_ITEMS {
    ObjectId food_id FK "References FOOD(_id)"
    string meal_type "breakfast | lunch | dinner | snack"
    double quantity
    string serving_unit
    double calories
    double protein
    double carbs
    double fat
  }

  COACH_SUBSCRIPTIONS {
    ObjectId _id PK
    ObjectId coach_id FK "References USERS(_id)"
    ObjectId subscriber_id FK "References USERS(_id)"
    ObjectId diet_plan_id FK "References DIET_PLANS(_id)"
    string status "active | paused | ended"
    date start_date
    date end_date
  }

  USERS ||--o{ MEAL_LOGS : "logs"
  FOOD ||--o{ MEAL_LOGS : "logged_in"
  USERS ||--o{ DIET_PLANS : "creates"
  DIET_PLANS ||--o{ DIET_PLAN_ITEMS : "contains"
  FOOD ||--o{ DIET_PLAN_ITEMS : "defines"
  USERS ||--o{ COACH_SUBSCRIPTIONS : "manages"
  DIET_PLANS ||--o{ COACH_SUBSCRIPTIONS : "linked_in"
```

---

## 5. Class Diagram | مخطط الفئات والكيانات البرمجية

Traces the core data models, database management classes, and business logic controller views in our Django app.
يوضح التركيب البرمجي للكود وهيكل الفئات والخصائص والعمليات المتاحة.

```mermaid
classDiagram
  class User {
    +ObjectId id
    +string name
    +string email
    +string password_hash
    +int age
    +string gender
    +double weight_kg
    +double height_cm
    +string user_type
    +ObjectId coach_id
    +calculateTargets() DailyTargets
  }

  class Food {
    +ObjectId id
    +int food_id
    +string name
    +string name_ar
    +double calories
    +double protein
    +double carbs
    +double fat
    +string serving_unit
    +string meal_type
    +string image_url
  }

  class MealLog {
    +ObjectId id
    +ObjectId user_id
    +ObjectId food_id
    +string food_name
    +string meal_type
    +double quantity
    +double calories_consumed
    +double protein_consumed
    +double carbs_consumed
    +double fat_consumed
    +date date
    +logged_at date
  }

  class DietPlan {
    +ObjectId id
    +ObjectId coach_id
    +string name
    +string description
    +object meals
    +object daily_targets
    +boolean is_active
  }

  class Subscription {
    +ObjectId id
    +ObjectId coach_id
    +ObjectId subscriber_id
    +ObjectId diet_plan_id
    +string status
    +date start_date
    +date end_date
  }

  class DatabaseManager {
    <<utility>>
    +get_db()
    +get_collection(name)
    +init_mongo_indexes()
  }

  class AuthController {
    +register(request)
    +login(request)
    +update_user(request, user_id)
  }

  class FoodController {
    +search_foods(request)
    +predict_food_image(request)
  }

  class MealController {
    +log_meal(request)
    +get_history(request)
    +get_summary(request)
    +update_meal(request, meal_id)
    +delete_meal(request, meal_id)
  }

  class CoachController {
    +create_diet_plan(request)
    +get_diet_plans(request)
    +update_diet_plan(request, plan_id)
    +delete_diet_plan(request, plan_id)
    +create_subscription(request)
    +get_subscriptions(request)
    +cancel_subscription(request, subscriber_id)
  }

  %% Relations
  User "1" --> "*" MealLog : "tracks"
  User "1" --> "*" DietPlan : "creates"
  User "1" --> "0..1" Subscription : "subscribes"
  DietPlan "1" --> "*" Food : "references"
  MealLog "*" --> "1" Food : "records"
  Subscription "1" --> "1" DietPlan : "assigns"
  AuthController --> DatabaseManager : "uses"
  FoodController --> DatabaseManager : "uses"
  MealController --> DatabaseManager : "uses"
  CoachController --> DatabaseManager : "uses"
```

---

## 6. Sequence Diagram: Plan Creation & Subscription Flow | مخطط التتابع لإنشاء الخطة والاشتراك

Traces the step-by-step process of a Coach creating a diet plan with food selections, followed by a Subscriber searching for and subscribing to it.
يوضح تسلسل الخطوات البرمجية عند قيام الكوتش بإنشاء خطة غذائية وبحث المشترك عنها والاشتراك بها.

```mermaid
sequenceDiagram
  autonumber
  actor Coach as 👨‍🏫 Coach
  actor Subscriber as 👤 Subscriber
  participant FE as 🖥️ React Frontend
  participant BE as ⚙️ Django Backend API
  database DB as 🗄️ MongoDB

  %% Phase 1: Plan Creation
  note over Coach, DB: Phase 1: Coach Creates a Unique Diet Plan
  Coach->>FE: Open Coach Panel & click "Add Plan"
  FE->>BE: GET /api/foods/search/?query=all (Populates food list)
  BE->>DB: Fetch 66 food items catalog
  DB-->>BE: Return food items
  BE-->>FE: Return foods lists
  Coach->>FE: Select foods, set quantities, name plan (e.g. "Big Ramy Plan")
  FE->>FE: Calculate daily totals (Calories, Protein, Carbs, Fat)
  Coach->>FE: Click "Create Diet Plan"
  FE->>BE: POST /api/diet-plans/ (plan payload)
  activate BE
  BE->>DB: Insert plan document into diet_plans collection
  DB-->>BE: Return inserted plan info
  BE-->>FE: Return success response { "success": true }
  deactivate BE
  FE-->>Coach: Display toast "Plan Created Successfully"

  %% Phase 2: Subscriber Search & Subscription
  note over Subscriber, DB: Phase 2: Subscriber Searches and Subscribes to Plan
  Subscriber->>FE: Open Dashboard (Render Search Plan view)
  Subscriber->>FE: Type "big ramy" (case-insensitive)
  FE->>BE: GET /api/diet-plans/list/
  activate BE
  BE->>DB: Fetch all active plans
  DB-->>BE: Return plans array
  BE-->>FE: Return plans array
  deactivate BE
  FE->>FE: Perform case-insensitive client-side search match (.toLowerCase())
  FE-->>Subscriber: Render "Big Ramy Plan" details & targets
  Subscriber->>FE: Click "Subscribe Now"
  FE->>BE: POST /api/subscriptions/ (subscriber_id, coach_id, diet_plan_id)
  activate BE
  BE->>DB: Insert subscription document (status: 'active')
  BE->>DB: Update subscriber user profile (coach_id)
  DB-->>BE: Success
  BE-->>FE: Return success response { "success": true }
  deactivate BE
  FE->>FE: Save coach_id to localStorage
  FE->>FE: Re-fetch client profile & today's meals
  FE-->>Subscriber: Show Success Toast & Render Active Dashboard Banner
```

---

## 7. Activity Diagram: SmartScanner Food Logging | مخطط النشاط

Flowchart detailing the operation of the SmartScanner camera feature, backend YOLO prediction matching, and logging items.
يوضح تدفق العمليات عند مسح الطعام بالكاميرا الذكية ومعالجة الصورة وتأكيد الإضافة.

```mermaid
flowchart TD
  start([Start: User opens SmartScanner]) --> open_camera[Open Web Camera View]
  open_camera --> capture_img{Capture Snapshot?}
  
  capture_img -- No --> manually_select[Use Autocomplete Dropdown Search]
  manually_select --> format_dropdown[Display 'name_ar - name' bilingual suggestions]
  format_dropdown --> select_item[Select Food Item]
  
  capture_img -- Yes --> upload_payload[Send Image File to Backend]
  upload_payload --> predict_api[POST /api/foods/predict/ multipart/form-data]
  
  subgraph Backend_Prediction_Pipeline ["Django Backend ML Pipeline"]
    predict_api --> run_yolo[Run YOLO Image Object Detection]
    run_yolo --> classify_food[Identify Food & Confidence Score]
    classify_food --> fetch_macros[Query Food Catalog for Nutrients]
  end
  
  fetch_macros --> return_matches[Return Predict Array to Frontend]
  return_matches --> render_options[Display Predicted Food Cards]
  render_options --> select_predict[Select/Confirm Predicted Food Item]
  
  select_item --> input_qty[Open Add Meal Modal]
  select_predict --> input_qty
  
  input_qty --> select_type[Select Meal Type: Breakfast/Lunch/Dinner/Snack]
  select_type --> enter_qty[Enter Quantity & Date]
  enter_qty --> click_add[Click Log Meal Button]
  
  click_add --> log_api[POST /api/meals/log/]
  log_api --> calc_consumed[Calculate Macros Consumed: quantity * values]
  calc_consumed --> save_log[Save MealLog Document to MongoDB]
  
  save_log --> return_success[Return Success Response]
  return_success --> show_toast[Display Floating Success Toast Notification]
  show_toast --> refresh_dashboard[Refresh User Dashboard Metrics & Progress Bar]
  refresh_dashboard --> end_node([End: Meal successfully logged])
```

---

## 8. Sequence Diagram: SmartScanner ML Detection & Logging | مخطط التتابع للمسح الذكي والتعرف على الأطعمة

Detailed tracing of the message exchanges during camera frame capture, YOLO food classification, macro matching, and database persistence.
يوضح تسلسل التفاعل بين الكاميرا، معالجة YOLO، وجلب العناصر الغذائية وتسجيل الوجبة.

```mermaid
sequenceDiagram
  autonumber
  actor Subscriber as 👤 Subscriber
  participant UI as 🖥️ SmartScanner Component
  participant Context as 🗣️ Language / Toast Context
  participant Camera as 📷 Device Camera API
  participant API as ⚙️ Django REST API (port 8000)
  participant YOLO as 🧠 YOLO Inference Pipeline
  database DB as 🗄️ MongoDB (food_database & meal_logs)

  Subscriber->>UI: Click "SmartScanner" in Navigation
  UI->>Camera: Request camera access permission
  Camera-->>UI: Grant access & display live stream
  Subscriber->>UI: Position food item and click "Capture Image"
  UI->>Camera: Capture image frame
  Camera-->>UI: Return image binary/base64
  UI->>UI: Show processing skeleton spinner
  UI->>API: POST /api/foods/predict/ (multipart/form-data image)
  activate API
  API->>YOLO: Pass image frame to YOLO object detector
  activate YOLO
  YOLO->>YOLO: Run image model inference (shape classification)
  YOLO-->>API: Return prediction name and confidence score (e.g., "Pizza")
  deactivate YOLO
  API->>DB: Query food catalog details by matching name
  DB-->>API: Return food macros (calories, protein, carbs, fat, serving_unit)
  API-->>UI: Return JSON results: { success: true, predictions: [...] }
  deactivate API
  
  UI-->>Subscriber: Display predicted food card (image + name + unit macros)
  Subscriber->>UI: Confirm predicted item & enter quantity + meal type (e.g., lunch)
  Subscriber->>UI: Click "Log Meal"
  UI->>API: POST /api/meals/log/ (user_id, food_id, quantity, meal_type, date)
  activate API
  API->>DB: Insert meal session item into meal_logs collection
  DB-->>API: Return success response
  API-->>UI: Response: { success: true, meal: {...} }
  deactivate API
  UI->>Context: Call toast.success("Meal Added Successfully!")
  Context-->>Subscriber: Show animated success toast notification
  UI->>UI: Trigger Dashboard metrics re-calculation
  UI-->>Subscriber: Navigate back to Dashboard with updated metrics
```

---

## 9. Sequence Diagram: 30-Day Compliance Report Generation | مخطط تتابع تقرير الالتزام لـ 30 يوماً

Depicts how daily meals summary logs are aggregated for the past month, compared with the active plan targets, and prepared for printing.
يوضح كيفية تجميع وجبات آخر 30 يوماً ومقارنتها بأهداف المشترك وحساب معدل الالتزام وتجهيزها للطباعة.

```mermaid
sequenceDiagram
  autonumber
  actor Subscriber as 👤 Subscriber
  participant UI as 🖥️ SubscriberPanel Component
  participant Context as 🗣️ Language Context (i18n)
  participant API as ⚙️ Django REST API (port 8000)
  database DB as 🗄️ MongoDB (meal_logs & diet_plans)

  Subscriber->>UI: Open Subscriber Dashboard
  UI->>API: GET /api/subscriptions/list/?subscriber_id={id}
  activate API
  API->>DB: Fetch active coach subscriptions and assigned diet plan
  DB-->>API: Return subscription (coach info, diet_plan_id)
  API-->>UI: Response
  deactivate API

  UI->>API: GET /api/meals/history/?user_id={id}&start_date={today}&end_date={today}
  activate API
  API->>DB: Fetch all meal_logs matching today's date
  DB-->>API: Return today's meals list
  API-->>UI: Response
  deactivate API
  UI->>UI: Compute daily totals & target percentage compliance
  UI-->>Subscriber: Render Progress Bar and Today's Summary card

  Subscriber->>UI: Click "View Comprehensive Report"
  UI->>UI: Show report loading skeleton spinner
  UI->>API: GET /api/meals/history/?user_id={id}&start_date={today-30d}&end_date={today}
  activate API
  API->>DB: Fetch last 30 days of meal logs
  DB-->>API: Return history array
  API-->>UI: Response
  deactivate API
  
  UI->>UI: Calculate compliance score (days meeting 85-115% calorie targets)
  UI->>UI: Calculate average daily macros (Protein, Carbs, Fat)
  UI->>UI: Calculate total active logged days
  UI-->>Subscriber: Render report modal displaying graphs, macro bars & stats
  
  Subscriber->>UI: Click "Print Report"
  UI->>UI: Trigger window.print() (loads print CSS stylesheet)
  UI-->>Subscriber: Open browser print dialog with formatted PDF preview
```
