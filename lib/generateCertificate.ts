// lib/generateCertificate.ts — client-side PDF via jsPDF + QR code de verificação
import type { CertificateData } from "@/components/CertificateModal";
export type { CertificateData };

const BASE_URL = "https://mapa.oescribadabiblia.com.br";

/**
 * Gera uma Data URL de QR code usando a lib `qrcode`.
 * O QR aponta para a página de verificação do certificado no site.
 */
async function generateQRCodeDataURL(text: string): Promise<string> {
  const QRCode = (await import("qrcode")).default;
  return QRCode.toDataURL(text, {
    width: 160,
    margin: 1,
    color: {
      dark: "#3c2305", // marrom escuro — combina com a paleta do certificado
      light: "#fef9ed", // mesmo fundo pergaminho
    },
  });
}

export async function generateCertificatePDF(
  data: CertificateData,
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const date =
    data.date ??
    new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  // URL de verificação única por bible_id
  const verifyURL = `${BASE_URL}/verificar?id=${encodeURIComponent(data.bible_id)}`;

  // Metadados do PDF (visível em "Propriedades" no leitor)
  doc.setProperties({
    title: `Certificado de Adoção — ${data.city} (${data.uf.toUpperCase()})`,
    subject: "Projeto Geo Bíblia — Certificado de Município Adotado",
    author: "O Escriba da Bíblia",
    keywords: `certificado, geo bíblia, ${data.city}, ${data.uf}, ${data.bible_id}`,
    creator: "oescribadabiblia.com.br",
  });

  // Gerar QR code antes de montar o PDF
  const qrDataURL = await generateQRCodeDataURL(verifyURL);

  // ── Fundo pergaminho ──────────────────────────────────────────────────────
  doc.setFillColor(247, 242, 230);
  doc.rect(0, 0, pw, ph, "F");

  // ── Borda dupla ───────────────────────────────────────────────────────────
  doc.setDrawColor(120, 85, 30);
  doc.setLineWidth(1.8);
  doc.rect(10, 10, pw - 20, ph - 20);
  doc.setLineWidth(0.5);
  doc.rect(14, 14, pw - 28, ph - 28);

  // Ornamentos de canto
  doc.setFontSize(10);
  doc.setTextColor(160, 115, 45);
  doc.text("†", 16, 18, { align: "left" });
  doc.text("†", pw - 16, 18, { align: "right" });
  doc.text("†", 16, ph - 16, { align: "left" });
  doc.text("†", pw - 16, ph - 16, { align: "right" });

  // ── Cabeçalho ─────────────────────────────────────────────────────────────
  doc.setFont("times", "bold");
  doc.setFontSize(10);
  doc.setTextColor(100, 65, 15);
  doc.text("O ESCRIBA DA BÍBLIA", pw / 2, 30, { align: "center" });
  doc.setFont("times", "normal");
  doc.setFontSize(8);
  doc.setTextColor(140, 100, 40);
  doc.text("mapa.oescribadabiblia.com.br", pw / 2, 36, { align: "center" });

  // ── Linhas decorativas ────────────────────────────────────────────────────
  doc.setDrawColor(160, 115, 45);
  doc.setLineWidth(0.3);
  doc.line(28, 40, pw - 28, 40);
  doc.setLineWidth(0.8);
  doc.line(35, 42, pw - 35, 42);
  doc.setLineWidth(0.3);
  doc.line(28, 44, pw - 28, 44);

  // ── Título ────────────────────────────────────────────────────────────────
  doc.setFont("times", "bolditalic");
  doc.setFontSize(22);
  doc.setTextColor(60, 35, 5);
  doc.text("CERTIFICADO DE ADOÇÃO", pw / 2, 56, { align: "center" });
  doc.setFont("times", "bold");
  doc.setFontSize(13);
  doc.setTextColor(140, 90, 20);
  doc.text("PROJETO GEO BÍBLIA", pw / 2, 65, { align: "center" });
  doc.setFont("times", "italic");
  doc.setFontSize(10);
  doc.setTextColor(110, 75, 25);
  doc.text("Cada cidade, uma Palavra de Deus", pw / 2, 72, {
    align: "center",
  });

  // ── Texto do certificado ──────────────────────────────────────────────────
  doc.setFont("times", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(45, 28, 5);
  const lineH = 5.5;
  const textW = pw - 50;
  let currentY = 81;

  const para1 = `Certificamos que o município de ${data.city.toUpperCase()} — ${data.uf.toUpperCase()} foi oficialmente adotado no Projeto Geo Bíblia, recebendo uma passagem das Sagradas Escrituras dedicada à sua terra, ao seu povo e às futuras gerações.`;
  const splitPara1 = doc.splitTextToSize(para1, textW);
  doc.text(splitPara1, pw / 2, currentY, { align: "center" });
  currentY += splitPara1.length * lineH + 4;

  const para2 = `Declaramos, ainda, que o portador deste certificado é reconhecido como Embaixador desta cidade no projeto, sendo o único representante a integrar esta iniciativa em âmbito nacional, assumindo o compromisso de preservar, representar e honrar a Palavra de Deus vinculada ao seu município.`;
  const splitPara2 = doc.splitTextToSize(para2, textW);
  doc.text(splitPara2, pw / 2, currentY, { align: "center" });
  currentY += splitPara2.length * lineH + 4;

  const para3 = `Ao adquirir o exemplar numerado e exclusivo da Bíblia das Cidades, torna-se guardião de um registro espiritual e histórico, eternizado como parte desta obra que une fé, território e propósito.`;
  const splitPara3 = doc.splitTextToSize(para3, textW);
  doc.text(splitPara3, pw / 2, currentY, { align: "center" });
  currentY += splitPara3.length * lineH + 5;

  doc.setFont("times", "bolditalic");
  doc.setFontSize(10);
  doc.setTextColor(110, 75, 25);
  doc.text(
    "Uma cidade. Um representante. Uma Palavra eterna.",
    pw / 2,
    currentY,
    { align: "center" },
  );
  currentY += lineH;

  // ── Caixa de dados ────────────────────────────────────────────────────────
  const boxTop = currentY + 7;
  const boxH = 46;
  const boxL = 28;
  const boxW = pw - 56;
  doc.setFillColor(180, 140, 70);
  doc.roundedRect(boxL + 1.5, boxTop + 1.5, boxW, boxH, 4, 4, "F");
  doc.setFillColor(254, 249, 237);
  doc.setDrawColor(150, 105, 35);
  doc.setLineWidth(0.8);
  doc.roundedRect(boxL, boxTop, boxW, boxH, 4, 4, "FD");
  doc.setDrawColor(200, 160, 80);
  doc.setLineWidth(0.3);
  doc.line(boxL + 8, boxTop + 11, boxL + boxW - 8, boxTop + 11);

  let rowY = boxTop + 15;
  (
    [
      ["Município:", `${data.city} — ${data.uf.toUpperCase()}`],
      ["Bíblia nº:", data.bible_id],
      ["Versículo:", data.reference],
      ["Data:", date],
    ] as [string, string][]
  ).forEach(([label, value]) => {
    doc.setFont("times", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(110, 72, 18);
    doc.text(label, boxL + 12, rowY);
    doc.setFont("times", "normal");
    doc.setFontSize(11);
    doc.setTextColor(35, 20, 3);
    doc.text(value, boxL + 55, rowY);
    rowY += 9;
  });

  // ── Seção QR Code de verificação ──────────────────────────────────────────
  const qrSectionY = boxTop + boxH + 6;
  const qrSize = 22; // mm
  const qrX = pw / 2 - qrSize / 2;

  // Caixinha larga o suficiente para o título e a legenda
  const boxQrW = 80;
  const boxQrX = pw / 2 - boxQrW / 2;
  const boxQrH = qrSize + 20;

  doc.setFillColor(254, 249, 237);
  doc.setDrawColor(160, 115, 45);
  doc.setLineWidth(0.5);
  doc.roundedRect(boxQrX, qrSectionY - 8, boxQrW, boxQrH, 3, 3, "FD");

  // Título da seção — centralizado dentro da caixinha
  doc.setFont("times", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(110, 72, 18);
  doc.text("VERIFICAR AUTENTICIDADE", pw / 2, qrSectionY - 1, {
    align: "center",
  });

  // QR code — centralizado
  doc.addImage(qrDataURL, "PNG", qrX, qrSectionY + 4, qrSize, qrSize);

  // Legenda abaixo do QR — quebrada e centralizada dentro da caixinha
  doc.setFont("times", "italic");
  doc.setFontSize(7);
  doc.setTextColor(130, 88, 30);
  const legendText = doc.splitTextToSize(
    "Escaneie para confirmar a autenticidade deste certificado",
    boxQrW - 8,
  );
  doc.text(legendText, pw / 2, qrSectionY + qrSize + 10, { align: "center" });

  // ── Linhas do rodapé ──────────────────────────────────────────────────────
  const fy = ph - 30;
  doc.setDrawColor(160, 115, 45);
  doc.setLineWidth(0.3);
  doc.line(28, fy, pw - 28, fy);
  doc.setLineWidth(0.8);
  doc.line(35, fy + 2, pw - 35, fy + 2);
  doc.setLineWidth(0.3);
  doc.line(28, fy + 4, pw - 28, fy + 4);

  // ── Rodapé ────────────────────────────────────────────────────────────────
  doc.setFont("times", "italic");
  doc.setFontSize(8.5);
  doc.setTextColor(130, 90, 35);
  doc.text(
    `Documento gerado em ${date}  ·  Bíblia ID: ${data.bible_id}  ·  oescribadabiblia.com.br`,
    pw / 2,
    ph - 18,
    { align: "center" },
  );

  doc.save(
    `certificado-${data.city.toLowerCase().replace(/\s+/g, "-")}-${data.bible_id}.pdf`,
  );
}
