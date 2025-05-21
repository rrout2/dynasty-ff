import axios from 'axios';

export type League = {
    league_id: string;
    name: string;
    settings: Settings;
    scoring_settings: ScoringSettings;
    roster_positions: string[];
    season: string;
    total_rosters: number;
};

export type Settings = {
    daily_waivers_last_ran: number;
    reserve_allow_cov: number;
    reserve_slots: number;
    leg: number;
    offseason_adds: number;
    bench_lock: number;
    trade_review_days: number;
    league_average_match: number;
    waiver_type: number;
    max_keepers: number;
    type: number;
    pick_trading: number;
    disable_trades: number;
    daily_waivers: number;
    taxi_years: number;
    trade_deadline: number;
    veto_show_votes: number;
    reserve_allow_sus: number;
    reserve_allow_out: number;
    playoff_round_type: number;
    waiver_day_of_week: number;
    taxi_allow_vets: number;
    reserve_allow_dnr: number;
    veto_auto_poll: number;
    commissioner_direct_invite: number;
    reserve_allow_doubtful: number;
    waiver_clear_days: number;
    playoff_week_start: number;
    daily_waivers_days: number;
    taxi_slots: number;
    playoff_type: number;
    daily_waivers_hour: number;
    num_teams: number;
    veto_votes_needed: number;
    playoff_teams: number;
    playoff_seed_type: number;
    start_week: number;
    reserve_allow_na: number;
    draft_rounds: number;
    taxi_deadline: number;
    waiver_bid_min: number;
    capacity_override: number;
    disable_adds: number;
    waiver_budget: number;
    best_ball: number;
};

export type ScoringSettings = {
    st_ff: number;
    pts_allow_7_13: number;
    def_st_ff: number;
    rec_yd: number;
    fum_rec_td: number;
    pts_allow_35p: number;
    pts_allow_28_34: number;
    fum: number;
    rush_yd: number;
    pass_td: number;
    blk_kick: number;
    pass_yd: number;
    safe: number;
    def_td: number;
    fgm_50p: number;
    pass_cmp_40p: number;
    def_st_td: number;
    fum_rec: number;
    rush_2pt: number;
    xpm: number;
    pts_allow_21_27: number;
    fgm_20_29: number;
    pts_allow_1_6: number;
    fum_lost: number;
    def_st_fum_rec: number;
    int: number;
    fgm_0_19: number;
    pts_allow_14_20: number;
    rec: number;
    ff: number;
    fgmiss: number;
    st_fum_rec: number;
    rec_2pt: number;
    rush_td: number;
    xpmiss: number;
    fgm_30_39: number;
    rec_td: number;
    st_td: number;
    pass_2pt: number;
    pts_allow_0: number;
    pass_int: number;
    bonus_rec_te: number;
    bonus_rec_wr: number;
    bonus_rec_rb: number;
    fgm_40_49: number;
    sack: number;
};

export type Roster = {
    starters: string[];
    roster_id: string;
    players: string[];
    owner_id: string;
    settings: {
        wins: number;
        ties: number;
        losses: number;
        fpts: number;

        waiver_position: number;
        waiver_budget_used: number;
    };
};

export interface DraftOrder {
    [userId: string]: number;
}

export type Draft = {
    type: string;
    status: string;
    settings: {
        teams: number;
        slots_wr: number;
        slots_te: number;
        slots_rb: number;
        slots_qb: number;
        slots_k: number;
        slots_flex: number;
        slots_def: number;
        slots_bn: number;
        rounds: number;
        pick_timer: number;
    };
    season_type: string;
    season: string;
    metadata: {
        scoring_type: string;
        name: string;
        description: string;
    };
    league_id: string;
    draft_id: string;
    created: number;
    draft_order: DraftOrder;
};

