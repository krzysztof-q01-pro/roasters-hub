"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { deleteAccount } from "@/actions/account.actions";

export function DeleteAccountSection() {
  const t = useTranslations("account");
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);
    const result = await deleteAccount();
    if (result.success) {
      router.push("/");
      router.refresh();
    } else {
      setError(result.error ?? "Unknown error");
      setLoading(false);
    }
  }

  return (
    <div className="mt-12 pt-8 border-t border-error/20">
      <h3 className="text-lg font-semibold text-error mb-2">{t("dangerZone")}</h3>
      <p className="text-sm text-on-surface-variant/70 mb-4">
        {t("deleteAccountDesc")}
      </p>

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="text-error border border-error/30 px-4 py-2 rounded-lg text-sm font-medium hover:bg-error/5 transition-colors"
        >
          {t("deleteAccount")}
        </button>
      ) : (
        <div className="bg-error/5 border border-error/20 rounded-xl p-5 space-y-4">
          <p className="text-sm text-error font-medium">{t("deleteAccountConfirm")}</p>
          <p className="text-sm text-on-surface-variant/70">
            {t("deleteAccountWarning")}
          </p>
          {error && (
            <p className="text-sm text-error">{error}</p>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirm(false)}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              {t("cancel")}
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="bg-error text-on-error px-4 py-2 rounded-lg text-sm font-medium hover:bg-error/90 transition-colors disabled:opacity-50"
            >
              {loading ? t("deleting") : t("confirmDelete")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
