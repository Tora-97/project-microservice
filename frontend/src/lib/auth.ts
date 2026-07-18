export function saveAuth(token: string, role: string, email: string, userId?: string, fullName?: string, phone?: string, address?: string) {
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
  localStorage.setItem("email", email);
  if (userId) localStorage.setItem("userId", userId);
  if (fullName) localStorage.setItem("fullName", fullName);
  if (phone) localStorage.setItem("phone", phone);
  if (address) localStorage.setItem("address", address);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth_changed"));
  }
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("email");
  localStorage.removeItem("userId");
  localStorage.removeItem("fullName");
  localStorage.removeItem("phone");
  localStorage.removeItem("address");
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth_changed"));
  }
}

export function getRole(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("role");
}

export function getEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("email");
}

export function getUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("userId");
}

export function getFullName(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("fullName");
}

export function getPhone(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("phone");
}

export function getAddress(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("address");
}

export function updateLocalProfile(fullName: string, phone: string, address: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("fullName", fullName);
  localStorage.setItem("phone", phone);
  localStorage.setItem("address", address);
  window.dispatchEvent(new Event("auth_changed"));
}

export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("token");
}
