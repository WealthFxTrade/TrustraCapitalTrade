import { API_URL, API_ENDPOINTS } from "../constants/api";

export async function signup(name, email, password) {
  const res = await fetch(`\( {API_URL} \){API_ENDPOINTS.REGISTER}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Signup failed");
  }

  return await res.json();
}

export async function login(email, password) {
  const res = await fetch(`\( {API_URL} \){API_ENDPOINTS.LOGIN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Login failed");
  }

  return await res.json();
}
