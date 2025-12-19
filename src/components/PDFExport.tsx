import { useState } from 'react';
import { FileText, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CurrencyPair, ExchangeRate, TradingSignal, NewsArticle, HistoricalRate } from '@/types/fx';

interface PDFExportProps {
  pair: CurrencyPair;
  rate: ExchangeRate | null;
  signal: TradingSignal | null;
  news: NewsArticle[];
  historicalRates: HistoricalRate[];
}

export function PDFExport({ pair, rate, signal, news, historicalRates }: PDFExportProps) {
  const [exporting, setExporting] = useState(false);

  const generatePDF = async () => {
    setExporting(true);
    
    // Create HTML content for the PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #1a1a2e;
              max-width: 800px;
              margin: 0 auto;
              padding: 40px;
            }
            .header {
              border-bottom: 2px solid #00d9ff;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            h1 { color: #1a1a2e; margin: 0; font-size: 28px; }
            h2 { color: #00d9ff; margin-top: 30px; font-size: 18px; border-bottom: 1px solid #e0e0e0; padding-bottom: 8px; }
            .subtitle { color: #666; margin-top: 5px; }
            .rate-box {
              background: #f5f5f5;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .rate-value { font-size: 32px; font-weight: bold; font-family: monospace; }
            .rate-change { font-size: 14px; margin-top: 5px; }
            .bullish { color: #22c55e; }
            .bearish { color: #ef4444; }
            .signal-box {
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .signal-long { background: #dcfce7; border-left: 4px solid #22c55e; }
            .signal-short { background: #fee2e2; border-left: 4px solid #ef4444; }
            .signal-neutral { background: #f5f5f5; border-left: 4px solid #666; }
            .signal-label { font-size: 20px; font-weight: bold; margin-bottom: 10px; }
            .metrics { display: flex; gap: 20px; margin: 15px 0; }
            .metric { background: white; padding: 10px 15px; border-radius: 6px; }
            .metric-label { font-size: 12px; color: #666; }
            .metric-value { font-size: 18px; font-weight: bold; font-family: monospace; }
            .rationale { background: #f9fafb; padding: 15px; border-radius: 6px; margin-top: 15px; }
            .news-item { padding: 15px 0; border-bottom: 1px solid #e0e0e0; }
            .news-title { font-weight: 600; }
            .news-meta { font-size: 12px; color: #666; margin-top: 5px; }
            .news-summary { font-size: 14px; color: #444; margin-top: 8px; }
            .disclaimer {
              margin-top: 40px;
              padding: 15px;
              background: #fff3cd;
              border-radius: 6px;
              font-size: 12px;
              color: #856404;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e0e0e0;
              font-size: 12px;
              color: #666;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${pair.flag} ${pair.base}/${pair.quote} FX Report</h1>
            <p class="subtitle">${pair.name} • Generated ${new Date().toLocaleString()}</p>
          </div>

          <h2>Current Rate</h2>
          <div class="rate-box">
            <div class="rate-value">${rate?.rate.toLocaleString(undefined, { minimumFractionDigits: 4 }) || 'N/A'}</div>
            <div class="rate-change ${rate?.change && rate.change >= 0 ? 'bullish' : 'bearish'}">
              ${rate ? `${rate.change >= 0 ? '▲' : '▼'} ${Math.abs(rate.change).toFixed(4)} (${rate.changePercent >= 0 ? '+' : ''}${rate.changePercent.toFixed(2)}%)` : 'N/A'}
            </div>
          </div>

          <h2>Trading Signal</h2>
          <div class="signal-box signal-${signal?.recommendation || 'neutral'}">
            <div class="signal-label ${signal?.recommendation === 'long' ? 'bullish' : signal?.recommendation === 'short' ? 'bearish' : ''}">${signal?.recommendation.toUpperCase() || 'N/A'}</div>
            <div class="metrics">
              <div class="metric">
                <div class="metric-label">Trend Score</div>
                <div class="metric-value">${signal?.trendScore.toFixed(1) || 'N/A'}</div>
              </div>
              <div class="metric">
                <div class="metric-label">News Sentiment</div>
                <div class="metric-value">${signal?.newsScore.toFixed(1) || 'N/A'}</div>
              </div>
              <div class="metric">
                <div class="metric-label">Confidence</div>
                <div class="metric-value">${signal?.confidence || 'N/A'}%</div>
              </div>
            </div>
            <div class="rationale">
              <strong>Rationale:</strong> ${signal?.rationale || 'No analysis available'}
            </div>
          </div>

          <h2>Recent News</h2>
          ${news.map(article => `
            <div class="news-item">
              <div class="news-title">${article.title}</div>
              <div class="news-meta">${article.source} • ${article.publishedAt.toLocaleDateString()}</div>
              <div class="news-summary">${article.summary}</div>
            </div>
          `).join('')}

          <h2>Historical Data (Last ${historicalRates.length} days)</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <tr style="background: #f5f5f5;">
              <th style="padding: 8px; text-align: left;">Date</th>
              <th style="padding: 8px; text-align: right;">Rate</th>
            </tr>
            ${historicalRates.slice(-10).map(r => `
              <tr style="border-bottom: 1px solid #e0e0e0;">
                <td style="padding: 8px;">${r.date}</td>
                <td style="padding: 8px; text-align: right; font-family: monospace;">${r.rate.toFixed(4)}</td>
              </tr>
            `).join('')}
          </table>

          <div class="disclaimer">
            <strong>⚠️ Disclaimer:</strong> This report is for research and educational purposes only. 
            It does not constitute financial advice. Past performance does not guarantee future results. 
            Always consult with a qualified financial advisor before making investment decisions.
          </div>

          <div class="footer">
            FX Insights • Generated by AI-powered analysis • ${new Date().toISOString()}
          </div>
        </body>
      </html>
    `;

    // Create a blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Open in new window for printing (user can save as PDF)
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };
    }

    setTimeout(() => {
      URL.revokeObjectURL(url);
      setExporting(false);
    }, 1000);
  };

  return (
    <Button
      onClick={generatePDF}
      disabled={exporting || !rate || !signal}
      className="gap-2"
      variant="outline"
    >
      {exporting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <FileText className="w-4 h-4" />
          Export PDF
        </>
      )}
    </Button>
  );
}
