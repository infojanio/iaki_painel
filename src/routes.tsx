// src/routes/index.tsx

import { createBrowserRouter } from "react-router-dom";

import { AppLayout } from "@/pages/_layouts/app";
import { AuthLayout } from "@/pages/_layouts/auth";
import { NotFound } from "@/pages/404";
import { Error } from "@/pages/error";

import { Unauthorized } from "@/pages/Unauthorized";

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

/* ================= AUTH ================= */
import { SignIn } from "@/pages/auth/sign-in";
import { SignUp } from "@/pages/auth/sign-up";
import { PrivateRoute } from "./routes/guards/PrivateRoute";
import { RoleGuard } from "./routes/guards/RoleGuard";
import { CityEdit } from "./pages/app/cities/city-edit";
import { CityList } from "./pages/app/cities/city-list";
import { CityNew } from "./pages/app/cities/city-new";
import { StateList } from "./pages/app/states/state-list";
import { StateNew } from "./pages/app/states/state-new";
import { StateEdit } from "./pages/app/states/state-edit";
import { BusinessCategoryEdit } from "./pages/app/businessCategory/business-category-edit";
import { BusinessCategoryList } from "./pages/app/businessCategory/business-category-list";
import { BusinessCategoryNew } from "./pages/app/businessCategory/business-category-new";
import { BusinessCategoryCityLink } from "./pages/app/businessCategoryCityLink/business-category-city-link";
import { StoreEdit } from "./pages/app/stores/store-edit";
import { StoreList } from "./pages/app/stores/store-list";
import { StoreNew } from "./pages/app/stores/store-new";
import { StoreBusinessCategoryLinkPage } from "./pages/app/StoreBusinessCategoryLink/store-business-category-link";

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
      /* ================= DASHBOARD ================= */
      {
        index: true,
        element: <Dashboard />,
      },

      /* ================= ORDERS (ADMIN + SUPER_ADMIN) ================= */
      {
        path: "orders",
        element: (
          <RoleGuard allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
            <Orders />
          </RoleGuard>
        ),
      },
      {
        path: "orders/pending",
        element: (
          <RoleGuard allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
            <PendingOrdersPage />
          </RoleGuard>
        ),
      },
      {
        path: "pedidos/validar",
        element: (
          <RoleGuard allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
            <OrderValidationPage />
          </RoleGuard>
        ),
      },

      /* ================= PRODUCTS (ADMIN + SUPER_ADMIN) ================= */
      {
        path: "produtos",
        element: (
          <RoleGuard allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
            <ProductList />
          </RoleGuard>
        ),
      },
      {
        path: "produtos/todos",
        element: (
          <RoleGuard allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
            <ProductListAll />
          </RoleGuard>
        ),
      },
      {
        path: "produtos/novo",
        element: (
          <RoleGuard allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
            <ProductNew />
          </RoleGuard>
        ),
      },
      {
        path: "produtos/editar/:id",
        element: (
          <RoleGuard allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
            <ProductEdit />
          </RoleGuard>
        ),
      },

      /* ================= BANNERS (SUPER_ADMIN) ================= */
      {
        path: "banners",
        element: (
          <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
            <BannerList />
          </RoleGuard>
        ),
      },
      {
        path: "banners/new",
        element: (
          <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
            <BannerNew />
          </RoleGuard>
        ),
      },
      {
        path: "banners/edit/:id",
        element: (
          <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
            <BannerEdit />
          </RoleGuard>
        ),
      },

      /* ================= REELS (SUPER_ADMIN) ================= */
      {
        path: "reels",
        element: (
          <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
            <ReelList />
          </RoleGuard>
        ),
      },
      {
        path: "reels/new",
        element: (
          <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
            <ReelNew />
          </RoleGuard>
        ),
      },
      {
        path: "reels/edit/:id",
        element: (
          <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
            <ReelEdit />
          </RoleGuard>
        ),
      },

      /* ================= CATEGORIES (ADMIN + SUPER_ADMIN) ================= */
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

      /* ================= CATEGORIES (ADMIN + SUPER_ADMIN) ================= */
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

      /* ================= BUSINESSCATEGORY (SUPER_ADMIN) ================= */
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

      /* ================= VINCULAR BUSINESS-CATEGORY A CITY (SUPER_ADMIN) ================= */
      {
        path: "business-categories-cities",
        element: (
          <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
            <BusinessCategoryCityLink />
          </RoleGuard>
        ),
      },

      /* ================= VINCULAR BUSINESS-CATEGORY A CATEGORY (SUPER_ADMIN) ================= */
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

      /* ================= CATEGORIES (ADMIN + SUPER_ADMIN) ================= */
      {
        path: "categorias/todos",
        element: (
          <RoleGuard allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
            <CategoryList />
          </RoleGuard>
        ),
      },
      {
        path: "categorias/novo",
        element: (
          <RoleGuard allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
            <CategoryNew />
          </RoleGuard>
        ),
      },
      {
        path: "categorias/editar/:id",
        element: (
          <RoleGuard allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
            <CategoryEdit />
          </RoleGuard>
        ),
      },

      /* ================= SUBCATEGORIES (ADMIN + SUPER_ADMIN) ================= */
      {
        path: "subcategorias/todos",
        element: (
          <RoleGuard allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
            <SubcategoryList />
          </RoleGuard>
        ),
      },
      {
        path: "subcategorias/novo",
        element: (
          <RoleGuard allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
            <SubcategoryNew />
          </RoleGuard>
        ),
      },
      {
        path: "subcategorias/editar/:id",
        element: (
          <RoleGuard allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
            <SubcategoryEdit />
          </RoleGuard>
        ),
      },
    ],
  },

  /* ================= AUTH ================= */
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
