import type { CacheOptions } from "nitropack";

const commonOptions: CacheOptions = {
    group: "themeparks",
    swr: false,
    maxAge: 60 * 5,
    staleMaxAge: 60 * 10
}

const cacheOptions = (name: string): CacheOptions => ({
    ...commonOptions,
    name,
})

export const ThemeParkFetch = cachedFunction(async (url: string) => {
    const data = await $fetch(url)

    return data
}, {
    ...cacheOptions("ThemePark")
})

export const WDWMockRequestFetch = cachedFunction(async (url: string, code: string) => {
    try {
        const data = await $fetch(url, {
            method: 'GET',
            headers: {
                'X-App-Id': 'WDW-MDX-ANDROID-3.4.1',
                'User-Agent': "WDPRO-MOBILE.MDX.WDW.ANDROID-PROD",
                'Authorization': `Bearer ${code}`,
                'Accept': '*/*'
            }
        });
        return data;
    } catch (err) {
        throw err;
    }
}, {
    ...cacheOptions("ThemeParks")
})