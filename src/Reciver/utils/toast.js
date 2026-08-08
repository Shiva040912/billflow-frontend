import toast from "react-hot-toast";

export const showSuccessToast = (
  message,
) => {
  toast.success(
    message ||
      "Operation completed successfully",
  );
};

export const showErrorToast = (
  error,
  fallbackMessage =
    "Something went wrong",
) => {
  const backendMessage =
    error?.response?.data
      ?.message;

  let message =
    fallbackMessage;

  if (
    Array.isArray(
      backendMessage,
    )
  ) {
    message =
      backendMessage.join(
        ", ",
      );
  } else if (
    typeof backendMessage ===
      "string" &&
    backendMessage.trim()
  ) {
    message =
      backendMessage;
  } else if (
    typeof error?.message ===
      "string" &&
    error.message.trim()
  ) {
    message =
      error.message;
  }

  toast.error(message);
};

export const showInfoToast = (
  message,
) => {
  toast(message);
};

export const showLoadingToast = (
  message =
    "Please wait...",
) => {
  return toast.loading(
    message,
  );
};

export const dismissToast = (
  toastId,
) => {
  toast.dismiss(
    toastId,
  );
};