import api from "./axios";

export const createSupport = async (
  supportData,
) => {
  const response = await api.post(
    "/support",
    supportData,
  );

  return response.data;
};

export const getMySupports = async () => {
  const response = await api.get(
    "/support/my",
  );

  return response.data;
};