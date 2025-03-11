import { rgbToHex } from '~/types/RGBHex'
import { H3Event } from 'h3';
import { ThemeParkHour, ThemeParkRide } from '../types/ThemePark';
import { WaltDisneyWorldParkID, WaltDisneyWorldParkSlug, WaltDisneyWorldResortID } from '~/types/Disney';
import { WDWMockRequestFetch } from './cache';

let authTokenCache: { token: string; expires: number } | null = null;

export function toDisneyWorld(park: WaltDisneyWorldParkID, resort?: WaltDisneyWorldResortID) : string {
    return `/theme-parks/${park}/`
}

function toDisneyWorldSafeURL(park: WaltDisneyWorldParkSlug | WaltDisneyWorldParkID) : string {
    if(park === WaltDisneyWorldParkSlug.Magic_Kingdom || park === WaltDisneyWorldParkID.Magic_Kingdom) {
        return "magic-kingdom"
    }
    if(park === WaltDisneyWorldParkSlug.Epcot || park === WaltDisneyWorldParkID.Epcot) {
        return "epcot"
    }
    if(park === WaltDisneyWorldParkSlug.Animal_Kingdom || park === WaltDisneyWorldParkID.Animal_Kingdom) {
        return "animal-kingdom"
    }
    if(park === WaltDisneyWorldParkSlug.Hollywood_Studios || park === WaltDisneyWorldParkID.Hollywood_Studios) {
        return "hollywood-studios"
    }
    // Add a default return to handle all cases
    return "";
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
export async function generateDisneyAuthenticationCode(event: H3Event) : Promise<string> {
    const now = Date.now();
    if (authTokenCache && authTokenCache.expires > now) {
        return authTokenCache.token;
    }

    try {

        const data: any = await $fetch(useRuntimeConfig(event).WALTDISNEYWORLD_AUTH, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
                'Accept': '*/*'
            },
            body: "grant_type=assertion&assertion_type=public&client_id=WDPRO-MOBILE.MDX.WDW.ANDROID-PROD"
        })

        authTokenCache = {
            token: data.access_token,
            expires: now + (data.expires_in * 100) - 60000
        };

        return data.access_token;
    } catch (err) {
        setResponseStatus(event, 500, "Auth failed.")
        return "failed to get authentication from disney"
    }
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

    const data: any = await WDWMockRequestFetch(useRuntimeConfig(event).WALTDISNEYWORLD_FACILITY + '/schedules/' + park, code)

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

function sanitizeRideName(name: string) : string {
    return name.toLocaleLowerCase()
        .replace(/[~'",/,.'"]/g, '')
        .replace(/\s+/g, '_');
}

export async function generateWDWRides(event: H3Event, park: WaltDisneyWorldParkSlug): Promise<ThemeParkRide[]> {
    try {
        const data = await ThemeParkFetch(useRuntimeConfig(event).WALTDISNEYWORLD_RIDES + park + '/live');
        
        const rides = data.liveData.filter(ride => ride.entityType === "ATTRACTION");
        
        return rides.map(ride => {
            const baseId = `wdw.${toDisneyWorldSafeURL(park)}.${sanitizeRideName(ride.name)}`;
            
            const baseRide: ThemeParkRide = {
                id: baseId,
                name: ride.name,
                status: generateSafeOperating(ride.status),
            };

            if (ride.queue?.STANDBY?.waitTime != null && ride.status !== "CLOSED") {
                return {
                    ...baseRide,
                    wait_time: ride.queue.STANDBY.waitTime,
                };
            }

            return baseRide;
        });
    } catch (error) {
        console.error('Failed to fetch WDW rides:', error);
        throw error;
    }
}