import api from "./axios";

export const createSupplier = async (
  supplierData,
) => {
  const response = await api.post(
    "/suppliers",
    supplierData,
  );

  return response.data;
};

export const getSuppliers = async () => {
  const response = await api.get(
    "/suppliers",
  );

  return response.data;
};

export const getSupplierById = async (
  supplierId,
) => {
  const response = await api.get(
    `/suppliers/${supplierId}`,
  );

  return response.data;
};

export const updateSupplier = async (
  supplierId,
  supplierData,
) => {
  const response = await api.patch(
    `/suppliers/${supplierId}`,
    supplierData,
  );

  return response.data;
};

export const deleteSupplier = async (
  supplierId,
) => {
  const response = await api.delete(
    `/suppliers/${supplierId}`,
  );

  return response.data;
};