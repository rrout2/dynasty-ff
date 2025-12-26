import React from 'react';
import styles from './Premium.module.css';
import {premiumAssets, premiumBkg} from '../../../consts/images';
export default function Premium() {
    return (
        <div className={`exportableClassPremium ${styles.fullBlueprint}`}>
            <img src={premiumAssets} className={styles.assets} />
            <img src={premiumBkg} className={styles.backgroundImg} />
        </div>
    );
}
