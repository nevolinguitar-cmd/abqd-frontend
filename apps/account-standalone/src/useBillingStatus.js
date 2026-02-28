import { useEffect, useState } from "react";
const API = "https://api.abqd.ru";

export default function useBillingStatus(){
  const [loading, setLoading] = useState(true);
  const [billing, setBilling] = useState(null);

  async function reload(){
    const token = localStorage.getItem("abqd_token") || "";
    if (!token){ window.location.href="/auth/?next=%2Faccount%2F"; return; }
    const headers = { authorization: "Bearer " + token };
    const r = await fetch(API + "/api/v1/billing/status", { headers });
    if (r.status === 401){ window.location.href="/auth/?next=%2Faccount%2F"; return; }
    const j = await r.json().catch(()=>null);
    setBilling(j);
    setLoading(false);
  }

  async function linkCard(){
    const token = localStorage.getItem("abqd_token") || "";
    if (!token){ window.location.href="/auth/?next=%2Faccount%2F"; return; }
    const headers = { authorization: "Bearer " + token };
    const r = await fetch(API + "/api/v1/billing/payment-method/link", { method:"POST", headers });
    if (r.status === 401){ window.location.href="/auth/?next=%2Faccount%2F"; return; }
    const j = await r.json().catch(()=>null);
    if (j?.confirmation_url) window.location.href = j.confirmation_url;
    throw new Error("No confirmation_url");
  }

  async function enableAutorenew(){
    const token = localStorage.getItem("abqd_token") || "";
    const headers = { authorization: "Bearer " + token };
    const r = await fetch(API + "/api/v1/billing/autorenew/enable", { method:"POST", headers });
    if (r.status === 401){ window.location.href="/auth/?next=%2Faccount%2F"; return; }
    if (!r.ok) throw new Error(await r.text());
    await reload();
  }

  async function disableAutorenew(){
    const token = localStorage.getItem("abqd_token") || "";
    const headers = { authorization: "Bearer " + token };
    const r = await fetch(API + "/api/v1/billing/autorenew/disable", { method:"POST", headers });
    if (r.status === 401){ window.location.href="/auth/?next=%2Faccount%2F"; return; }
    if (!r.ok) throw new Error(await r.text());
    await reload();
  }

  useEffect(()=>{ reload().catch(()=>setLoading(false)); }, []);
  return { loading, billing, reload, linkCard, enableAutorenew, disableAutorenew };
}
