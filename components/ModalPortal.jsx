"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

/**
 * بوابة المودال (Modal Portal)
 * =============================
 * ليه ده مهم؟
 * المودال كان بيتعمل render جوه <section class="relative">، وأي عنصر أب
 * عنده transform أو backdrop-filter أو overflow بيخلّي العناصر اللي جواه
 * بـ position: fixed تتموضع نسبةً له هو — مش للشاشة. النتيجة كانت إن
 * المودال يطلع "فوق ومقصوص" على الموبايل و"مخفي" على الديسكتوب.
 *
 * الحل: ننقل المودال بـ Portal لـ document.body مباشرة، فيبقى خارج أي
 * أب بيكسر الـ fixed، ويتثبت تماماً على حدود الشاشة.
 */
export default function ModalPortal({ children }) {
  useEffect(() => {
    // قفل سكرول الصفحة كلها (html + body) — مش الـ body بس.
    const html = document.documentElement;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;

    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      html.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, []);

  if (typeof document === "undefined") return null;

  return createPortal(children, document.body);
}
