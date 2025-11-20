import React, { useState, useCallback, ChangeEvent } from 'react';

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
const SLEEPER_API_BASE: string = 'https://api.sleeper.app/v1/user/';
const RETRY_ATTEMPTS: number = 5;
const DELAY_MS: number = 100; // Small delay between individual requests to prevent burst rate limits

// --- Utility Functions ---

/**
 * Converts a CSV string into an array of objects.
 * @param csvString The raw CSV content.
 * @returns An object containing headers and an array of rows.
 */
const csvStringToArray = (csvString: string): CsvData => {
    const rows = csvString.trim().split('\n');
    if (rows.length === 0) return { headers: [], data: [] };

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
    return { headers, data };
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
    let finalHeaders = [...initialHeaders];
    if (!finalHeaders.includes('user_id')) {
        finalHeaders.push('user_id');
    }

    const headerRow = finalHeaders.join(',');
    const dataRows = data.map(row => {
        return finalHeaders.map(header => {
            // Ensure value is treated as a string, use empty string if undefined/null
            const value = row[header] !== undefined && row[header] !== null ? String(row[header]) : '';
            // Basic logic to quote values containing commas or quotes
            return value.includes(',') || value.includes('"') || value.includes('\n')
                ? `"${value.replace(/"/g, '""')}"`
                : value;
        }).join(',');
    });

    return [headerRow, ...dataRows].join('\n');
};

/**
 * Fetches data with exponential backoff on 429 errors.
 * @param url The API endpoint URL.
 * @returns The parsed JSON response or null on 404.
 */
const fetchWithRetry = async (url: string, retries: number = RETRY_ATTEMPTS): Promise<SleeperUser | null> => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url);

            if (response.ok) {
                return (await response.json()) as SleeperUser;
            }

            if (response.status === 429) {
                const delayTime = Math.pow(2, i) * 1000 + Math.random() * 1000; // Exponential backoff + jitter
                console.warn(`Rate limit hit (429). Retrying in ${delayTime / 1000}s...`);
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
                console.error("Fetch failed after all retries:", error);
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
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));


// --- React Component ---

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
        // Reset state
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
            const { headers, data: originalData } = csvStringToArray(csvString);
            setInitialHeaders(headers);

            if (!headers.includes(usernameField)) {
                throw new Error(`The uploaded CSV is missing the required header: "${usernameField}".`);
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
                        console.error(`Failed to fetch user data for ${username}:`, fetchError);
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
            const message = err instanceof Error ? err.message : 'An unknown error occurred.';
            console.error(err);
            setErrorMsg(`Processing Error: ${message}`);
            setStatus('error');
        }
    }, []);

    const handleProcessClick = () => {
        if (!file) {
            setErrorMsg("Please upload a CSV file first.");
            return;
        }

        // Use FileReader to read the file content
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            if (text) {
                processCsv(text);
            } else {
                setErrorMsg("File content was empty or unreadable.");
                setStatus('error');
            }
        };
        reader.onerror = () => {
            setErrorMsg("Could not read file.");
            setStatus('error');
        };
        reader.readAsText(file);
    };

    const handleDownload = () => {
        if (downloadCsv) {
            const blob = new Blob([downloadCsv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `sleeper_ids_updated_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    const progressPercentage = totalRows > 0 ? Math.round((progress / totalRows) * 100) : 0;

    return (
        <div className="min-h-screen bg-gray-50 flex items-start justify-center p-4 sm:p-10 font-sans">
            <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-6 sm:p-8 space-y-6">
                <h1 className="text-3xl font-extrabold text-indigo-700 border-b pb-2">
                    Sleeper User ID Hydrator
                </h1>
                <p className="text-gray-600">
                    Upload a CSV file containing a column named <code className="font-mono text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded">sleeper_username</code>. This tool will fetch the corresponding <code className="font-mono text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded">user_id</code> from the Sleeper API and add it as a new column.
                </p>

                {/* 1. File Input */}
                <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                    <label htmlFor="csv-upload" className="block text-sm font-medium text-gray-700 mb-2">
                        Upload CSV File
                    </label>
                    <input
                        id="csv-upload"
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-indigo-50 file:text-indigo-700
                            hover:file:bg-indigo-100"
                        disabled={status === 'processing'}
                    />
                    {file && (
                        <p className="mt-2 text-xs text-gray-500">
                            Selected: <span className="font-medium text-gray-700">{file.name}</span>
                        </p>
                    )}
                </div>

                {/* 2. Process Button */}
                <button
                    onClick={handleProcessClick}
                    disabled={!file || status === 'processing' || status === 'complete'}
                    className={`w-full py-3 px-4 rounded-xl text-white font-bold transition duration-150 shadow-md ${
                        !file || status === 'processing' || status === 'complete'
                            ? 'bg-indigo-300 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50'
                    }`}
                >
                    {status === 'processing' ? (
                        <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing... ({progress}/{totalRows})
                        </div>
                    ) : 'Start API Lookup and Process CSV'}
                </button>

                {/* 3. Status and Error */}
                {(status === 'processing' || totalRows > 0) && (
                    <div className="mt-4">
                        <div className="flex justify-between mb-1 text-sm font-medium text-gray-700">
                            <span>Processing Progress</span>
                            <span>{progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                {errorMsg && (
                    <div role="alert" className="p-4 rounded-lg bg-red-100 text-red-700 border border-red-300">
                        <p className="font-semibold">Operation Failed:</p>
                        <p className="text-sm">{errorMsg}</p>
                    </div>
                )}

                {/* 4. Download Result */}
                {status === 'complete' && downloadCsv && (
                    <div className="p-6 rounded-xl bg-green-50 border border-green-300 text-center space-y-4">
                        <p className="text-xl font-bold text-green-700">
                            Processing Complete!
                        </p>
                        <p className="text-green-600">
                            Successfully processed {totalRows} rows. Your updated CSV is ready.
                        </p>
                        <button
                            onClick={handleDownload}
                            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 transition duration-150 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L10 11.586l1.293-1.293a1 1 0 111.414 1.414l-2 2a1 1 0 01-1.414 0l-2-2a1 1 0 010-1.414z" clipRule="evenodd" />
                                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v8a1 1 0 11-2 0V3a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Download Updated CSV
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserIdHydrator;