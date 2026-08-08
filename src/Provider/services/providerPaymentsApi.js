import providerAxios from "../utils/provideraxios";

export const getProviderPaymentsSummary = async () => {
  const response = await providerAxios.get(
    "/payments/summary",
  );

  return response.data;
};

export const getProviderPayments = async (params = {}) => {
  const response = await providerAxios.get(
    "/payments",
    {
      params,
    },
  );

  return response.data;
};