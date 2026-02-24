import { useEffect, useState } from "react";

const API = "https://api.abqd.ru";

function parseDate(v) {
  if (!v) return null;
  if (typeof v === "string") {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof v === "number") {
    const ms = v > 1e12 ? v : v * 1000;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function isBadAuthPayload(obj) {
  const d = (obj && obj.detail) ? String(obj.detail).toLowerCase() : "";
  return d.includes("unauthorized") || d.includes("bad token") || d.includes("token");
}

export default function useAccountData() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    email: "—",
    status: "—",
    plan: "—",
    paidUntil: null,
    trialUntil: null,
    startDate: new Date(),
  });

  useEffect(() => {
    const token = localStorage.getItem("abqd_token") || "";
    if (!token) {
      window.location.href = "/auth/?next=%2Faccount%2F";
      return;
    }

    const headers = { authorization: "Bearer " + token };

    Promise.all([
      fetch(API + "/api/v1/auth/me", { headers }),
      fetch(API + "/api/v1/access/status", { headers }),
    ])
      .then(async ([rMe, rSt]) => {
        if (rMe.status === 401 || rSt.status === 401) {
          window.location.href = "/auth/?next=%2Faccount%2F";
          return;
        }

        const me = await rMe.json().catch(() => ({}));
        const st = await rSt.json().catch(() => ({}));

        // иногда API отдаёт 200, но в JSON detail="Bad token"
        if (isBadAuthPayload(me) || isBadAuthPayload(st)) {
          window.location.href = "/auth/?next=%2Faccount%2F";
          return;
        }

        const email =
          me?.email ||
          me?.user?.email ||
          me?.login ||
          me?.username ||
          "—";

        const active =
          st?.active ??
          st?.is_active ??
          st?.has_access ??
          st?.paid_active ??
          false;

        const plan =
          st?.paid_plan ||
          st?.plan ||
          st?.tier ||
          "—";

        const paidUntil =
          parseDate(st?.paid_until) ||
          parseDate(st?.paidUntil) ||
          parseDate(st?.paid_until_at) ||
          null;

        const trialUntil =
          parseDate(st?.trial_until) ||
          parseDate(st?.trialUntil) ||
          null;

        let startDate =
          parseDate(st?.paid_from) ||
          parseDate(st?.start_date) ||
          parseDate(st?.startDate) ||
          null;

        // если start нет — берём “разумное” окно 30 дней до paidUntil
        if (!startDate && paidUntil) {
          startDate = new Date(paidUntil.getTime() - 30 * 24 * 3600 * 1000);
        }
        if (!startDate) startDate = new Date();

        setUserData({
          email,
          status: active ? "Активно" : "Неактивно",
          plan,
          paidUntil,
          trialUntil,
          startDate,
        });

        setLoading(false);
      })
      .catch(() => {
        // сеть/ошибка — не ломаем UI
        setLoading(false);
      });
  }, []);

  return { loading, userData };
}
