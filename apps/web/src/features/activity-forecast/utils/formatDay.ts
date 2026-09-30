const toDate = (isoDate: string) => new Date(`${isoDate}T12:00:00Z`);

const SHORT_DAY = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const WEEKDAY = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "UTC" });

const LONG_DAY = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

export const formatShortDay = (isoDate: string) => SHORT_DAY.format(toDate(isoDate));

export const formatWeekday = (isoDate: string) => WEEKDAY.format(toDate(isoDate));

export const formatDayOfMonth = (isoDate: string) => String(toDate(isoDate).getUTCDate());

export const formatLongDay = (isoDate: string) => LONG_DAY.format(toDate(isoDate));
