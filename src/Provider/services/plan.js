import providerAxios from "../utils/provideraxios";

export const getProviderPlans = async (params = {}) => {
  const response = await providerAxios.get("/plans", {
    params,
  });

  return response.data;
};

export const getProviderPlanById = async (planId) => {
  const response = await providerAxios.get(
    `/plans/${planId}`,
  );

  return response.data;
};

export const createProviderPlan = async (data) => {
  const response = await providerAxios.post(
    "/plans",
    data,
  );

  return response.data;
};

export const updateProviderPlan = async (
  planId,
  data,
) => {
  const response = await providerAxios.patch(
    `/plans/${planId}`,
    data,
  );

  return response.data;
};

export const updateProviderPlanStatus = async (
  planId,
  isActive,
) => {
  const response = await providerAxios.patch(
    `/plans/${planId}/status`,
    {
      isActive,
    },
  );

  return response.data;
};

export const updateProviderPlanPopularStatus = async (
  planId,
  isPopular,
) => {
  const response = await providerAxios.patch(
    `/plans/${planId}/popular`,
    {
      isPopular,
    },
  );

  return response.data;
};

export const deleteProviderPlan = async (planId) => {
  const response = await providerAxios.delete(
    `/plans/${planId}`,
  );

  return response.data;
};