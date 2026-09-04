const BASE = "/api";

async function request(path, { method = "GET", token, body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { /* no body */ }
  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  signup: (name, email, password) =>
    request("/auth/signup", { method: "POST", body: { name, email, password } }),
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: { email, password } }),

  getDoctors: () => request("/doctors"),
  getMedicines: (q = "") => request(`/medicines${q ? `?q=${encodeURIComponent(q)}` : ""}`),

  createAppointment: (token, doctorId, slot, reason) =>
    request("/appointments", { method: "POST", token, body: { doctorId, slot, reason } }),

  placeOrder: (token, { items, address, city, zip, rxConfirmed }) =>
    request("/orders", { method: "POST", token, body: { items, address, city, zip, rxConfirmed } }),

  matchTrials: (age, condition) =>
    request(`/trials/match?age=${encodeURIComponent(age)}&condition=${encodeURIComponent(condition)}`),
  expressInterest: (token, trialId) =>
    request(`/trials/${trialId}/interest`, { method: "POST", token }),
  myInterests: (token) => request("/trials/interests/me", { token }),
};