export type Pick = {
    player_id: string;
    picked_by: string;
    roster_id: string;
    round: number;
    draft_slot: number;
    pick_no: number;
    metadata: {
        team: string;
        status: string;
        sport: string;
        position: string;
        player_id: string;
        number: string;
        news_updated: string;
        last_name: string;
        injury_status: string;
        first_name: string;
    };
    draft_id: string;
};

export type User = {
    username: string;
    user_id: string;
    display_name: string;
    avatar: string;
    metadata: {
        team_name?: string;
    };
};

export function getTeamName(user?: User) {
    return `${user?.metadata?.team_name || user?.display_name}`;
}

export type Player = {
    hashtag: string;
    depth_chart_position: number;
    status: string;
    sport: string;
    fantasy_positions: string[];
    number: number;
    search_last_name: string;
    injury_start_date: null | Date;
    weight: string;
    position: string;
    practice_participation: null | string;
    sportradar_id: string;
    team: string;
    last_name: string;
    college: string;
    fantasy_data_id: number;
    injury_status: null | string;
    player_id: string;
    height: string;
    search_full_name: string;
    age: number;
    stats_id: string;
    birth_country: string;
    espn_id: null | string;
    search_rank: number;
    first_name: string;
    depth_chart_order: number;
    years_exp: number;
    rotowire_id: null | string;
    rotoworld_id: number;
    search_first_name: string;
    yahoo_id: null | string;
};

export type TradedPick = {
    previous_owner_id: number;
    owner_id: number;
    roster_id: number;
    league_id: null | string;
    season: string;
    round: number;
};

export type Transaction = {
    waiver_budget: {sender: number; receiver: number; amount: number}[];
    status_updated: number;
    roster_ids: number[];
    consenter_ids: number[];
    drops: {[playerId: string]: number};
    adds: {[playerId: string]: number};
    transaction_id: string;
    creator: string;
    draft_picks: TradedPick[];
    leg: number;
    settings: {waiver_bid: number};
    created: number;
    metadata: {
        veto_msg_id: string;
        poll_id: string;
    };
    type: string;
    status: string;
};

const BASE_API_URL = 'https://api.sleeper.app/v1';

export async function getLeague(leagueId: string): Promise<League> {
    const response = await axios.get(`${BASE_API_URL}/league/${leagueId}`);
    return response.data;
}

export async function getRosters(leagueId: string): Promise<Roster[]> {
    const response = await axios.get(
        `${BASE_API_URL}/league/${leagueId}/rosters`
    );
    return response.data;
}

export async function getAllUsers(leagueId: string): Promise<User[]> {
    const response = await axios.get(
        `${BASE_API_URL}/league/${leagueId}/users`
    );
    return response.data;
}

export async function getUser(userId: string): Promise<User> {
    const response = await axios.get(`${BASE_API_URL}/user/${userId}`);
    return response.data;
}

export async function getDrafts(leagueId: string): Promise<Draft[]> {
    const response = await axios.get(
        `${BASE_API_URL}/league/${leagueId}/drafts`
    );
    return response.data;
}

export async function getDraft(draftId: string): Promise<Draft[]> {
    const response = await axios.get(`${BASE_API_URL}/draft/${draftId}`);
    return response.data;
}

export async function getAllPicksFromDraft(draftId: string): Promise<Pick[]> {
    const response = await axios.get(`${BASE_API_URL}/league/${draftId}/picks`);
    return response.data;
}

export async function getTradedPicksFromLeague(
    leagueId: string
): Promise<TradedPick[]> {
    const response = await axios.get(
        `${BASE_API_URL}/league/${leagueId}/traded_picks`
    );
    return response.data;
}

export async function getTradedPicksFromDraft(
    draftId: string
): Promise<Pick[]> {
    const response = await axios.get(
        `${BASE_API_URL}/league/${draftId}/traded_picks`
    );
    return response.data;
}

export async function getTransacations(
    leagueId: string,
    round = 1
): Promise<Transaction[]> {
    const response = await axios.get(
        `${BASE_API_URL}/league/${leagueId}/transactions/${round}`
    );
    return response.data;
}
