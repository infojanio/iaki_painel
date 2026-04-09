import { createBrowserRouter } from "react-router-dom";

import { AppLayout } from "@/pages/_layouts/app";
import { AuthLayout } from "@/pages/_layouts/auth";
import { NotFound } from "@/pages/404";
import { Error } from "@/pages/error";
import { Unauthorized } from "@/pages/Unauthorized";

/* ================= AUTH ================= */
import { SignIn } from "@/pages/auth/sign-in";
import { SignUp } from "@/pages/auth/sign-up";

/* ================= GUARDS ================= */
import { PrivateRoute } from "./routes/guards/PrivateRoute";
import { RoleGuard } from "./routes/guards/RoleGuard";

/* ================= DASHBOARD ================= */
import { Dashboard } from "@/pages/app/dashboard/dashboard";

/* ================= ORDERS ================= */
import { Orders } from "@/pages/app/orders/orders";
import { PendingOrdersPage } from "@/pages/app/orders/pending/PendingOrdersPage";
import { OrderValidationPage } from "@/pages/app/orders/OrderValidatePage";

/* ================= PRODUCTS ================= */
import { ProductList } from "@/pages/app/products/ProductList";
import { ProductListAll } from "@/pages/app/products/ProductListAll";
import { ProductNew } from "@/pages/app/products/ProductNew";
import { ProductEdit } from "@/pages/app/products/ProductEdit";

/* ================= BANNERS ================= */
import { BannerList } from "@/pages/app/banners/banner-list";
import { BannerNew } from "@/pages/app/banners/banner-new";
import { BannerEdit } from "@/pages/app/banners/banner-edit";

/* ================= REELS ================= */
import { ReelList } from "@/pages/app/reels/reel-list";
import { ReelNew } from "@/pages/app/reels/reel-new";
import { ReelEdit } from "@/pages/app/reels/reel-edit";

/* ================= CATEGORIES ================= */
import { CategoryList } from "@/pages/app/categories/CategoryList";
import { CategoryNew } from "@/pages/app/categories/CategoryNew";
import { CategoryEdit } from "@/pages/app/categories/CategoryEdit";

/* ================= SUBCATEGORIES ================= */
import { SubcategoryList } from "@/pages/app/subcategories/SubcategoryList";
import { SubcategoryNew } from "@/pages/app/subcategories/SubcategoryNew";
import { SubcategoryEdit } from "@/pages/app/subcategories/SubcategoryEdit";

/* ================= STATES ================= */
import { StateList } from "./pages/app/states/state-list";
import { StateNew } from "./pages/app/states/state-new";
import { StateEdit } from "./pages/app/states/state-edit";

/* ================= CITIES ================= */
import { CityList } from "./pages/app/cities/city-list";
import { CityNew } from "./pages/app/cities/city-new";
import { CityEdit } from "./pages/app/cities/city-edit";

/* ================= BUSINESS CATEGORIES ================= */
import { BusinessCategoryList } from "./pages/app/businessCategory/business-category-list";
import { BusinessCategoryNew } from "./pages/app/businessCategory/business-category-new";
import { BusinessCategoryEdit } from "./pages/app/businessCategory/business-category-edit";

/* ================= LINKS ================= */
import { BusinessCategoryCityLink } from "./pages/app/businessCategoryCityLink/business-category-city-link";
import { StoreBusinessCategoryLinkPage } from "./pages/app/StoreBusinessCategoryLink/store-business-category-link";

/* ================= STORES ================= */
import { StoreList } from "./pages/app/stores/store-list";
import { StoreNew } from "./pages/app/stores/store-new";
import { StoreEdit } from "./pages/app/stores/store-edit";
import { PlansListPage } from "./pages/app/plans/PlansListPage";
import { CreatePlanPage } from "./pages/app/plans/CreatePlanPage";
import { EditPlanPage } from "./pages/app/plans/EditPlanPage";

