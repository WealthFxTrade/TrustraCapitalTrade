// src/services/auth.js
import { API_URL } from "../constants/api";

/**
 * Signup new user
 * @param {string} name
 * @param {string} email
 * @param {string} password
 */
export async function signup(name, email, password) {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Signup failed");
  }

  return await res.json(); // returns user data + token
}

/**
 * Login existing user
 * @param {string} email
 * @param {string} password
 */
export async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Login failed");
  }

  return await res.json(); // returns user data + token
}
