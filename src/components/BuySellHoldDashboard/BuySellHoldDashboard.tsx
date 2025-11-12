import {useQuery} from '@tanstack/react-query';
import axios from 'axios';
import {useSearchParams} from 'react-router-dom';

type BuySellHoldPlayer = {
    Player: string;
    Position: string;
    Team: string;
    Age: number;
    MarketADP: number;
    DomainRank: number;
    Difference: number;
    PercentageDifference: string;
    CalculatedVerdict: string;
    ManualOverride: string;
    Overall: string;
    ContendTeam: string;
    RebuildTeam: string;
};
type BuySellHoldPlayerList = BuySellHoldPlayer[];

export default function BuySellHoldDashboard() {
    const [searchParams] = useSearchParams();
    const {
        data: apiData,
        error,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['buySellHold', searchParams],
        queryFn: async () => {
            const weekParam = searchParams.get('week') || '11';
            const options = {
                method: 'GET',
                url: `https://domainffapi.azurewebsites.net/api/BuySellHold/${weekParam}`,
            };
            const res = await axios.request(options);
            return res.data as BuySellHoldPlayerList;
        },
        retry: false,
    });
    return (
        <>
            {apiData && <div>{JSON.stringify(apiData)}</div>}
            {isLoading && <div>loading...</div>}
            {isError && <div>{`Error: ${error}`}</div>}
        </>
    );
}
