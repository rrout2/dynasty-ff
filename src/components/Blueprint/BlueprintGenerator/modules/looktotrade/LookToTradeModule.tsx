import {useRef} from 'react';
import styles from './LookToTradeModule.module.css';
import {usePlayerData} from '../../../../../hooks/hooks';
import ExportButton from '../../shared/ExportButton';

export default function LookToTradeModule() {
    const componentRef = useRef(null);
    const playerData = usePlayerData();

    function graphicComponent() {
        if (!playerData) return <></>;
        return (
            <div className={styles.graphicComponent} ref={componentRef}>
                {title()}
                {tradeSuggestion('KYLE PITTS', 'ELITE TE', '#3CB6E9')}
                {tradeSuggestion('TYJAE SPEARS', 'WR', '#EC336D')}
                {tradeSuggestion('COOPER KUPP', 'YOUNGER ASSET', '#8AC73E')}
            </div>
        );
    }

    function tradeSuggestion(send: string, receive: string, color: string) {
        return (
            <div className={styles.suggestion}>
                <div className={styles.send}>
                    <span className={styles.whiteBullet}>◦</span>
                    {send}
                </div>
                <div
                    className={styles.receive}
                    style={{backgroundColor: color}}
                >
                    {receive}
                </div>
            </div>
        );
    }

    function title() {
        return <div className={styles.title}>LOOK TO TRADE:</div>;
    }

    return (
        <>
            {graphicComponent()}
            {
                <ExportButton
                    className={styles.graphicComponent}
                    pngName={'TODO_looktotrade.png'}
                />
            }
        </>
    );
}
