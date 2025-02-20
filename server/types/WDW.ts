import { rgbToHex } from '~/types/RGBHex'
import { H3Event } from 'h3';
import { ThemeParkHour, ThemeParkRide } from './ThemePark';

export enum WaltDisneyWorldParkID {
    Magic_Kingdom = 80007944,
    Epcot = 80007838,
    Hollywood_Studios = 80007998,
    Animal_Kingdom = 80007823
}

export enum WaltDisneyWorldResortID {
    Magic_Kingdom = 80007798,
    Epcot = 80007798,
    Hollywood_Studios = 80007798,
    Animal_Kingdom = 80007798
}

export enum WaltDisneyWorldParkSlug {
    Magic_Kingdom = "magickingdompark",
    Epcot = "epcot",
    Hollywood_Studios = "disneyshollywoodstudios",
    Animal_Kingdom = "disneysanimalkingdomthemepark",
}

export function toDisneyWorld(park: WaltDisneyWorldParkID, resort?: WaltDisneyWorldResortID) : string {
    return `/theme-parks/${park}/`
}

function toDisneyWorldSafeURL(park: WaltDisneyWorldParkSlug | WaltDisneyWorldParkID | WaltDisneyWorldResortID) : string {
    if(park == WaltDisneyWorldParkSlug.Magic_Kingdom || WaltDisneyWorldParkID.Magic_Kingdom || WaltDisneyWorldResortID.Magic_Kingdom) {
        return "magic-kingdom"
    }
    if(park == WaltDisneyWorldParkSlug.Epcot || WaltDisneyWorldParkID.Epcot || WaltDisneyWorldResortID.Epcot) {
        return "epcot"
    }
    if(park == WaltDisneyWorldParkSlug.Animal_Kingdom || WaltDisneyWorldParkID.Animal_Kingdom || WaltDisneyWorldResortID.Animal_Kingdom) {
        return "animal-kingdom"
    }
    if(park == WaltDisneyWorldParkSlug.Hollywood_Studios || WaltDisneyWorldParkID.Hollywood_Studios || WaltDisneyWorldResortID.Hollywood_Studios) {
        return "hollywood-studios"
    }
}

function generateSafeOperating(wdwStatus: string) : string {
    if(wdwStatus == "OPERATING") return "OPEN"
    if(wdwStatus == "REFURBISHMENT") return "CLOSED"
    else return wdwStatus
}

export function RGBDisneyToHex(s: string) : null | string {
    const regex = /color:\s*([^;]+)/;
    const match = s.match(regex);
    let sw: any = match ? match[1].trim() : null;
    sw = sw.replace("rgb(", "").replace(")", "").split(", ")
    let ns: Array<Number> = [];
    sw.forEach(n => {
        ns.push(Number(n))
    })
    return rgbToHex(ns);
}

// this seems to be more than just WDW.
export async function generateDisneyAuthenticationCode(event: H3Event) : Promise<any> {
    const data: any = await $fetch(useRuntimeConfig(event).WALTDISNEYWORLD_AUTH, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
            'Accept': '*/*'
        },
        body: "grant_type=assertion&assertion_type=public&client_id=WDPRO-MOBILE.MDX.WDW.ANDROID-PROD"
    })

    return data.access_token;
}

export async function generateWDW(event: H3Event, park: WaltDisneyWorldParkID) : Promise<any> {
    const code: any = await generateDisneyAuthenticationCode(event);
    const data: any = await $fetch(useRuntimeConfig(event).WALTDISNEYWORLD_FACILITY + toDisneyWorld(park), {
        method: 'GET',
        headers: {
            'X-App-Id': 'WDW-MDX-ANDROID-3.4.1',
            'User-Agent': "WDPRO-MOBILE.MDX.WDW.ANDROID-PROD",
            'Authorization': `Bearer ${code}`,
            'Accept': '*/*'
        }
    })

    return data;
}

export async function generateWDWSchedule(event: H3Event, park: WaltDisneyWorldParkID) : Promise<any> {
    const code: any = await generateDisneyAuthenticationCode(event);
    const data: any = await $fetch(useRuntimeConfig(event).WALTDISNEYWORLD_FACILITY + '/schedules/' + park, {
        method: 'GET',
        headers: {
            'X-App-Id': 'WDW-MDX-ANDROID-3.4.1',
            'User-Agent': "WDPRO-MOBILE.MDX.WDW.ANDROID-PROD",
            'Authorization': `Bearer ${code}`,
            'Accept': '*/*'
        }
    })

    const schedule = data["schedules"].filter(date => date.type === "Operating");
    const newSchedule: ThemeParkHour[] = [];

    schedule.forEach(date => {
        const openTime = new Date(`${date.date}T${date.startTime}`).getTime() / 1000;
        const closeTime = new Date(`${date.date}T${date.endTime}`).getTime() / 1000;
        newSchedule.push({
            date: date.date,
            openTime: openTime,
            closeTime: closeTime,
        })
    });


    return newSchedule;
}

export async function generateWDWRides(event: H3Event, park: WaltDisneyWorldParkSlug) : Promise<any> {
    const data: any = await ThemeParkFetch(useRuntimeConfig(event).WALTDISNEYWORLD_RIDES + park + '/live');
    const rides: any = data['liveData'].filter(ride => ride.entityType === "ATTRACTION");

    const newRides: ThemeParkRide[] = [];
    rides.forEach(ride => {
        let id = `wdw.${toDisneyWorldSafeURL(park)}.${ride.name.toLocaleLowerCase().replaceAll("~", "").replaceAll("'", "").replaceAll(",", "").replaceAll("/", "").replaceAll('"', "").replaceAll("'", "").replaceAll(".", "").split(" ").join("_")}`
        if(ride.queue && ride.queue["STANDBY"] && ride.status !== "CLOSED" && ride.queue["STANDBY"]["waitTime"] != null) {
            newRides.push({
                id: id,
                name: ride.name,
                status: generateSafeOperating(ride.status),
                wait_time: ride.queue["STANDBY"]["waitTime"],
            })
        } else {
            newRides.push({
                id: id,
                name: ride.name,
                status: generateSafeOperating(ride.status),
            })
        }
    });

    return newRides;
}