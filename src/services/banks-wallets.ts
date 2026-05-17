import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  BankAndWalletCreate,
  BankAndWalletRead,
  BankAndWalletUpdate,
  ListBanksWalletsParams,
  MessageResponse,
} from "@/types/api";

export function listBanksAndWallets(
  params?: ListBanksWalletsParams
): Promise<ApiResponse<BankAndWalletRead[]>> {
  return apiClient.get("/api/v1/beasy/banks-and-wallets", {
    params: params as Record<string, string | number | boolean | null | undefined>,
  });
}

export function createBankOrWallet(
  payload: BankAndWalletCreate
): Promise<ApiResponse<BankAndWalletRead>> {
  return apiClient.post("/api/v1/beasy/banks-and-wallets", { body: payload });
}

export function updateBankOrWallet(
  rowId: string,
  payload: BankAndWalletUpdate
): Promise<ApiResponse<BankAndWalletRead>> {
  return apiClient.patch(`/api/v1/beasy/banks-and-wallets/${rowId}`, {
    body: payload,
  });
}

export function deleteBankOrWallet(
  rowId: string
): Promise<ApiResponse<MessageResponse>> {
  return apiClient.delete(`/api/v1/beasy/banks-and-wallets/${rowId}`);
}
