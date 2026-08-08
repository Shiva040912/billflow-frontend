import providerAxios from "../utils/provideraxios";

export const providerLogin = async (credentials) => {
  const response = await providerAxios.post(
    "/provider/auth/login",
    credentials,
  );

  return response.data;
};

export const getProviderProfile = async () => {
  const response = await providerAxios.get(
    "/provider/auth/profile",
  );

  return response.data;
};