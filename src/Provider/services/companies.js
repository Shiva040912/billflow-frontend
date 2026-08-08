import providerAxios from "../utils/providerAxios";

export const getProviderCompanies = async (params = {}) => {
  const response = await providerAxios.get("/companies", {
    params,
  });

  return response.data;
};

export const getProviderCompanyById = async (companyId) => {
  const response = await providerAxios.get(
    `/companies/${companyId}`,
  );

  return response.data;
};

export const updateProviderCompanyStatus = async (
  companyId,
  status,
) => {
  const response = await providerAxios.patch(
    `/companies/${companyId}/status`,
    {
      status,
    },
  );

  return response.data;
};

export const extendProviderCompanySubscription = async (
  companyId,
  subscriptionEndDate,
) => {
  const response = await providerAxios.patch(
    `/companies/${companyId}/subscription`,
    {
      subscriptionEndDate,
    },
  );

  return response.data;
};

export const deleteProviderCompany = async (companyId) => {
  const response = await providerAxios.delete(
    `/companies/${companyId}`,
  );

  return response.data;
};