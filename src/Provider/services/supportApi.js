import providerAxios from "../utils/provideraxios";

export const getSupports = async () => {
  const response =
    await providerAxios.get(
      "/support",
    );

  return response.data;
};

export const getSupportById = async (
  supportId,
) => {
  const response =
    await providerAxios.get(
      `/support/${supportId}`,
    );

  return response.data;
};

export const updateSupport = async (
  supportId,
  supportData,
) => {
  const response =
    await providerAxios.patch(
      `/support/${supportId}`,
      supportData,
    );

  return response.data;
};

export const deleteSupport = async (
  supportId,
) => {
  const response =
    await providerAxios.delete(
      `/support/${supportId}`,
    );

  return response.data;
};