import { MySubscriptionPage } from "./pages/app/subscriptions/MySubscriptionPage";
import { SubscriptionsListPage } from "./pages/app/subscriptions/SubscriptionsListPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PrivateRoute>
        <AppLayout />
      </PrivateRoute>
    ),
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },

      /* =========================================================
       * ADMIN - OPERAÇÃO DA LOJA
       * ========================================================= */

      /* ================= ORDERS (ADMIN) ================= */
      {
        path: "orders",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <Orders />
          </RoleGuard>
        ),
      },
      {
        path: "orders/pending",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <PendingOrdersPage />
          </RoleGuard>
        ),
      },
      {
        path: "orders/validate",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <OrderValidationPage />
          </RoleGuard>
        ),
      },

      /* ================= PRODUCTS (ADMIN) ================= */
      {
        path: "products",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <ProductList />
          </RoleGuard>
        ),
      },
      {
        path: "products/all",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <ProductListAll />
          </RoleGuard>
        ),
      },
      {
        path: "products/new",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <ProductNew />
          </RoleGuard>
        ),
      },
      {
        path: "products/edit/:id",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <ProductEdit />
          </RoleGuard>
        ),
      },

      /* ================= CATEGORIES INTERNAS (ADMIN) ================= */
      {
        path: "categories",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <CategoryList />
          </RoleGuard>
        ),
      },
      {
        path: "categories/new",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <CategoryNew />
          </RoleGuard>
        ),
      },
      {
        path: "categories/edit/:id",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <CategoryEdit />
          </RoleGuard>
        ),
      },

      /* ================= SUBCATEGORIES INTERNAS (ADMIN) ================= */
      {
        path: "subcategories",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <SubcategoryList />
          </RoleGuard>
        ),
      },
      {
        path: "subcategories/new",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <SubcategoryNew />
          </RoleGuard>
        ),
      },
      {
        path: "subcategories/edit/:id",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <SubcategoryEdit />
          </RoleGuard>
        ),
      },

      /* =========================================================
       * SUPER_ADMIN - ESTRUTURA DO MARKETPLACE
       * ========================================================= */

      /* ================= STATES (SUPER_ADMIN) ================= */
      {
        path: "states",
        element: (
          <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
            <StateList />
          </RoleGuard>
        ),
      },
      {
        path: "states/new",
        element: (
          <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
            <StateNew />
          </RoleGuard>
        ),
      },
      {
        path: "states/edit/:stateId",
        element: (
          <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
            <StateEdit />
          </RoleGuard>
        ),
      },

      /* ================= CITIES (SUPER_ADMIN) ================= */
      {
        path: "cities",
        element: (
          <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
            <CityList />
          </RoleGuard>
        ),
      },
      {
        path: "cities/new",
        element: (
          <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
            <CityNew />
          </RoleGuard>
        ),
      },
      {
        path: "cities/edit/:cityId",
        element: (
          <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
            <CityEdit />
          </RoleGuard>
        ),
      },

      /* ================= BUSINESS CATEGORIES (SUPER_ADMIN) ================= */
      {
        path: "business-categories",
        element: (
          <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
            <BusinessCategoryList />
          </RoleGuard>
        ),
      },
      {
        path: "business-categories/new",
        element: (
          <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
            <BusinessCategoryNew />
          </RoleGuard>
        ),
      },
      {
        path: "business-categories/edit/:id",
        element: (
          <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
            <BusinessCategoryEdit />
          </RoleGuard>
        ),
      },

      /* ================= BUSINESS CATEGORY ↔ CITY (SUPER_ADMIN) ================= */
      {
        path: "business-categories-cities",
        element: (
          <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
            <BusinessCategoryCityLink />
          </RoleGuard>
        ),
      },

      /* ================= STORE ↔ BUSINESS CATEGORY (SUPER_ADMIN) ================= */
      {
        path: "store-business-categories",
        element: (
          <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
            <StoreBusinessCategoryLinkPage />
          </RoleGuard>
        ),
      },

      /* ================= STORES (SUPER_ADMIN) ================= */
      {
        path: "stores",
        element: (
          <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
            <StoreList />
          </RoleGuard>
        ),
      },
      {
        path: "stores/new",
        element: (
          <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
            <StoreNew />
          </RoleGuard>
        ),
      },
      {
        path: "stores/edit/:id",
        element: (
          <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
            <StoreEdit />
          </RoleGuard>
        ),
      },

      /* ================= BANNERS (SUPER_ADMIN) ================= */
      {
        path: "banners",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <BannerList />
          </RoleGuard>
        ),
      },
      {
        path: "banners/new",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <BannerNew />
          </RoleGuard>
        ),
      },
      {
        path: "banners/edit/:id",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <BannerEdit />
          </RoleGuard>
        ),
      },

      /* ================= REELS (ADMIN) ================= */
      {
        path: "reels",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <ReelList />
          </RoleGuard>
        ),
      },
      {
        path: "reels/new",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <ReelNew />
          </RoleGuard>
        ),
      },
      {
        path: "reels/edit/:id",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <ReelEdit />
          </RoleGuard>
        ),
      },

      /* ================= SUBSCRIPTIONS (ADMIN) ================= */
      {
        path: "subscriptions",
        element: (
          <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
            <SubscriptionsListPage />
          </RoleGuard>
        ),
      },

      /* ================= PRODUCTS (ADMIN) ================= */
      {
        path: "/stores/:storeId/products",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <ProductList />
          </RoleGuard>
        ),
      },

      {
        path: "products",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <ProductList />
          </RoleGuard>
        ),
      },

      {
        path: "products/new",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <ProductNew />
          </RoleGuard>
        ),
      },
      {
        path: "products/edit/:id",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <ProductEdit />
          </RoleGuard>
        ),
      },

      /* ================= CATEGORIES (ADMIN) ================= */
      {
        path: "categories",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <CategoryList />
          </RoleGuard>
        ),
      },
      {
        path: "categories/new",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <CategoryNew />
          </RoleGuard>
        ),
      },
      {
        path: "categories/edit/:id",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <CategoryEdit />
          </RoleGuard>
        ),
      },

      /* ================= SUBCATEGORIES (ADMIN) ================= */
      {
        path: "subcategories",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <SubcategoryList />
          </RoleGuard>
        ),
      },
      {
        path: "subcategories/new",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <SubcategoryNew />
          </RoleGuard>
        ),
      },
      {
        path: "subcategories/edit/:id",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <SubcategoryEdit />
          </RoleGuard>
        ),
      },

      /* ================= ORDERS (ADMIN) ================= */
      {
        path: "orders",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <Orders />
          </RoleGuard>
        ),
      },
      {
        path: "orders/pending",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <PendingOrdersPage />
          </RoleGuard>
        ),
      },
      {
        path: "pedidos/validar",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <OrderValidationPage />
          </RoleGuard>
        ),
      },

      /* ================= PLANS ================= */

      // SUPER_ADMIN
      {
        path: "plans",
        element: (
          <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
            <PlansListPage />
          </RoleGuard>
        ),
      },
      {
        path: "plans/create",
        element: (
          <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
            <CreatePlanPage />
          </RoleGuard>
        ),
      },
      {
        path: "plans/:id/edit",
        element: (
          <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
            <EditPlanPage />
          </RoleGuard>
        ),
      },

      // ADMIN (compra de planos)
      {
        path: "plans/subscribe",
        element: (
          <RoleGuard allowedRoles={["ADMIN"]}>
            <MySubscriptionPage />
          </RoleGuard>
        ),
      },
    ],
  },
  /* ================= FIM APP LAYOUT================= */

  /* ================= INÍCIO AUTH LAYOUT================= */
  {
    path: "/sign-in",
    element: <AuthLayout />,
    children: [{ index: true, element: <SignIn /> }],
  },
  {
    path: "/sign-up",
    element: <AuthLayout />,
    children: [{ index: true, element: <SignUp /> }],
  },

  /* ================= UNAUTHORIZED ================= */
  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },

  /* ================= NOT FOUND ================= */
  {
    path: "*",
    element: <NotFound />,
  },
]);
