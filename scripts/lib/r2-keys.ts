// Names of the JSON datasets the pipeline reads/writes (R2 object keys, or local filenames
// when DATA_STORE=local), prefixed per event so one bucket can hold every event. Centralized
// here since fetch-donations.ts, build-stats.ts, snapshot-by-date.ts, and archive-event.ts all
// need to agree on the exact same names.

export function r2KeyFull(eventKey: string): string {
  return `${eventKey}/donations-full.json`;
}

export function r2KeyLatest100(eventKey: string): string {
  return `${eventKey}/donations-latest-100.json`;
}

export function r2KeyLatest500(eventKey: string): string {
  return `${eventKey}/donations-latest-500.json`;
}

export function r2KeyStats(eventKey: string): string {
  return `${eventKey}/donations-stats.json`;
}

export function r2KeyForDate(eventKey: string, date: string): string {
  return `${eventKey}/donations-${date}.json`;
}
