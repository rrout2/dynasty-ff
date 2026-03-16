import axios from 'axios';
import {TradeAsset} from '../../../../hooks/hooks';
import {useEffect, useState} from 'react';

const WEEK_ID = 19;
const MAX_RESULTS = 300;
const DEFAULT_OPTIONS = {
    method: 'POST',
    url: 'https://domainffapi.azurewebsites.net/api/TradeRulesAdmin/customize',
};

export type TradeIdea = {
    inAssets: TradeAsset[];
    outAssets: TradeAsset[];
    targetRosterId: number;
    rule: {
        priorityDescription: string;
    };
};

export function useCustomTradeFinder(leagueId: string, rosterId: number) {
    const [finder, setFinder] = useState<CustomTradeFinder>();
    useEffect(() => {
        setFinder(new CustomTradeFinder(leagueId, rosterId));
    }, [leagueId, rosterId]);
    return finder;
}

class CustomTradeFinder {
    private leagueId: string;
    private rosterId: number;
    private downtierCache: Map<string, TradeIdea[]> = new Map();
    private pivotCache: Map<string, TradeIdea[]> = new Map();
    private uptierCache: Map<string, TradeIdea[]> = new Map();

    constructor(leagueId: string, rosterId: number) {
        this.leagueId = leagueId;
        this.rosterId = rosterId;
    }

    /**
     * Fetches a list of custom downtier trades for the given outAssetKeys.
     * The response is cached based on the outAssetKeys and inAssetKeys for future requests.
     * @param outAssetKeys The asset keys to fetch downtier trades for.
     * @param inAssetKeys The asset keys to include in the downtier trades. Defaults to an empty array.
     * @returns A list of TradeIdea objects representing the downtier trades.
     */
    async fetchCustomDowntier(
        outAssetKeys: string[],
        inAssetKeys: string[] = []
    ) {
        const cacheKey = CustomTradeFinder.assetKeysToCacheKey(
            outAssetKeys,
            inAssetKeys
        );
        if (this.downtierCache.has(cacheKey)) {
            return this.downtierCache.get(cacheKey)!;
        }
        const authToken = sessionStorage.getItem('authToken');
        const options = {
            ...DEFAULT_OPTIONS,
            data: {
                leagueId: this.leagueId,
                rosterId: this.rosterId,
                weekId: WEEK_ID,
                moveType: 2,
                outAssetKeys,
                inAssetKeys,
                maxResults: MAX_RESULTS,
            },
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        };
        const res = await axios.request(options);
        this.downtierCache.set(cacheKey, res.data as TradeIdea[]);
        return res.data as TradeIdea[];
    }

    /**
     * Fetches a list of custom pivot trades for the given outAssetKey.
     * The response is cached based on the outAssetKey for future requests.
     * @param outAssetKey The asset key to fetch pivot trades for.
     * @returns A list of TradeIdea objects representing the pivot trades.
     */
    async fetchCustomPivot(outAssetKey: string) {
        if (this.pivotCache.has(outAssetKey)) {
            return this.pivotCache.get(outAssetKey)!;
        }
        const authToken = sessionStorage.getItem('authToken');
        const options = {
            ...DEFAULT_OPTIONS,
            data: {
                leagueId: this.leagueId,
                rosterId: this.rosterId,
                weekId: WEEK_ID,
                moveType: 1,
                outAssetKeys: [outAssetKey],
                maxResults: MAX_RESULTS,
            },
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        };
        const res = await axios.request(options);
        this.pivotCache.set(outAssetKey, res.data as TradeIdea[]);
        return res.data as TradeIdea[];
    }

    /**
     * Fetches a list of custom uptier trades for the given outAssetKeys.
     * The response is cached based on the outAssetKeys for future requests.
     * @param outAssetKeys The asset keys to fetch uptier trades for.
     * @returns A list of TradeIdea objects representing the uptier trades.
     */
    async fetchCustomUptier(outAssetKeys: string[]) {
        const cacheKey = CustomTradeFinder.assetKeysToCacheKey(outAssetKeys);
        if (this.uptierCache.has(cacheKey)) {
            return this.uptierCache.get(cacheKey)!;
        }
        const authToken = sessionStorage.getItem('authToken');
        const options = {
            ...DEFAULT_OPTIONS,
            data: {
                leagueId: this.leagueId,
                rosterId: this.rosterId,
                weekId: WEEK_ID,
                moveType: 3,
                outAssetKeys,
                maxResults: MAX_RESULTS,
            },
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        };
        const res = await axios.request(options);
        this.uptierCache.set(cacheKey, res.data as TradeIdea[]);
        return res.data as TradeIdea[];
    }

    static assetKeysToCacheKey(
        outAssetKeys: string[] = [],
        inAssetKeys: string[] = []
    ) {
        return `out:${outAssetKeys.join(',')},in:${inAssetKeys.join(',')}`;
    }
}
