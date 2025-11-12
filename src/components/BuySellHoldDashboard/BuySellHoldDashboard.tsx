import {DataGrid, GridColDef} from '@mui/x-data-grid';
import {useQuery} from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {useSearchParams} from 'react-router-dom';
import { useTitle } from '../../hooks/hooks';

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

const columns: GridColDef[] = [
    {field: 'Player', headerName: 'Player', width: 150},
    {field: 'Position', headerName: 'Position', width: 100},
    {field: 'Domain Rank', headerName: 'Domain Rank', width: 100},
    {field: 'Market ADP', headerName: 'Market ADP', width: 100},
    {field: 'Difference', headerName: 'Difference', width: 100},
    {field: 'Calculated Verdict', headerName: 'Calculated Verdict', width: 150},
    {field: 'Manual Override', headerName: 'Manual Override', width: 100, valueGetter: (_, row) => row.ManualOverride || 'None'},
    {field: 'Contend Team', headerName: 'Contend Verdict', width: 150},
    {field: 'Rebuild Team', headerName: 'Rebuild Verdict', width: 150},
];

export default function BuySellHoldDashboard() {
    const [searchParams] = useSearchParams();
    const [week, setWeek] = useState('11');

    useEffect(() => {
        const weekParam = searchParams.get('week') || '11';
        setWeek(weekParam);
    }, [searchParams]);
    const {
        data: apiData,
        error,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['buySellHold', week],
        queryFn: async () => {
            const options = {
                method: 'GET',
                url: `https://domainffapi.azurewebsites.net/api/BuySellHold/${week}`,
            };
            const res = await axios.request(options);
            return res.data as BuySellHoldPlayerList;
        },
        retry: false,
    });
    useTitle('BuySellHold Dashboard');
    return (
        <>
            {apiData && (
                <div>
                    <div>Week: {week}</div>
                    <DataGrid
                        getRowId={(row) => row.Player} 
                        rows={apiData}
                        columns={columns}
                        pageSizeOptions={[20, 50, 100]}
                        // checkboxSelection
                        sx={{border: 0}}
                    />
                </div>
            )}
            {isLoading && <div>loading...</div>}
            {isError && <div>{`Error: ${error}`}</div>}
        </>
    );
}
