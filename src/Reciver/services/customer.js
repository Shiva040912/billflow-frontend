import api from "./axios";

export const getCustomers = async (
  params = {},
) => {
  const response = await api.get(
    "/customers",
    {
      params,
    },
  );

  return response.data;
};

export const getCustomerById = async (
  id,
) => {
  const response = await api.get(
    `/customers/${id}`,
  );

  return response.data;
};

export const createCustomer = async (
  data,
) => {
  const response = await api.post(
    "/customers",
    data,
  );

  return response.data;
};

export const updateCustomer = async (
  id,
  data,
) => {
  const response = await api.patch(
    `/customers/${id}`,
    data,
  );

  return response.data;
};

export const deleteCustomer = async (
  id,
) => {
  const response = await api.delete(
    `/customers/${id}`,
  );

  return response.data;
};

export const getCustomerInvoices =
  async (customerId) => {
    const response = await api.get(
      `/invoices/customer/${customerId}`,
    );

    return response.data;
  };

export const downloadInvoicePdf =
  async (invoiceId) => {
    const response = await api.get(
      `/invoices/${invoiceId}/pdf`,
      {
        responseType: "blob",
      },
    );

    return response.data;
  };