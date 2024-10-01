import { H3Event } from 'h3';
import { ThemeParkInfo } from '~/types/ThemePark';
import { metaExists, loadMeta } from '~/utils/data';

async function load(event: H3Event){
    const dat: ThemeParkInfo = {
        name: 'Universal Studios Florida',
        id: 'uor.usf',
        description: ''
    }
    const data: any = await ThemeParkFetch(useRuntimeConfig(event).UNIVERSALORLANDO_SERVICE)
    const service = data.Results[1]
    dat.hours = [];
    service.Hours.forEach((hour) => {
        if(hour.EarlyEntryUnix == 0) {
            dat.hours.push({
                date: hour.Date,
                openTime: hour.OpenTimeUnix,
                closeTime: hour.CloseTimeUnix
            })
        } else {
            dat.hours.push({
                date: hour.Date,
                openTime: hour.OpenTimeUnix,
                closeTime: hour.CloseTimeUnix,
                earlyTime: hour.EarlyEntryUnix
            })
        }
    })
    dat.color = service.Color;
    dat.gps = {
        latitude: service.Latitude,
        longitude: service.Longitude
    }

    return dat;
}

export default eventHandler((event) => {
    return load(event);
})