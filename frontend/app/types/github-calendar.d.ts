declare module "github-calendar" {
  type GitHubCalendarOptions = {
    summary_text?: string;
    proxy?: (username: string) => Promise<string>;
    global_stats?: boolean;
    responsive?: boolean;
    tooltips?: boolean;
    cache?: number;
  };

  export default function GitHubCalendar(
    container: string | HTMLElement,
    username: string,
    options?: GitHubCalendarOptions
  ): Promise<unknown>;
}
