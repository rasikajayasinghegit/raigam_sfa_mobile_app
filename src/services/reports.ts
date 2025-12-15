import { apiFetch } from './http';

export type ReportsResponse<T> = {
  code?: number;
  message?: string;
  payload: T;
};

export type InvoiceReportParams = {
  territoryId: number;
  startDate: string;
  endDate: string;
};

// Fetches active invoices for the given territory and date range.
export async function getAllActiveInvoices<T = any>({
  territoryId,
  startDate,
  endDate,
}: InvoiceReportParams): Promise<T> {
  const query = [
    `territoryId=${encodeURIComponent(String(territoryId))}`,
    `startDate=${encodeURIComponent(startDate)}`,
    `endDate=${encodeURIComponent(endDate)}`,
  ].join('&');

  const path = `/api/v1/reports/invoiceReport/getAllActiveInvoicesForMobile?${query}`;
  const response = await apiFetch<ReportsResponse<T>>(path);

  if (!response?.payload) {
    throw new Error('Reports response missing payload');
  }

  return response.payload;
}
