import { ApiResponse } from "@/types";

export async function fetchAPI<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json", ...options?.headers },
      ...options,
    });
    const resData = await res.json();
    if (!res.ok) {
      return { error: resData.error || "请求失败" };
    }
    return { data: resData.data };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "网络错误" };
  }
}
