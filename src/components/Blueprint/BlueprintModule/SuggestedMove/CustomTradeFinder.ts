import axios from 'axios';
import {AZURE_API_URL, TradeAsset} from '../../../../hooks/hooks';
import {useEffect, useState} from 'react';

const WEEK_ID = 19;
const MAX_RESULTS = 300;

export type TradeIdea = {
    inAssets: TradeAsset[];
    outAssets: TradeAsset[];
};

export function useCustomTradeFinder(leagueId: string, rosterId: number) {
    const [finder, setFinder] = useState<CustomTradeFinder>();
    useEffect(() => {
        setFinder(new CustomTradeFinder(leagueId, rosterId));
    }, [leagueId, rosterId]);
    return finder;
}

class CustomTradeFinder {
    leagueId: string;
    rosterId: number;
    downtierCache: Map<string, TradeIdea[]> = new Map();
    pivotCache: Map<string, TradeIdea[]> = new Map();
    uptierCache: Map<string, TradeIdea[]> = new Map();

    constructor(leagueId: string, rosterId: number) {
        this.leagueId = leagueId;
        this.rosterId = rosterId;
    }

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
            method: 'POST',
            url: `${AZURE_API_URL}TradeRulesAdmin/customize`,
            data: {
                leagueId: this.leagueId,
                rosterId: this.rosterId,
                gradeRunVersionNumber: 1,
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

    async fetchCustomPivot(outAssetKey: string) {
        if (this.pivotCache.has(outAssetKey)) {
            return this.pivotCache.get(outAssetKey)!;
        }
        const authToken = sessionStorage.getItem('authToken');
        const options = {
            method: 'POST',
            url: `${AZURE_API_URL}TradeRulesAdmin/customize`,
            data: {
                leagueId: this.leagueId,
                rosterId: this.rosterId,
                gradeRunVersionNumber: 1,
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

    async fetchCustomUptier(outAssetKeys: string[]) {
        const cacheKey = CustomTradeFinder.assetKeysToCacheKey(outAssetKeys);
        if (this.uptierCache.has(cacheKey)) {
            return this.uptierCache.get(cacheKey)!;
        }
        const authToken = sessionStorage.getItem('authToken');
        const options = {
            method: 'POST',
            url: `${AZURE_API_URL}TradeRulesAdmin/customize`,
            data: {
                leagueId: this.leagueId,
                rosterId: this.rosterId,
                gradeRunVersionNumber: 1,
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
