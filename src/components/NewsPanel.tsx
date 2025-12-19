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
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;
  return `${Math.floor(diffHours / 24)} days ago`;
};

const SentimentIcon = ({ sentiment }: { sentiment: 'bullish' | 'bearish' | 'neutral' }) => {
  const config = {
    bullish: { icon: TrendingUp, className: 'text-bullish bg-bullish/20' },
    bearish: { icon: TrendingDown, className: 'text-bearish bg-bearish/20' },
    neutral: { icon: Minus, className: 'text-muted-foreground bg-muted' },
  };
  
  const { icon: Icon, className } = config[sentiment];
  
  return (
    <div className={cn('p-1.5 rounded-md', className)}>
      <Icon className="w-3.5 h-3.5" />
    </div>
  );
};

export function NewsPanel({ news, loading }: NewsPanelProps) {
  if (loading) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="h-6 w-32 bg-muted rounded mb-4" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-4">
            <div className="h-4 w-3/4 bg-muted rounded mb-2" />
            <div className="h-3 w-full bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="glass-card p-6 animate-fade-in">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
        <Newspaper className="w-5 h-5 text-primary" />
        Market News
      </h3>

      <div className="space-y-4">
        {news.map((article) => (
          <article
            key={article.id}
            className="group p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 hover:bg-muted/50 transition-all duration-200"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h4 className="text-sm font-medium leading-snug group-hover:text-primary transition-colors">
                {article.title}
              </h4>
              <SentimentIcon sentiment={article.sentiment} />
            </div>
            
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              {article.summary}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium">{article.source}</span>
                <span>•</span>
                <span>{formatTimeAgo(article.publishedAt)}</span>
              </div>
              <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </article>
        ))}
      </div>

      {news.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Newspaper className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>No news available for this pair</p>
        </div>
      )}
    </div>
  );
}
