import React, {useState, useCallback, ChangeEvent} from 'react';
import styles from './UserIdHydrator.module.css';

// --- Type Definitions ---

/** Defines the core fields expected from a successful Sleeper API user response. */
interface SleeperUser {
    user_id: string;
    // The API returns many other fields, but we only need user_id for this component.
}

/** Represents a single row of CSV data (key-value map). */
interface CsvRow {
    [key: string]: string | number | null;
}

/** Represents the parsed structure of the CSV file. */
interface CsvData {
    headers: string[];
    data: CsvRow[];
}

/** Defines the possible states of the component's operation. */
type Status = 'idle' | 'processing' | 'complete' | 'error';

// --- Configuration ---
const SLEEPER_API_BASE = 'https://api.sleeper.app/v1/user/';
const RETRY_ATTEMPTS = 5;
const DELAY_MS = 100; // Small delay between individual requests to prevent burst rate limits

// --- Utility Functions ---

/**
 * Converts a CSV string into an array of objects.
 * @param csvString The raw CSV content.
 * @returns An object containing headers and an array of rows.
 */
const csvStringToArray = (csvString: string): CsvData => {
    const rows = csvString.trim().split('\n');
    if (rows.length === 0) return {headers: [], data: []};

    // Get headers and remove potential carriage returns and trim whitespace
    const headers = rows[0].split(',').map(h => h.trim().replace(/\r/g, ''));
    const data: CsvRow[] = [];

    for (let i = 1; i < rows.length; i++) {
        // Remove potential carriage return from end of line
        const values = rows[i].replace(/\r/g, '').split(',');

        if (values.length === headers.length) {
            const rowObject: CsvRow = {};
            headers.forEach((header, index) => {
                rowObject[header] = values[index].trim();
            });
            data.push(rowObject);
        }
    }
    return {headers, data};
};

/**
 * Converts an array of objects back into a CSV string.
 * @param data Array of row objects.
 * @param initialHeaders The headers from the original file.
 * @returns The CSV formatted string.
 */
const arrayToCsvString = (data: CsvRow[], initialHeaders: string[]): string => {
    if (data.length === 0) return '';

    // Ensure 'user_id' is in the header list
    const finalHeaders = [...initialHeaders];
    if (!finalHeaders.includes('user_id')) {
        finalHeaders.push('user_id');
    }

    const headerRow = finalHeaders.join(',');
    const dataRows = data.map(row => {
        return finalHeaders
            .map(header => {
                // Ensure value is treated as a string, use empty string if undefined/null
                const value =
                    row[header] !== undefined && row[header] !== null
                        ? String(row[header])
                        : '';
                // Basic logic to quote values containing commas or quotes
                return value.includes(',') ||
                    value.includes('"') ||
                    value.includes('\n')
                    ? `"${value.replace(/"/g, '""')}"`
                    : value;
            })
            .join(',');
    });

    return [headerRow, ...dataRows].join('\n');
};

/**
 * Fetches data with exponential backoff on 429 errors.
 * @param url The API endpoint URL.
 * @returns The parsed JSON response or null on 404.
 */
const fetchWithRetry = async (
    url: string,
    retries: number = RETRY_ATTEMPTS
): Promise<SleeperUser | null> => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url);

            if (response.ok) {
                return (await response.json()) as SleeperUser;
            }

            if (response.status === 429) {
                const delayTime = Math.pow(2, i) * 1000 + Math.random() * 1000; // Exponential backoff + jitter
                console.warn(
                    `Rate limit hit (429). Retrying in ${delayTime / 1000}s...`
                );
                await new Promise(resolve => setTimeout(resolve, delayTime));
                continue; // Retry the loop
            }

            // Handle 404 (User Not Found) gracefully
            if (response.status === 404) {
                return null;
            }

            // Throw on other non-retryable errors
            throw new Error(`API call failed with status ${response.status}`);
        } catch (error) {
            if (i === retries - 1) {
                console.error('Fetch failed after all retries:', error);
                throw error; // Re-throw the error after final attempt
            }
        }
    }
    return null; // Should be unreachable if RETRY_ATTEMPTS > 0
};

/**
 * Utility to wait for a given time
 * @param ms Milliseconds to wait.
 */
const delay = (ms: number): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, ms));

// (All your type definitions and helper functions stay the same above here…)

