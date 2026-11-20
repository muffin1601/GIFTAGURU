import "server-only";

export type CrmLead = {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  location?: string;
  productCode?: string;
  requirements?: string;
};

const clip = (value: string | undefined, max: number) => value?.trim().slice(0, max) || undefined;

/**
 * Forwards a lead to the Watcon CRM's GiftaGuru endpoint (/api/giftaguru/capture-lead).
 * Best-effort: the lead is already stored locally, so a CRM outage must never fail the visitor's submission.
 * Returns true when the CRM accepted it (or already had it).
 */
export async function pushLeadToCrm(lead: CrmLead): Promise<boolean> {
  const url = process.env.CRM_API_URL;
  const key = process.env.CRM_API_KEY;
  if (!url || !key) {
    console.warn("crm: CRM_API_URL/CRM_API_KEY not configured; lead not forwarded");
    return false;
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": key },
      body: JSON.stringify({
        name: clip(lead.name, 200),
        company: clip(lead.company, 200),
        email: clip(lead.email, 254),
        phone: clip(lead.phone, 30),
        location: clip(lead.location, 200),
        productCode: clip(lead.productCode, 100),
        requirements: clip(lead.requirements, 5000),
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error("crm: capture-lead rejected lead", { status: res.status });
    return res.ok;
  } catch (error) {
    console.error("crm: capture-lead request failed", { error: error instanceof Error ? error.name : "unknown" });
    return false;
  }
}
