import api from "./axios";

export const getEmployees = async () => {
  const response = await api.get(
    "/employees",
  );

  return response.data;
};

export const getEmployeeById = async (
  employeeId,
) => {
  const response = await api.get(
    `/employees/${employeeId}`,
  );

  return response.data;
};

export const createEmployee = async (
  employeeData,
) => {
  try {
    const response = await api.post(
      "/employees",
      employeeData,
    );

    return response.data;
  } catch (error) {
    console.error(
      "CREATE EMPLOYEE PAYLOAD:",
      employeeData,
    );

    console.error(
      "CREATE EMPLOYEE ERROR:",
      error.response?.data,
    );

    throw error;
  }
};

export const updateEmployee = async (
  employeeId,
  employeeData,
) => {
  const response = await api.patch(
    `/employees/${employeeId}`,
    employeeData,
  );

  return response.data;
};

export const updateEmployeeStatus = async (
  employeeId,
  isActive,
) => {
  const response = await api.patch(
    `/employees/${employeeId}/status`,
    {
      isActive,
    },
  );

  return response.data;
};

export const deleteEmployee = async (
  employeeId,
) => {
  const response = await api.delete(
    `/employees/${employeeId}`,
  );

  return response.data;
};