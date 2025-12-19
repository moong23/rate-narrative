export interface FXCalendarEvent {
  currency: string;
  title: string;
  impact: 'High' | 'Medium' | 'Low';
  time: string;
}

export interface FXCalendarAPIResponse {
  currency?: string;
  event?: string;
  title?: string;
  impact?: string;
  time?: string;
}
