def get_chunk_indices(list_length, chunk_index, number_of_chunks):
    # --- 1. Validation ---
    if number_of_chunks <= 0:
        raise ValueError("number_of_chunks must be a positive integer.")
    if chunk_index <= 0 or chunk_index > number_of_chunks:
        raise ValueError(
            f"chunk_index ({chunk_index}) must be between 1 and number_of_chunks ({number_of_chunks})."
        )
    if list_length == 0:
        return (0, 0)

    # --- 2. Calculate Base Distribution Parameters ---
    # base_size is the minimum size of any chunk (using integer division)
    base_size = list_length // number_of_chunks
    # extra_elements is the number of chunks that will be one element larger
    extra_elements = list_length % number_of_chunks

    # --- 3. Determine Start Index (Inclusive) ---

    # The first 'extra_elements' chunks are size (base_size + 1).
    # Chunks after that are size (base_size).

    # a) Calculate total elements from 'base_size' in all preceding chunks (0-indexed)
    preceding_chunks = chunk_index - 1
    start_index = preceding_chunks * base_size

    # b) Add the 'extra' element for all preceding chunks that were large
    # This is the minimum of (how many chunks came before it) and (how many extra elements there are)
    start_index += min(preceding_chunks, extra_elements)

    # --- 4. Determine End Index (Exclusive) ---

    # Check if the current chunk is one of the larger chunks
    is_large_chunk = chunk_index <= extra_elements
    chunk_size = base_size + (1 if is_large_chunk else 0)

    end_index = start_index + chunk_size

    return (start_index, end_index)

import json

# index ranges to keep (inclusive)
RANGES = [
    (188, 376),
    # (563, 750),
    # (750, 937),
    # (1311, 1498),
]

def index_in_ranges(index, ranges):
    return any(start <= index < end for start, end in ranges)

def filter_json_by_index(input_path, output_path):
    with open(input_path, "r") as f:
        data = json.load(f)

    if not isinstance(data, list):
        raise ValueError("Input JSON must be a list")

    filtered = [
        item
        for i, item in enumerate(data)
        if index_in_ranges(i, RANGES)
    ]

    with open(output_path, "w") as f:
        json.dump(filtered, f, indent=2)

if __name__ == "__main__":
    # print(get_chunk_indices(1498, 2, 8))
    filter_json_by_index("customer_info/domain_customer_info_weekly17_userids.json", "customer_info/domain_customer_info_weekly17_userids_3.json")
