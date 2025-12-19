import { useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
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
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            * { box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, sans-serif;
              line-height: 1.5;
              color: #1A1A1A;
              max-width: 800px;
              margin: 0 auto;
              padding: 48px;
              background: #F8F9FA;
            }
            .header {
              border-bottom: 2px solid #3B82F6;
              padding-bottom: 24px;
              margin-bottom: 32px;
            }
            h1 { font-size: 28px; font-weight: 700; margin: 0 0 8px 0; }
            h2 { font-size: 20px; font-weight: 600; color: #3B82F6; margin: 32px 0 16px 0; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px; }
            .subtitle { color: #6B7280; font-size: 14px; }
            .card {
              background: white;
              padding: 24px;
              border-radius: 8px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.06);
              margin: 16px 0;
            }
            .rate-value { font-size: 36px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
            .rate-change { font-size: 14px; margin-top: 8px; }
            .bullish { color: #10B981; }
            .bearish { color: #EF4444; }
            .signal-box { padding: 24px; border-radius: 8px; margin: 16px 0; }
            .signal-long { background: #ECFDF5; border-left: 4px solid #10B981; }
            .signal-short { background: #FEF2F2; border-left: 4px solid #EF4444; }
            .signal-neutral { background: #F3F4F6; border-left: 4px solid #9CA3AF; }
            .signal-label { font-size: 24px; font-weight: 700; margin-bottom: 12px; }
            .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 20px 0; }
            .metric { background: #F9FAFB; padding: 16px; border-radius: 8px; text-align: center; }
            .metric-label { font-size: 12px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px; }
            .metric-value { font-size: 20px; font-weight: 600; font-family: 'JetBrains Mono', monospace; margin-top: 4px; }
            .rationale { background: #F9FAFB; padding: 20px; border-radius: 8px; margin-top: 20px; }
            .rationale h4 { font-size: 14px; font-weight: 600; color: #6B7280; margin: 0 0 12px 0; }
            .rationale ul { margin: 0; padding-left: 20px; }
            .rationale li { margin-bottom: 8px; font-size: 14px; }
            .news-item { padding: 16px 0; border-bottom: 1px solid #E5E7EB; }
            .news-title { font-weight: 600; font-size: 14px; }
            .news-meta { font-size: 12px; color: #6B7280; margin-top: 4px; }
            .news-summary { font-size: 14px; color: #4B5563; margin-top: 8px; }
            .disclaimer {
              margin-top: 40px;
              padding: 16px;
              background: #FEF3C7;
              border-radius: 8px;
              font-size: 13px;
              color: #92400E;
            }
            .footer {
              margin-top: 32px;
              padding-top: 16px;
              border-top: 1px solid #E5E7EB;
              font-size: 12px;
              color: #9CA3AF;
              text-align: center;
            }
            table { width: 100%; border-collapse: collapse; font-size: 13px; }
            th { background: #F3F4F6; padding: 12px; text-align: left; font-weight: 600; }
            td { padding: 12px; border-bottom: 1px solid #E5E7EB; }
            td.mono { font-family: 'JetBrains Mono', monospace; text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${pair.flag} ${pair.base}/${pair.quote} FX Report</h1>
            <p class="subtitle">${pair.name} • Generated ${new Date().toLocaleString()}</p>
          </div>

          <h2>Current Rate</h2>
          <div class="card">
            <div class="rate-value">${rate?.rate.toLocaleString(undefined, { minimumFractionDigits: 4 }) || 'N/A'}</div>
            <div class="rate-change ${rate?.change && rate.change >= 0 ? 'bullish' : 'bearish'}">
              ${rate ? `${rate.change >= 0 ? '▲' : '▼'} ${Math.abs(rate.change).toFixed(4)} (${rate.changePercent >= 0 ? '+' : ''}${rate.changePercent.toFixed(2)}%) today` : 'N/A'}
            </div>
          </div>

          <h2>Trading Signal</h2>
          <div class="signal-box signal-${signal?.recommendation || 'neutral'}">
            <div class="signal-label ${signal?.recommendation === 'long' ? 'bullish' : signal?.recommendation === 'short' ? 'bearish' : ''}">${signal?.recommendation.toUpperCase() || 'N/A'}</div>
            <div class="metrics">
              <div class="metric">
                <div class="metric-label">Trend Score</div>
                <div class="metric-value">${signal?.trendScore === 1 ? '+1' : '-1'}</div>
              </div>
              <div class="metric">
                <div class="metric-label">News Sentiment</div>
                <div class="metric-value">${signal?.newsScore.toFixed(2) || 'N/A'}</div>
              </div>
              <div class="metric">
                <div class="metric-label">Confidence</div>
                <div class="metric-value">${signal?.confidence || 'N/A'}%</div>
              </div>
            </div>
            <div class="rationale">
              <h4>Analysis</h4>
              <ul>
                ${signal?.rationale.map(r => `<li>${r.replace(/\*\*/g, '')}</li>`).join('') || '<li>No analysis available</li>'}
              </ul>
            </div>
          </div>

          <h2>Recent News</h2>
          ${news.map(article => `
            <div class="news-item">
              <div class="news-title">${article.title}</div>
              <div class="news-meta">${article.source} • Sentiment: ${article.sentiment}</div>
              <div class="news-summary">${article.summary}</div>
            </div>
          `).join('')}

          <h2>Historical Data (Last 10 days)</h2>
          <table>
            <tr><th>Date</th><th style="text-align:right">Rate</th></tr>
            ${historicalRates.slice(-10).reverse().map(r => `
              <tr><td>${new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td><td class="mono">${r.rate.toFixed(4)}</td></tr>
            `).join('')}
          </table>

          <div class="disclaimer">
            <strong>⚠️ Disclaimer:</strong> This report is for research and educational purposes only. It does not constitute financial advice. Past performance does not guarantee future results.
          </div>

          <div class="footer">
            FX Insights Report • Generated ${new Date().toISOString()}
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        setTimeout(() => printWindow.print(), 500);
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
      className="pdf-button gap-2"
      variant="outline"
      role="button"
      aria-label="Export PDF report"
    >
      {exporting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          <span>Generating...</span>
        </>
      ) : (
        <>
          <FileText className="w-4 h-4" aria-hidden="true" />
          <span>Export PDF</span>
        </>
      )}
    </Button>
  );
}
