import api from "./axios";

export const createInventory = async (
  inventoryData,
) => {
  const response = await api.post(
    "/inventory",
    inventoryData,
  );

  return response.data;
};

export const getInventory = async () => {
  const response = await api.get(
    "/inventory",
  );

  return response.data;
};

export const getInventoryById = async (
  inventoryId,
) => {
  const response = await api.get(
    `/inventory/${inventoryId}`,
  );

  return response.data;
};

export const updateInventory = async (
  inventoryId,
  inventoryData,
) => {
  const response = await api.patch(
    `/inventory/${inventoryId}`,
    inventoryData,
  );

  return response.data;
};

export const deleteInventory = async (
  inventoryId,
) => {
  const response = await api.delete(
    `/inventory/${inventoryId}`,
  );

  return response.data;
};