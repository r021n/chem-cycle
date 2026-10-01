import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

export interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Saat true, tombol menampilkan spinner dan menolak klik ganda. */
  loading?: boolean;
  /** Label yang ditampilkan di samping spinner saat loading. */
  loadingLabel?: string;
  /** Kelas tambahan untuk ikon spinner (mis. ukuran lebih kecil). */
  spinnerClassName?: string;
}

export const LoadingButton = React.forwardRef<
  HTMLButtonElement,
  LoadingButtonProps
>(
  (
    {
      loading = false,
      loadingLabel = "Memproses...",
      spinnerClassName,
      children,
      disabled,
      className,
      type = "button",
      ...rest
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      data-loading={loading || undefined}
      className={cn("disabled:cursor-not-allowed", className)}
      {...rest}
    >
      {loading ? (
        <>
          <Loader2
            className={cn("shrink-0 animate-spin", spinnerClassName)}
            aria-hidden="true"
          />
          {loadingLabel ? (
            <span role="status" aria-live="polite">
              {loadingLabel}
            </span>
          ) : null}
        </>
      ) : (
        children
      )}
    </button>
  ),
);

LoadingButton.displayName = "LoadingButton";
