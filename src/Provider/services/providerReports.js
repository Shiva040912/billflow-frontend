import providerAxios from "../utils/provideraxios";

export const getProviderReportsSummary = async () => {
  const response = await providerAxios.get(
    "/reports/summary",
  );

  return response.data;
};