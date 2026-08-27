type SocialPlatform = "facebook" | "instagram" | "linkedin";

const paths: Record<SocialPlatform, string> = {
  facebook:
    "M13.5 21v-7.5h2.5l.5-3h-3V8.25c0-.87.24-1.46 1.5-1.46h1.6V4.14C15.77 4.06 14.8 4 13.66 4 11.3 4 9.7 5.4 9.7 8v2.5H7.2v3h2.5V21h3.8z",
  instagram:
    "M8 4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H8zm4 2.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zm0 2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM17 6.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2z",
  linkedin:
    "M6.94 8.5H4.06V19h2.88V8.5zM5.5 4.75A1.75 1.75 0 1 0 5.5 8.25 1.75 1.75 0 0 0 5.5 4.75zM19.94 19h-2.88v-5.6c0-1.34-.48-2.25-1.68-2.25-.92 0-1.47.62-1.71 1.22-.09.21-.11.5-.11.8V19H10.6s.04-9.62 0-10.5h2.88v1.49c.38-.59 1.07-1.43 2.6-1.43 1.9 0 3.32 1.24 3.32 3.9V19z",
};

export default function SocialIcon({ platform }: { platform: SocialPlatform }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d={paths[platform]} />
    </svg>
  );
}
