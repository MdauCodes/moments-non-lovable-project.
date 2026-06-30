import { useNavigate } from "react-router-dom";

import { AdminLayout } from "@/layouts/AdminLayout";
import { Forbidden } from "@/components/admin/Forbidden";
import { ProductEditor, emptyProductValues } from "@/components/admin/ProductEditor";
import { createProductApi } from "@/services/adminProductApi";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { can } from "@/lib/permissions";



function NewProductPage() {
  const navigate = useNavigate();
  const { user, isCheckingSession } = useAdminAuth();

  if (isCheckingSession) return <div>Loading...</div>;

  if (!can(user?.role, "product:create")) {
    return (
      <AdminLayout title="New product">
        <Forbidden resource="product creation" />
      </AdminLayout>
    );
  }

  let initialValues;
  try {
    initialValues = emptyProductValues();
  } catch (err) {
    console.error("[products/new] emptyProductValues failed", err);
    return (
      <AdminLayout title="New product">
        <p style={{ color: "red", padding: 24 }}>
          Failed to initialise form: {(err as Error)?.message ?? "Unknown error"}
        </p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="New product">
      <ProductEditor
        initial={initialValues}
        submitLabel="Create product"
        onCancel={() => navigate("/admin/products")}
        onSubmit={async (values) => {
          try {
            await createProductApi(values);
            navigate("/admin/products");
          } catch (err) {
            console.error("[products/new] createProductApi failed", err);
            throw err;
          }
        }}
      />
    </AdminLayout>
  );
}

export default NewProductPage;
