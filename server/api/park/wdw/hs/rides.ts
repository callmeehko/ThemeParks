import { H3Event } from 'h3';
import { WaltDisneyWorldParkSlug } from '~/types/Disney';
import { generateWDWRides } from '~/utils/WDW';

async function load(event: H3Event) {
    const data: any = await generateWDWRides(event, WaltDisneyWorldParkSlug.Hollywood_Studios);

    return data;
}

export default eventHandler((event) => {
    return load(event);
})