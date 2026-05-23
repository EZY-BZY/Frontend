import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  ListSubscriptionsParams,
  PaginatedResponse,
  SubscriptionDetailRead,
  SubscriptionRead,
} from "@/types/api";

export function listSubscriptions(
  params?: ListSubscriptionsParams
): Promise<ApiResponse<PaginatedResponse<SubscriptionRead>>> {
  return apiClient.get("/api/v1/beasy/subscriptions", {
    params: params as Record<string, string | number | boolean | null | undefined>,
  });
}

export function getSubscription(
  subscriptionId: string
): Promise<ApiResponse<SubscriptionDetailRead>> {
  return apiClient.get(`/api/v1/beasy/subscriptions/${subscriptionId}`);
}
