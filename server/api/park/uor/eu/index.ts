import { H3Event } from "h3";
import { ThemeParkGeneral } from "~/types/ThemePark";

async function load(event: H3Event) {
  let dat: ThemeParkGeneral = {
    name: `Universals Epic Universe`,
    id: `uor.eu`,
    hours: [],
  };
  const data: any = await ThemeParkFetch(
    useRuntimeConfig(event).UNIVERSALORLANDO_SERVICE,
  );
  const service = data.Results[4];
  dat.name == service.MblDisplayName;
  service.Hours.forEach((hour) => {
    if (hour.EarlyEntryUnix == 0) {
      dat.hours.push({
        date: hour.Date,
        openTime: hour.OpenTimeUnix,
        closeTime: hour.CloseTimeUnix,
      });
    } else {
      dat.hours.push({
        date: hour.Date,
        openTime: hour.OpenTimeUnix,
        closeTime: hour.CloseTimeUnix,
        earlyTime: hour.EarlyEntryUnix,
      });
    }
  });

  return dat;
}

export default eventHandler((event) => {
  return load(event);
});
