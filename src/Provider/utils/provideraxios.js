import axios from "axios";

const apiBaseUrl =
  import.meta.env.VITE_API_URL?.replace(
    /\/+$/,
    "",
  );

const providerAxios = axios.create({
  baseURL: `${apiBaseUrl}/provider`,
});

providerAxios.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(
        "billFlowProviderAccessToken",
      );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) =>
    Promise.reject(error),
);

providerAxios.interceptors.response.use(
  (response) => response,

  (error) => {
    if (
      error.response?.status === 401
    ) {
      localStorage.removeItem(
        "billFlowProviderAccessToken",
      );

      localStorage.removeItem(
        "billFlowProviderUser",
      );
    }

    return Promise.reject(error);
  },
);

export default providerAxios;