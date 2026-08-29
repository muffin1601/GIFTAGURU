import ActionForm, { AdminInput, AdminTextarea } from "@/components/admin/ActionForm";
import { createTestimonialAction, deleteTestimonialAction, updateTestimonialAction } from "@/lib/actions/content";
import { prisma } from "@/lib/prisma";

export default async function AdminTestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Content</p>
        <h1 className="mt-2 font-display text-4xl text-navy-950">Testimonials</h1>
        <p className="mt-2 text-sm text-ink-600">
          Only add real, attributable quotes from real customers. The homepage testimonials
          section stays hidden while this list is empty -- it never shows placeholder content.
        </p>
      </div>

      <section className="panel p-5">
        <h2 className="font-display text-xl text-navy-950">New testimonial</h2>
        <ActionForm action={createTestimonialAction} submitLabel="Add testimonial" className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-medium text-navy-950">
            Customer name
            <AdminInput name="name" required />
          </label>
          <label className="space-y-1 text-sm font-medium text-navy-950">
            Role
            <AdminInput name="role" placeholder="e.g. Head of HR" />
          </label>
          <label className="space-y-1 text-sm font-medium text-navy-950 sm:col-span-2">
            Company
            <AdminInput name="company" />
          </label>
          <label className="space-y-1 text-sm font-medium text-navy-950 sm:col-span-2">
            Quote
            <AdminTextarea name="quote" required rows={3} />
          </label>
          <label className="space-y-1 text-sm font-medium text-navy-950">
            Photo URL (optional)
            <AdminInput name="imageUrl" />
          </label>
          <label className="space-y-1 text-sm font-medium text-navy-950">
            Display order
            <AdminInput name="sortOrder" type="number" min={0} defaultValue={testimonials.length} />
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-navy-950">
            <input type="checkbox" name="isPublished" value="true" defaultChecked className="h-4 w-4 accent-navy-950" />
            Published
          </label>
        </ActionForm>
      </section>

      {testimonials.length === 0 ? (
        <div className="panel p-8 text-center">
          <p className="text-sm text-ink-600">No testimonials yet. Add a real one above when you have it.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {testimonials.map((testimonial) => (
            <section key={testimonial.id} className="panel p-5">
              <span className={`badge ${testimonial.isPublished ? "badge-positive" : "badge-attention"}`}>
                {testimonial.isPublished ? "Published" : "Hidden"}
              </span>
              <ActionForm action={updateTestimonialAction} submitLabel="Save" className="mt-3 grid gap-3">
                <input type="hidden" name="id" value={testimonial.id} />
                <label className="space-y-1 text-sm font-medium text-navy-950">
                  Customer name
                  <AdminInput name="name" required defaultValue={testimonial.name} />
                </label>
                <label className="space-y-1 text-sm font-medium text-navy-950">
                  Role
                  <AdminInput name="role" defaultValue={testimonial.role ?? ""} />
                </label>
                <label className="space-y-1 text-sm font-medium text-navy-950">
                  Company
                  <AdminInput name="company" defaultValue={testimonial.company ?? ""} />
                </label>
                <label className="space-y-1 text-sm font-medium text-navy-950">
                  Quote
                  <AdminTextarea name="quote" required rows={3} defaultValue={testimonial.quote} />
                </label>
                <label className="space-y-1 text-sm font-medium text-navy-950">
                  Photo URL
                  <AdminInput name="imageUrl" defaultValue={testimonial.imageUrl ?? ""} />
                </label>
                <div className="flex items-end gap-4">
                  <label className="space-y-1 text-sm font-medium text-navy-950">
                    Display order
                    <AdminInput name="sortOrder" type="number" min={0} defaultValue={testimonial.sortOrder} />
                  </label>
                  <label className="flex items-center gap-2 pb-2.5 text-sm font-medium text-navy-950">
                    <input
                      type="checkbox"
                      name="isPublished"
                      value="true"
                      defaultChecked={testimonial.isPublished}
                      className="h-4 w-4 accent-navy-950"
                    />
                    Published
                  </label>
                </div>
              </ActionForm>
              <ActionForm
                action={deleteTestimonialAction}
                submitLabel="Delete testimonial"
                confirmMessage="Delete this testimonial? This cannot be undone."
                className="mt-3 border-t border-line pt-3"
              >
                <input type="hidden" name="id" value={testimonial.id} />
              </ActionForm>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
