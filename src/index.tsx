import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import LeaguePage from './components/League/League';
import reportWebVitals from './reportWebVitals';
import {HashRouter, Routes, Route} from 'react-router-dom';
import TeamPage from './components/Team/TeamPage/TeamPage';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import PlayerPage from './components/Player/PlayerPage/PlayerPage';
import PlayerSearch from './components/Player/Search/PlayerSearch';
import NflTeam from './components/NflTeam/NflTeam';
import AllTransactions from './components/Transactions/AllTransactions';
import BlueprintGenerator from './components/Blueprint/v1/BlueprintGenerator';
import NewGenerator from './components/Blueprint/v2/NewGenerator';
import Rankings from './components/Rankings/Rankings';
import Infinite from './components/Blueprint/infinite/Infinite/Infinite';
import FindTeamId from './components/FindTeamId/FindTeamId';
import NonSleeeperInfinite from './components/NonSleeeperInfinite/NonSleeeperInfinite';
import Live from './components/Blueprint/Live/Live';
import RookieDraft from './components/Blueprint/rookieDraft/RookieDraft/RookieDraft';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

const queryClient = new QueryClient();

root.render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <HashRouter basename="/">
                <Routes>
                    <Route path="/" element={<App />} />
                    <Route path="/league" element={<LeaguePage />} />
                    <Route path="/team" element={<TeamPage />} />
                    <Route path="/player" element={<PlayerPage />} />
                    <Route path="/player/search" element={<PlayerSearch />} />
                    <Route path="/nfl" element={<NflTeam />} />
                    <Route path="/transactions" element={<AllTransactions />} />
                    <Route path="/blueprint" element={<BlueprintGenerator />} />
                    <Route
                        path="/blueprint-gen"
                        element={<BlueprintGenerator />}
                    />
                    <Route path="/blueprintv2" element={<NewGenerator />} />
                    <Route path="/rankings" element={<Rankings />} />
                    <Route path="/infinite" element={<Infinite />} />
                    <Route path="/findteamid" element={<FindTeamId />} />
                    <Route
                        path="/nonsleeperinfinite"
                        element={<NonSleeeperInfinite />}
                    />
                    <Route path="live" element={<Live />} />
                    <Route path="/rookie" element={<RookieDraft />} />
                </Routes>
            </HashRouter>
        </QueryClientProvider>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
