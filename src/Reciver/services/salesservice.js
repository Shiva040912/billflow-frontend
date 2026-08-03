import api from "./axios";

export const createSale = async (
  saleData,
) => {
  const response = await api.post(
    "/sales",
    saleData,
  );

  return response.data;
};

export const getSales = async () => {
  const response = await api.get(
    "/sales",
  );

  return response.data;
};

export const getSaleById = async (
  saleId,
) => {
  const response = await api.get(
    `/sales/${saleId}`,
  );

  return response.data;
};

export const updateSale = async (
  saleId,
  saleData,
) => {
  const response = await api.patch(
    `/sales/${saleId}`,
    saleData,
  );

  return response.data;
};

export const cancelSale = async (
  saleId,
) => {
  const response = await api.patch(
    `/sales/${saleId}/cancel`,
    {},
  );

  return response.data;
};

export const deleteSale = async (
  saleId,
) => {
  const response = await api.delete(
    `/sales/${saleId}`,
  );

  return response.data;
};