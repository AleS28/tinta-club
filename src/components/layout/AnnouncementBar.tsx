import { BRAND_NAME } from "@/lib/brand";

export function AnnouncementBar() {
  return (
    <div className="bg-ink py-2 text-center text-xs text-white sm:text-sm">
      <span className="font-serif font-semibold text-terracotta">{BRAND_NAME}</span>
      {" · "}
      Lee historias únicas y apoya a autores independientes por solo{" "}
      <span className="font-semibold text-terracotta">$4.99/mes</span>
    </div>
  );
}