const UserIdHydrator = () => {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<Status>('idle');
    const [progress, setProgress] = useState<number>(0);
    const [totalRows, setTotalRows] = useState<number>(0);
    const [downloadCsv, setDownloadCsv] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [initialHeaders, setInitialHeaders] = useState<string[]>([]);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = event.target.files ? event.target.files[0] : null;
        setFile(uploadedFile);
        setStatus('idle');
        setErrorMsg(null);
        setDownloadCsv(null);
        setProgress(0);
        setTotalRows(0);
    };

    const processCsv = useCallback(async (csvString: string) => {
        setStatus('processing');
        setErrorMsg(null);

        const usernameField = 'sleeper_username';

        try {
            const {headers, data: originalData} = csvStringToArray(csvString);
            setInitialHeaders(headers);

            if (!headers.includes(usernameField)) {
                throw new Error(
                    `The uploaded CSV is missing the required header: "${usernameField}".`
                );
            }

            setTotalRows(originalData.length);
            const updatedData: CsvRow[] = [];

            for (let i = 0; i < originalData.length; i++) {
                const row = originalData[i];
                const username = row[usernameField];

                if (typeof username === 'string' && username.trim()) {
                    const url = SLEEPER_API_BASE + username.trim();
                    let userData: SleeperUser | null = null;

                    try {
                        userData = await fetchWithRetry(url);
                    } catch (fetchError) {
                        console.error(
                            `Failed to fetch user data for ${username}:`,
                            fetchError
                        );
                        row.user_id = 'FETCH_ERROR';
                    }

                    if (userData && userData.user_id) {
                        row.user_id = userData.user_id;
                    } else {
                        row.user_id = 'NOT_FOUND';
                    }
                } else {
                    row.user_id = 'MISSING_USERNAME';
                }

                updatedData.push(row);
                setProgress(i + 1);

                // Add a small delay between requests to be polite to the API
                await delay(DELAY_MS);
            }

            const finalCsv = arrayToCsvString(updatedData, headers);
            setDownloadCsv(finalCsv);
            setStatus('complete');
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : 'An unknown error occurred.';
            console.error(err);
            setErrorMsg(`Processing Error: ${message}`);
            setStatus('error');
        }
    }, []);

    const handleProcessClick = () => {
        if (!file) {
            setErrorMsg('Please upload a CSV file first.');
            return;
        }

        // Use FileReader to read the file content
        const reader = new FileReader();
        reader.onload = e => {
            const text = e.target?.result as string;
            if (text) {
                processCsv(text);
            } else {
                setErrorMsg('File content was empty or unreadable.');
                setStatus('error');
            }
        };
        reader.onerror = () => {
            setErrorMsg('Could not read file.');
            setStatus('error');
        };
        reader.readAsText(file);
    };

    const handleDownload = () => {
        if (downloadCsv) {
            const blob = new Blob([downloadCsv], {
                type: 'text/csv;charset=utf-8;',
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute(
                'download',
                `sleeper_ids_updated_${Date.now()}.csv`
            );
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    const progressPercentage =
        totalRows > 0 ? Math.round((progress / totalRows) * 100) : 0;

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.card}>
                <h1 className={styles.heading}>Sleeper User ID Hydrator</h1>
                <p className={styles.description}>
                    Upload a CSV file containing a column named
                    <code className={styles.codeTag}>sleeper_username</code>.
                    This tool will fetch the corresponding
                    <code className={styles.codeTag}>user_id</code>
                    from the Sleeper API and add it as a new column.
                </p>

                {/* File upload */}
                <div className={styles.uploadBox}>
                    <label htmlFor="csv-upload" className={styles.uploadLabel}>
                        Upload CSV File
                    </label>
                    <input
                        id="csv-upload"
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        disabled={status === 'processing'}
                        className={styles.uploadInput}
                    />
                    {file && (
                        <p className={styles.fileName}>Selected: {file.name}</p>
                    )}
                </div>

                {/* Process button */}
                <button
                    onClick={handleProcessClick}
                    disabled={
                        !file ||
                        status === 'processing' ||
                        status === 'complete'
                    }
                    className={`${styles.processBtn} ${
                        !file ||
                        status === 'processing' ||
                        status === 'complete'
                            ? styles.processBtnDisabled
                            : styles.processBtnActive
                    }`}
                >
                    {status === 'processing'
                        ? `Processing... (${progress}/${totalRows})`
                        : 'Start API Lookup and Process CSV'}
                </button>

                {/* Progress bar */}
                {(status === 'processing' || totalRows > 0) && (
                    <div className={styles.progressWrapper}>
                        <div className={styles.progressHeader}>
                            <span>Processing Progress</span>
                            <span>{progressPercentage}%</span>
                        </div>
                        <div className={styles.progressBarBackground}>
                            <div
                                className={styles.progressBarFill}
                                style={{width: `${progressPercentage}%`}}
                            ></div>
                        </div>
                    </div>
                )}

                {/* Error */}
                {errorMsg && (
                    <div className={styles.errorBox}>
                        <p className={styles.errorTitle}>Operation Failed:</p>
                        <p>{errorMsg}</p>
                    </div>
                )}

                {/* Download */}
                {status === 'complete' && downloadCsv && (
                    <div className={styles.successBox}>
                        <p className={styles.successTitle}>
                            Processing Complete!
                        </p>
                        <p className={styles.successText}>
                            Successfully processed {totalRows} rows. Your
                            updated CSV is ready.
                        </p>
                        <button
                            onClick={handleDownload}
                            className={styles.downloadBtn}
                        >
                            Download Updated CSV
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserIdHydrator;
