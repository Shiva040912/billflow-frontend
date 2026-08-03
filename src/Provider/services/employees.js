import providerAxios from "../utils/providerAxios";

export const getProviderEmployees = async () => {
  const response = await providerAxios.get("/users");
  return response.data;
};

export const createProviderEmployee = async (employeeData) => {
  const response = await providerAxios.post("/users", employeeData);
  return response.data;
};

export const updateProviderEmployee = async (employeeId, employeeData) => {
  const response = await providerAxios.patch(
    `/users/${employeeId}`,
    employeeData
  );

  return response.data;
};

export const toggleProviderEmployeeStatus = async (employeeId) => {
  const response = await providerAxios.patch(
    `/users/${employeeId}/toggle-status`
  );

  return response.data;
};

export const deleteProviderEmployee = async (employeeId) => {
  const response = await providerAxios.delete(`/users/${employeeId}`);
  return response.data;
};