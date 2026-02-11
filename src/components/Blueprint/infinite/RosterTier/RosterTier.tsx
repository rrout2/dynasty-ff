import {useEffect, useState} from 'react';
import {QB, RB, TE, WR} from '../../../../consts/fantasy';
import {usePlayerData, usePlayerValuesJson} from '../../../../hooks/hooks';
import {Roster} from '../../../../sleeper-api/sleeper-api';
import {gradeByPosition} from '../../v1/modules/PositionalGrades/PositionalGrades';
import styles from './RosterTier.module.css';

function getTierColor(tier: RosterTier) {
    switch (tier) {
        case RosterTier.Rebuild:
            return '#ee2924';
        case RosterTier.Reload:
            return '#f15a29';
        case RosterTier.Competitive:
            return '#f1bb1f';
        case RosterTier.Championship:
            return '#8dc63f';
        case RosterTier.Elite:
            return '#009444';
        default:
            return '#000000';
    }
}

export enum RosterTier {
    Unknown = 'UNKNOWN',
    Rebuild = 'REBUILD',
    Reload = 'RELOAD',
    Competitive = 'COMPETITIVE',
    Championship = 'CHAMPIONSHIP',
    Elite = 'ELITE',
}
type RosterTierComponentProps = {
    isSuperFlex: boolean;
    leagueSize: number;
    roster?: Roster;
};

export function useRosterTierAndPosGrades(
    isSuperFlex: boolean,
    leagueSize: number,
    roster?: Roster
) {
    const {getPlayerValue} = usePlayerValuesJson();
    const playerData = usePlayerData();
    const [tier, setTier] = useState<RosterTier>(RosterTier.Unknown);
    const [qbGrade, setQbGrade] = useState(-1);
    const [rbGrade, setRbGrade] = useState(-1);
    const [wrGrade, setWrGrade] = useState(-1);
    const [teGrade, setTeGrade] = useState(-1);

    useEffect(() => {
        if (!playerData || !roster || !leagueSize) return;
        setQbGrade(
            gradeByPosition(
                QB,
                getPlayerValue,
                isSuperFlex,
                leagueSize,
                playerData,
                roster
            )
        );
        setRbGrade(
            gradeByPosition(
                RB,
                getPlayerValue,
                isSuperFlex,
                leagueSize,
                playerData,
                roster
            )
        );
        setWrGrade(
            gradeByPosition(
                WR,
                getPlayerValue,
                isSuperFlex,
                leagueSize,
                playerData,
                roster
            )
        );
        setTeGrade(
            gradeByPosition(
                TE,
                getPlayerValue,
                isSuperFlex,
                leagueSize,
                playerData,
                roster
            )
        );
    }, [
        isSuperFlex,
        leagueSize,
        getPlayerValue,
        playerData,
        roster,
        gradeByPosition,
    ]);

    function calculateRosterTier(): RosterTier {
        const rosterGrade = (qbGrade + teGrade + wrGrade + rbGrade) / 4;
        if (rosterGrade < 4) {
            return RosterTier.Rebuild;
        }
        if (rosterGrade < 5) {
            return RosterTier.Reload;
        }
        if (rosterGrade < 6.5) {
            return RosterTier.Competitive;
        }
        if (rosterGrade < 8.5) {
            return RosterTier.Championship;
        }
        return RosterTier.Elite;
    }

    useEffect(() => {
        if (
            qbGrade === -1 ||
            teGrade === -1 ||
            wrGrade === -1 ||
            rbGrade === -1
        ) {
            return;
        }
        setTier(calculateRosterTier());
    }, [qbGrade, teGrade, wrGrade, rbGrade]);

    return {tier, qbGrade, rbGrade, wrGrade, teGrade};
}

const RosterTierComponent = ({
    isSuperFlex,
    leagueSize,
    roster,
}: RosterTierComponentProps) => {
    const {tier} = useRosterTierAndPosGrades(isSuperFlex, leagueSize, roster);

    return (
        <div className={styles.rosterTier} style={{color: getTierColor(tier)}}>
            {tier}
        </div>
    );
};

export default RosterTierComponent;
