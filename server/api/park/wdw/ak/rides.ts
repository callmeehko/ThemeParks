import { H3Event } from 'h3';
import { generateWDWRides, WaltDisneyWorldParkSlug } from '~/types/WDW';

async function load(event: H3Event) {
    const data: any = await generateWDWRides(event, WaltDisneyWorldParkSlug.Animal_Kingdom);

    return data;
}

export default eventHandler((event) => {
    return load(event);
})