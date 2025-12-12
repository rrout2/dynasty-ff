import React from 'react';
import styles from './NewV1.module.css';
import {new1_0Background} from '../../../consts/images';

type NewV1Props = {
    teamName: string;
    numTeams: number;
    isSuperFlex: boolean;
    ppr: number;
    tep: number;
};

export default function NewV1({
    teamName,
    numTeams,
    isSuperFlex,
    ppr,
    tep,
}: NewV1Props) {
    return (
        <div className={styles.fullBlueprint}>
            <div className={styles.teamName}>{teamName}</div>
            <div className={styles.numTeams}>{numTeams}</div>
            <div className={styles.isSuperFlex}>{isSuperFlex ? 'Y' : 'N'}</div>
            <div className={styles.ppr}>{ppr}</div>
            <div className={styles.tep}>{tep}</div>
            <img src={new1_0Background} className={styles.backgroundImg} />
        </div>
    );
}
