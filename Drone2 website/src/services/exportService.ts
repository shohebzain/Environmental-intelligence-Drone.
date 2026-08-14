import { jsPDF } from "jspdf";
import { ReportData } from "../types";

/**
 * Service providing robust PDF, CSV, and JSON export/serialization capabilities
 * for Environmental Intelligence Drone (EID) analytics and audit reports.
 */

/**
 * Helper to escape CSV cell strings (handles commas, quotes, and newlines)
 */
function escapeCsvCell(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '""';
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Trigger browser file download using a Blob and temporary anchor element
 */
function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 150);
}

export const exportService = {
  /**
   * Export Report Data and Analytics Time Series to CSV
   */
  exportToCsv(report: ReportData): void {
    const rows: string[][] = [];

    // Header Metadata
    rows.push(["REPORT TYPE", report.title]);
    rows.push(["SURVEY ZONE", report.zone]);
    rows.push(["DATE", report.date]);
    rows.push(["SURVEY ID", report.surveyId]);
    rows.push(["OVERALL RISK LEVEL", report.riskLevel]);
    rows.push(["DEPLOYED NODE", report.droneNode]);
    rows.push(["COVERAGE AREA", report.coverage]);
    rows.push([]);

    // Key Summary Metrics
    rows.push(["KEY MEASURED METRICS"]);
    rows.push(["Peak Methane (PPM)", report.peakMethane]);
    rows.push(["Average AQI", report.avgAqi]);
    rows.push(["Ambient Temperature", report.temp]);
    rows.push(["Wind Vector", report.wind]);
    if (report.analytics?.summary) {
      rows.push(["Total Telemetry Samples", String(report.analytics.summary.total_measurements)]);
      rows.push(["Max AQI Recorded", String(report.analytics.summary.max_aqi)]);
      rows.push(["Max Methane (PPM) Recorded", String(report.analytics.summary.max_methane)]);
    }
    rows.push([]);

    // Executive & Hotspot Summary
    rows.push(["EXECUTIVE SUMMARY", report.summary]);
    rows.push(["HOTSPOT ASSESSMENT", report.hotspot]);
    rows.push([]);

    // Action Protocols
    rows.push(["ACTION PROTOCOLS / RECOMMENDATIONS"]);
    report.recommendations.forEach((rec, idx) => {
      rows.push([`Protocol ${idx + 1}`, rec]);
    });
    rows.push([]);

    // Detailed Telemetry Time Series Table
    const timeSeriesData = report.timeSeries || report.analytics?.time_series;
    if (timeSeriesData && timeSeriesData.length > 0) {
      rows.push(["DETAILED TELEMETRY SAMPLES"]);
      rows.push(["Timestamp", "Methane (PPM)", "AQI", "Temperature (°C)", "Humidity (%)", "Risk Level"]);
      timeSeriesData.forEach((sample) => {
        rows.push([
          sample.timestamp,
          String(sample.methane),
          String(sample.air_quality),
          String(sample.temperature),
          String(sample.humidity),
          sample.risk,
        ]);
      });
    }

    // Convert rows to CSV string
    const csvContent = rows.map((row) => row.map(escapeCsvCell).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const filename = `EID_Report_${report.reportType || "audit"}_${Date.now()}.csv`;
    triggerBlobDownload(blob, filename);
  },

  /**
   * Export Report Data to PDF using jsPDF
   */
  exportToPdf(report: ReportData): void {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      let y = margin;

      // Header Banner Background
      doc.setFillColor(4, 120, 87); // Emerald 700 (#047857)
      doc.rect(0, 0, pageWidth, 20, "F");

      // Banner Text
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text("GHMC & EPA TELANGANA • ENVIRONMENTAL INTELLIGENCE REPORT", margin, 13);

      y = 30;

      // Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(15, 23, 42); // Slate 900
      doc.text(report.title, margin, y);
      y += 7;

      // Metadata subtitle line
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139); // Slate 500
      doc.text(`Zone: ${report.zone}  |  Generated: ${report.date}  |  ID: ${report.surveyId}`, margin, y);
      y += 8;

      // Divider Line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;

      // Key Metrics Box Grid (4 columns)
      const gridBoxWidth = (pageWidth - 2 * margin - 9) / 4;
      const metrics = [
        { label: "PEAK METHANE", val: report.peakMethane },
        { label: "AVERAGE AQI", val: report.avgAqi },
        { label: "TEMPERATURE", val: report.temp },
        { label: "WIND VECTOR", val: report.wind },
      ];

      metrics.forEach((m, idx) => {
        const x = margin + idx * (gridBoxWidth + 3);
        doc.setFillColor(248, 250, 252); // Slate 50
        doc.setDrawColor(203, 213, 225); // Slate 300
        doc.roundedRect(x, y, gridBoxWidth, 16, 2, 2, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text(m.label, x + 3, y + 5);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text(m.val, x + 3, y + 12);
      });

      y += 22;

      // Section 1: Executive Summary
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(4, 120, 87);
      doc.text("1. Executive Survey Summary", margin, y);
      y += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      const summaryLines = doc.splitTextToSize(report.summary, pageWidth - 2 * margin);
      doc.text(summaryLines, margin, y);
      y += summaryLines.length * 4.5 + 4;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`Deployed Drone Node: ${report.droneNode}   |   Coverage Area: ${report.coverage}   |   Risk Level: ${report.riskLevel}`, margin, y);
      y += 8;

      // Section 2: Hotspot Assessment
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(4, 120, 87);
      doc.text("2. Hotspot & Methane Migration Assessment", margin, y);
      y += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      const hotspotLines = doc.splitTextToSize(report.hotspot, pageWidth - 2 * margin);
      doc.text(hotspotLines, margin, y);
      y += hotspotLines.length * 4.5 + 6;

      // Section 3: Action Protocols
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(4, 120, 87);
      doc.text("3. Action Protocols & Directives", margin, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      report.recommendations.forEach((rec, idx) => {
        const bulletText = `•  [Protocol ${idx + 1}] ${rec}`;
        const bulletLines = doc.splitTextToSize(bulletText, pageWidth - 2 * margin);
        doc.text(bulletLines, margin, y);
        y += bulletLines.length * 4.5 + 1.5;
      });

      y += 4;

      // Telemetry table header if available
      const timeSeriesData = report.timeSeries || report.analytics?.time_series;
      if (timeSeriesData && timeSeriesData.length > 0) {
        if (y > pageHeight - 50) {
          doc.addPage();
          y = margin;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(4, 120, 87);
        doc.text("4. Recent Telemetry Samples", margin, y);
        y += 6;

        // Table Header
        doc.setFillColor(241, 245, 249);
        doc.rect(margin, y, pageWidth - 2 * margin, 6, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        doc.text("Time", margin + 2, y + 4.5);
        doc.text("Methane", margin + 30, y + 4.5);
        doc.text("AQI", margin + 65, y + 4.5);
        doc.text("Temp (°C)", margin + 95, y + 4.5);
        doc.text("Humidity (%)", margin + 130, y + 4.5);
        doc.text("Risk", margin + 160, y + 4.5);
        y += 7;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(51, 65, 85);

        // Render first 10 telemetry rows to fit neatly
        const sampleRows = timeSeriesData.slice(0, 10);
        sampleRows.forEach((row) => {
          if (y > pageHeight - 20) {
            doc.addPage();
            y = margin;
          }
          doc.text(row.timestamp, margin + 2, y + 4);
          doc.text(`${row.methane} PPM`, margin + 30, y + 4);
          doc.text(String(row.air_quality), margin + 65, y + 4);
          doc.text(`${row.temperature}°C`, margin + 95, y + 4);
          doc.text(`${row.humidity}%`, margin + 130, y + 4);
          doc.text(row.risk, margin + 160, y + 4);

          doc.setDrawColor(241, 245, 249);
          doc.line(margin, y + 5.5, pageWidth - margin, y + 5.5);
          y += 6;
        });
      }

      // Footer Sign-off
      const footerY = Math.max(y + 10, pageHeight - 15);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("Digitally Certified by Greater Hyderabad Municipal Corporation (GHMC) Environmental Control Desk.", margin, footerY);

      // Save PDF
      const filename = `EID_Report_${report.reportType || "audit"}_${Date.now()}.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error("jsPDF generation error:", err);
      // Fallback: trigger print dialog if jsPDF fails
      window.print();
    }
  },

  /**
   * Export Complete Report and Serialized Analytics Data to JSON
   */
  exportToJson(report: ReportData): void {
    const jsonString = JSON.stringify(report, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const filename = `EID_Report_${report.reportType || "audit"}_${Date.now()}.json`;
    triggerBlobDownload(blob, filename);
  },
};
