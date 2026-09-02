"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toggleWishlistAction } from "@/lib/actions/wishlist";

/**
 * Save/unsave control for a product.
 *
 * Optimistic: the heart fills immediately and reverts if the server refuses.
 * Duplicate protection lives in the database (`@@unique([wishlistId,
 * productId])`), so a burst of clicks can never create duplicate rows -- the
 * worst case is a redundant toggle.
 */
export default function WishlistButton({
  productId,
  initiallySaved = false,
  className,
}: {
  productId: string;
  initiallySaved?: boolean;
  className?: string;
}) {
  const [saved, setSaved] = useState(initiallySaved);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className={className}>
      <button
        type="button"
        // aria-pressed communicates the toggle state to screen readers, which
        // a colour-filled icon alone does not.
        aria-pressed={saved}
        aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
        disabled={pending}
        onClick={() => {
          const previous = saved;
          setSaved(!previous);
          setError(null);

          startTransition(async () => {
            const result = await toggleWishlistAction({ productId });

            if (result.requiresAuth) {
              // Send them to sign in and back to this exact page, so saving
              // doesn't cost them their place.
              router.push(`/login?next=${encodeURIComponent(pathname)}`);
              setSaved(previous);
              return;
            }

            if (result.error) {
              setSaved(previous);
              setError(result.error);
              return;
            }

            setSaved(result.saved ?? !previous);
          });
        }}
        className="inline-flex items-center gap-2 text-sm font-semibold text-navy-950 transition-colors duration-200 hover:text-gold-600 disabled:opacity-50"
      >
        <Heart
          className={`h-5 w-5 ${saved ? "fill-gold-500 text-gold-600" : ""}`}
          aria-hidden="true"
          strokeWidth={1.5}
        />
        {saved ? "Saved" : "Save for later"}
      </button>

      <div aria-live="polite">
        {error ? (
          <p role="alert" className="field-error mt-2">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
