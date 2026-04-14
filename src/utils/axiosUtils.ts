import axios from "axios";

const defaultAxios = axios.create({
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    Expires: "0",
    websiteCode: "user",
  },
});
export const callAPI = async (
  method: string = "post",
  url: string,
  data: any,
  authToken?: string,
  isBearer?: boolean,
) => {
  try {
    const headers: any = {
      "Content-Type": "application/json",
    };
    if (authToken) {
      headers.authorization = `Bearer ${authToken}`;
    }
    const request = {
      method,
      url: url,
      data,
      headers,
    };
    const response = await defaultAxios(request);
    const logUrl = new URL(url);
    console.log(
      `API Call Success:::::::::::::> ${response.status}: ${logUrl.pathname}`,
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const errorData = error.response?.data;

      throw (
        JSON.stringify({
          url,
          message: error.message || "An error occurred during the API call.",
          statusCode,
          errorData,
          isError: true,
        }) + "\n"
      );
    }
    throw JSON.stringify({
      url,
      message: "An unexpected error occurred.",
      error,
      isError: true,
    });
  }
};
