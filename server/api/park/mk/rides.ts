import { H3Event } from 'h3';
import { ThemeParkGeneral } from '~/types/ThemePark';
import { generateWDWRides, WaltDisneyWorldParkSlug } from '~/types/WDW';

async function load(event: H3Event) {
    const data: any = await generateWDWRides(event, WaltDisneyWorldParkSlug.Magic_Kingdom);

    return data;
}

export default eventHandler((event) => {
    return load(event);
})