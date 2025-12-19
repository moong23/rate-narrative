import { NewsArticle } from '@/types/fx';
import { cn } from '@/lib/utils';
import { Newspaper, ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface NewsPanelProps {
  news: NewsArticle[];
  loading: boolean;
}

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffHours < 1) return 'Just now';
  if (diffHours === 1) return '1h ago';
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
};

const SentimentIcon = ({ sentiment, score }: { sentiment: 'bullish' | 'bearish' | 'neutral'; score: number }) => {
  const config = {
    bullish: { icon: TrendingUp, className: 'text-bullish bg-bullish/10' },
    bearish: { icon: TrendingDown, className: 'text-bearish bg-bearish/10' },
    neutral: { icon: Minus, className: 'text-muted-foreground bg-muted' },
  };
  
  const { icon: Icon, className } = config[sentiment];
  
  return (
    <div 
      className={cn('p-1.5 rounded-md', className)} 
      title={`Sentiment: ${sentiment} (${(score * 100).toFixed(0)}%)`}
      aria-label={`${sentiment} sentiment`}
    >
      <Icon className="w-3.5 h-3.5" />
    </div>
  );
};

export function NewsPanel({ news, loading }: NewsPanelProps) {
  if (loading) {
    return (
      <aside className="research-card p-6 animate-pulse" aria-label="Market news loading">
        <div className="h-5 w-28 bg-muted rounded mb-4" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-4">
            <div className="h-4 w-3/4 bg-muted rounded mb-2" />
            <div className="h-3 w-full bg-muted rounded" />
          </div>
        ))}
      </aside>
    );
  }

  return (
    <aside className="research-card p-6 animate-fade-in" role="complementary" aria-label="Market news">
      <h2 className="text-xl font-semibold flex items-center gap-2 mb-5">
        <Newspaper className="w-5 h-5 text-primary" aria-hidden="true" />
        News
      </h2>

      <div className="space-y-3">
        {news.map((article, index) => (
          <article
            key={article.id}
            className={cn(
              "news-item p-4 rounded-lg border border-border cursor-pointer",
              `animate-fade-in delay-${(index + 1) * 100}`
            )}
            tabIndex={0}
            role="article"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="text-sm font-medium leading-snug hover:text-primary transition-colors">
                {article.title}
              </h3>
              <SentimentIcon sentiment={article.sentiment} score={article.sentimentScore} />
            </div>
            
            <p className="text-caption mb-3 leading-relaxed line-clamp-2">
              {article.summary}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-caption">
                <span className="font-medium">{article.source}</span>
                <span aria-hidden="true">•</span>
                <time dateTime={article.publishedAt.toISOString()}>{formatTimeAgo(article.publishedAt)}</time>
              </div>
              <button 
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                aria-label={`Open article: ${article.title}`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </article>
        ))}
      </div>

      {news.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Newspaper className="w-8 h-8 mx-auto mb-2 opacity-50" aria-hidden="true" />
          <p>No news available</p>
        </div>
      )}
    </aside>
  );
}
