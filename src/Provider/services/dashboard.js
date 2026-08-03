import providerAxios from "../utils/provideraxios";

export const getProviderDashboardSummary = async () => {
  const response = await providerAxios.get("/dashboard/summary");
  return response.data;
};