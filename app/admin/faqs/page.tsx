import ActionForm, { AdminInput, AdminTextarea } from "@/components/admin/ActionForm";
import { createFaqAction, deleteFaqAction, updateFaqAction } from "@/lib/actions/content";
import { prisma } from "@/lib/prisma";

export default async function AdminFaqsPage() {
  const faqs = await prisma.faq.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Content</p>
        <h1 className="mt-2 font-display text-4xl text-navy-950">FAQs</h1>
        <p className="mt-2 text-sm text-ink-600">
          Shown on the homepage and corporate gifting page. Unpublished questions are hidden from
          the storefront but kept here for reuse later.
        </p>
      </div>

      <section className="panel p-5">
        <h2 className="font-display text-xl text-navy-950">New FAQ</h2>
        <ActionForm action={createFaqAction} submitLabel="Add FAQ" className="mt-4 grid gap-3">
          <label className="space-y-1 text-sm font-medium text-navy-950">
            Question
            <AdminInput name="question" required />
          </label>
          <label className="space-y-1 text-sm font-medium text-navy-950">
            Answer
            <AdminTextarea name="answer" required rows={3} />
          </label>
          <div className="flex items-end gap-4">
            <label className="space-y-1 text-sm font-medium text-navy-950">
              Display order
              <AdminInput name="sortOrder" type="number" min={0} defaultValue={faqs.length} />
            </label>
            <label className="flex items-center gap-2 pb-2.5 text-sm font-medium text-navy-950">
              <input type="checkbox" name="isPublished" value="true" defaultChecked className="h-4 w-4 accent-navy-950" />
              Published
            </label>
          </div>
        </ActionForm>
      </section>

      {faqs.length === 0 ? (
        <div className="panel p-8 text-center">
          <p className="text-sm text-ink-600">No FAQs yet. Add your first one above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq) => (
            <section key={faq.id} className="panel p-5">
              <div className="flex items-start justify-between gap-3">
                <span className={`badge ${faq.isPublished ? "badge-positive" : "badge-attention"}`}>
                  {faq.isPublished ? "Published" : "Hidden"}
                </span>
              </div>
              <ActionForm action={updateFaqAction} submitLabel="Save" className="mt-3 grid gap-3">
                <input type="hidden" name="id" value={faq.id} />
                <label className="space-y-1 text-sm font-medium text-navy-950">
                  Question
                  <AdminInput name="question" required defaultValue={faq.question} />
                </label>
                <label className="space-y-1 text-sm font-medium text-navy-950">
                  Answer
                  <AdminTextarea name="answer" required rows={3} defaultValue={faq.answer} />
                </label>
                <div className="flex items-end gap-4">
                  <label className="space-y-1 text-sm font-medium text-navy-950">
                    Display order
                    <AdminInput name="sortOrder" type="number" min={0} defaultValue={faq.sortOrder} />
                  </label>
                  <label className="flex items-center gap-2 pb-2.5 text-sm font-medium text-navy-950">
                    <input
                      type="checkbox"
                      name="isPublished"
                      value="true"
                      defaultChecked={faq.isPublished}
                      className="h-4 w-4 accent-navy-950"
                    />
                    Published
                  </label>
                </div>
              </ActionForm>
              <ActionForm
                action={deleteFaqAction}
                submitLabel="Delete FAQ"
                confirmMessage="Delete this FAQ? This cannot be undone."
                className="mt-3 border-t border-line pt-3"
              >
                <input type="hidden" name="id" value={faq.id} />
              </ActionForm>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
