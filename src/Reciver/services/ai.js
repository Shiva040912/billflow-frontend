import api from "./axios";

export const askBusinessAi = async (
  question,
  history = [],
) => {
  const response = await api.post(
    "/ai/ask",
    {
      question,
      history,
    },
  );

  return response.data;
};