import { H3Event } from 'h3';
import { ThemeParkRide } from '~/types/ThemePark';

async function load(event: H3Event){
    let dat: ThemeParkRide[] = [];
    const data: any = await ThemeParkFetch(useRuntimeConfig(event).UNIVERSALORLANDO_ASSET)
    data.forEach((ride) => {
        if(ride.category != "general" || !ride.venue_id.includes("ioa")) return;
        if(ride.queues[0].status == "CLOSED" || ride.queues[0].status == "WEATHER_DELAY" ) {
            dat.push({
                id: ride.wait_time_attraction_id,
                name: ride.name,
                status: ride.queues[0].status,
            })
        } else if(ride.queues[0].status == "OPEN") {
            dat.push({
                id: ride.wait_time_attraction_id,
                name: ride.name,
                status: ride.queues[0].status,
                wait_time: ride.queues[0].display_wait_time
            })
        }
    })
    return dat;
}

export default eventHandler((event) => {
    return load(event);
})