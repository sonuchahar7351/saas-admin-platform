import { toast as sonnerToast } from "sonner";
import { getErrorMessage } from "./get-error-message";

export const showSuccess = (message: string) => sonnerToast.success(message);
export const showError = (error: unknown, fallback?: string) =>
  sonnerToast.error(getErrorMessage(error, fallback));
export const showWarning = (message: string) => sonnerToast.warning(message);
export const showInfo = (message: string) => sonnerToast.info(message);

// returns the toast id — pass it to updateToLoading's success/error calls to replace
// the loading toast in place, rather than stacking a second toast on top of it
export const showLoading = (message: string) => sonnerToast.loading(message);

export const resolveLoadingToast = (
  id: string | number,
  outcome: "success" | "error",
  message: string,
) => {
  if (outcome === "success") sonnerToast.success(message, { id });
  else sonnerToast.error(message, { id });
};
