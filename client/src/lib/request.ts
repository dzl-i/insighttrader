const request = async (
  path: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  options?: Record<string, any>,
  headers?: Record<string, any>,
) => {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ??
    "https://kffxjq6hph.execute-api.ap-southeast-2.amazonaws.com/F11A_CRUNCH_API";
  const url = `${baseUrl}${path}`;

  const payload =
    method === "GET"
      ? {
          method,
          headers,
        }
      : {
          method,
          headers: {
            "Content-type": "application/json",
            ...headers,
          },
          body: JSON.stringify(options),
        };
    const res = await fetch(url, { ...payload });
    if (!res.ok) {
      return { errorCode: res.status, errorMessage: res.statusText };
    }
    return await res.json();
};

export const get = (
  path: string,
  options?: Record<string, any>,
  headers?: Record<string, any>,
) => request(path, "GET", options, headers);

export const post = (
  path: string,
  options?: Record<string, any>,
  headers?: Record<string, any>,
) => request(path, "POST", options, headers);

export const put = (
  path: string,
  options?: Record<string, any>,
  headers?: Record<string, any>,
) => request(path, "PUT", options, headers);

export const del = (
  path: string,
  options?: Record<string, any>,
  headers?: Record<string, any>,
) => request(path, "DELETE", options, headers);
