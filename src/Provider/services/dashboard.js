import providerAxios from "../utils/providerAxios";

export const getProviderDashboardSummary = async () => {
  const response = await providerAxios.get("/dashboard/summary");
  return response.data;
};