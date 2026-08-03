import api from "./axios";

export const askBusinessAi = async (
  question,
) => {
  const response = await api.post(
    "/ai/ask",
    {
      question,
    },
  );

  return response.data;
};