import http from "@/api/http";

export const analyzeText = async (userInput: string, systemPrompt: string, model: string) => {
  const response = await http.post("/analyze", { userInput, systemPrompt, model });
  return response.data;
};
