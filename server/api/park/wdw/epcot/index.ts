import { H3Event } from 'h3';
import { WaltDisneyWorldParkID } from '~/types/Disney';
import { ThemeParkGeneral } from '~/types/ThemePark';
import { generateWDW, generateWDWSchedule } from '~/utils/WDW';

async function load(event: H3Event) {
    const data: any = await generateWDW(event, WaltDisneyWorldParkID.Epcot);
    const dat: ThemeParkGeneral = {
        name: data['name'],
        id: `wdw.${data['urlFriendlyId']}`,
        hours: []
    }

    const scheduleDat: any = await generateWDWSchedule(event, WaltDisneyWorldParkID.Epcot);
    dat.hours = scheduleDat;

    return dat;
}

export default eventHandler((event) => {
    return load(event);
})