import { useNavigate } from "react-router-dom";

import { AdminLayout } from "@/layouts/AdminLayout";
import { BlogEditor, emptyFormValues } from "@/components/admin/BlogEditor";
import { blogStore } from "@/services/blogStore";



function NewBlogPage() {
  const navigate = useNavigate();
  return (
    <AdminLayout title="New blog">
      <BlogEditor
        initial={emptyFormValues()}
        submitLabel="Publish"
        onCancel={() => navigate("/admin/blogs")}
        onSubmit={async (values) => {
          await blogStore.create({
            ...values,
            publishedAt: values.status === "published" ? new Date().toISOString() : null,
          });
          navigate("/admin/blogs");
        }}
      />
    </AdminLayout>
  );
}

export default NewBlogPage;
