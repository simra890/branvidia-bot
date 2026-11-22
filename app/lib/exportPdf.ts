export type PdfReport = {
    score: number;
    summary: string;
    businessOverview?: string;
    profileReview: string[];
    reviewInsights: {
      sentiment: string;
      positiveThemes: string[];
      complaints: string[];
    };
    photoInsights: string[];
    problems: string[];
    suggestions: { title: string; detail: string; priority: string }[];
    reviewReplies: { author: string; reply: string }[];
    nextSteps: string[];
  };
  
  type RGB = [number, number, number];
  
  // Standard PDF fonts can't draw emoji or some symbols, so clean the text first
  function clean(t: unknown): string {
    return String(t ?? "")
      .replace(/₹/g, "Rs. ")
      .replace(/[^\x20-\x7E\u00A0-\u00FF\u2018\u2019\u201C\u201D\u2013\u2014]/g, "")
      .trim();
  }
  
  export async function exportReportPdf(data: PdfReport, businessName: string) {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });
  
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const M = 48;
    const maxW = W - M * 2;
    let y = 0;
  
    const PURPLE: RGB = [126, 34, 206];
    const DARK: RGB = [31, 41, 55];
    const GRAY: RGB = [107, 114, 128];
  
    function ensure(need: number) {
      if (y + need > H - M) {
        doc.addPage();
        y = M;
      }
    }
  
    function write(t: string, size: number, bold: boolean, color: RGB, indent = 0) {
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(size);
      doc.setTextColor(color[0], color[1], color[2]);
      const lines = doc.splitTextToSize(clean(t), maxW - indent) as string[];
      for (const line of lines) {
        ensure(size * 1.4);
        doc.text(line, M + indent, y + size);
        y += size * 1.4;
      }
    }
  
    function heading(t: string) {
      y += 14;
      ensure(40);
      write(t, 14, true, PURPLE);
      doc.setDrawColor(221, 214, 254);
      doc.line(M, y + 2, W - M, y + 2);
      y += 10;
    }
  
    function bullets(items?: string[]) {
      (items || []).forEach((item) => write("-  " + item, 10.5, false, DARK, 6));
    }
  
    // Header band
    doc.setFillColor(PURPLE[0], PURPLE[1], PURPLE[2]);
    doc.rect(0, 0, W, 78, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Branvidia", M, 38);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("AI Google Business Profile Report", M, 58);
    y = 100;
  
    // Title and score
    write(businessName || "Your business", 20, true, DARK);
    write(
      "Generated on " + new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
      10,
      false,
      GRAY
    );
    y += 8;
    write(`Optimization score: ${data.score} / 100`, 16, true, PURPLE);
    write(data.summary, 11, false, DARK);
  
    heading("Business Overview");
    write(data.businessOverview || data.summary, 10.5, false, DARK);
  
    heading("Google Business Profile Review");
    bullets(data.profileReview);
  
    heading("Customer Review Insights");
    write("Overall sentiment: " + (data.reviewInsights?.sentiment || "n/a"), 10.5, true, DARK);
    y += 4;
    write("What customers like", 10.5, true, [22, 101, 52]);
    bullets(data.reviewInsights?.positiveThemes);
    y += 4;
    write("Complaints", 10.5, true, [185, 28, 28]);
    bullets(data.reviewInsights?.complaints);
  
    heading("Photo Insights");
    bullets(data.photoInsights);
  
    heading("Problems Identified");
    bullets(data.problems);
  
    heading("AI Optimization Suggestions");
    (data.suggestions || []).forEach((s) => {
      write(`${s.title}  [${(s.priority || "").toUpperCase()}]`, 10.5, true, DARK);
      write(s.detail, 10, false, GRAY, 6);
      y += 4;
    });
  
    heading("Suggested Review Responses");
    (data.reviewReplies || []).forEach((r) => {
      write("Reply to " + r.author, 10.5, true, DARK);
      write(r.reply, 10, false, GRAY, 6);
      y += 4;
    });
  
    heading("Suggested Next Steps");
    bullets(data.nextSteps);
  
    // Footer on every page
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
      doc.text("Branvidia AI report  |  www.branvidia.com  |  Demo data", M, H - 24);
      doc.text(`Page ${i} of ${pages}`, W - M, H - 24, { align: "right" });
    }
  
    const fileName = clean(businessName || "business").replace(/\s+/g, "-").toLowerCase();
    doc.save(`${fileName}-ai-report.pdf`);
  }