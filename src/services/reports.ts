import { api } from "@/lib/axios";

interface DownloadAuditReportParams {
  from?: string;
  to?: string;
}

export async function downloadStoreAuditReport({
  from,
  to,
}: DownloadAuditReportParams) {
  const response = await api.get("/reports/store-audit", {
    params: {
      ...(from
        ? {
            from,
          }
        : {}),

      ...(to
        ? {
            to,
          }
        : {}),
    },

    responseType: "blob",
  });

  const blob = new Blob([response.data], {
    type: "application/pdf",
  });

  const url = window.URL.createObjectURL(blob);

  const disposition = response.headers["content-disposition"];

  const match = disposition?.match(/filename="([^"]+)"/);

  const fileName = match?.[1] ?? "auditoria-iaki.pdf";

  const link = document.createElement("a");

  link.href = url;

  link.download = fileName;

  document.body.appendChild(link);

  link.click();

  link.remove();

  window.URL.revokeObjectURL(url);
}
