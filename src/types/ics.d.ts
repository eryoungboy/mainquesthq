declare module 'ics' {
  export function createEvent(attributes: any): { error?: Error; value?: string };
}
