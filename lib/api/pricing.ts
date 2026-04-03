import axios from "axios";
import api from "@/lib/axios";
import {
  CreditOptionsResponse,
  SubscribeAPIResponse,
  SubscriptionStatusResponse,
  CancelSubResponse,
} from "@/lib/types/workspace";

const CREDIT_API_URL =
  process.env.NEXT_PUBLIC_CREDIT_API_URL || "http://localhost:8000/v1";

const creditApi = axios.create({
  baseURL: CREDIT_API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export const pricingAPI = {
  async getCreditOptions() {
    const response = await creditApi.get<CreditOptionsResponse>(
      "/credit/options"
    );
    return response.data;
  },

  async subscribe(creditOptionId: number) {
    const response = await api.post<SubscribeAPIResponse>(
      "/credit/subscription",
      { credit_option_id: creditOptionId }
    );
    return response.data;
  },

  async verifySub(sessionId: string) {
    const response = await api.post("/credit/verify_sub", {
      session_id: sessionId,
    });
    return response.data;
  },

  async cancelSub(subscriptionId: number) {
    const response = await api.post<CancelSubResponse>("/credit/cancel_sub", {
      subscription_id: subscriptionId,
    });
    return response.data;
  },

  async getSubscriptionStatus() {
    const response = await api.get<SubscriptionStatusResponse>(
      "/credit/subscription-status"
    );
    return response.data;
  },
};
