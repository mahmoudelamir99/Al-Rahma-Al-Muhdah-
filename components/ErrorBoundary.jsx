"use client";

import { Component } from "react";

/**
 * حماية من الأخطاء (Error Boundary)
 * ---------------------------------------------------------------------------
 * أي خطأ غير متوقع في كومبوننت ابن (زي بيانات غير متوقعة من قاعدة البيانات)
 * بيتقفل هنا ويعرض رسالة معقولة، بدل ما **الصفحة كلها** تقع وتطلع للمستخدم
 * "Application error: a client-side exception".
 *
 * ده مهم بشكل خاص في الموقع العام: الزائر ميعرفش يعمل refresh ولا يفهم
 * إيه اللي حصل، فالأفضل إنه يشوف رسالة واضحة ويقدر يكمّل.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    // بنسجل الخطأ في الكونسول عشان يفضل قابل للتشخيص
    console.error("[ErrorBoundary]", error?.message || error);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="rounded-2xl border-red-200 bg-red-50 p-4 text-center">
          <p className="text-sm font-bold text-red-800">
            حصلت مشكلة غير متوقعة وإحنا بنعرض البيانات دي.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white"
          >
            جرّب تاني
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
