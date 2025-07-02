# Monthly Infinite Steps

1) Set up new B/S/H Data
    1) Download data as CSV from sheets.
    1) Convert CSV to JSON. 
    1) Run `populate_player_ids.py` to add player IDs to B/S/H data.
    1) Update `hooks.ts` to use new JSON file.
1) Set up customer data
    1) Download customer info from sheets.
        1) May be two sets: one with league IDs, one with user IDs.
    1) Convert CSV to JSON.
    1) Download previous run's `email_to_buys.json`/`league_id_to_buys.json` if not already.
    1) Run `merge_customer_data_with_disallowed_buys.py` to combine the above two datasets. 
1) Set up Github Secrets
    1) Run `parse_customer_data.py` to get necessary emails, league IDs, user IDs, etc.
    1) Update https://github.com/rrout2/dynasty-ff/settings/secrets/actions with this output.
1) Run GH Actions
    1) [Update the folder_id](https://github.com/rrout2/dynasty-ff/commit/236198534b2ebde6c975d5855d7fd829ff6c55fe#diff-2c3fc01634b6154784561c396dd83950ebad602b2c9218796e5aa9f3824f9d02R255) to upload to, if necessary. 
    1) For dry run, run the `Manual Upload to Drive Folder` action.
    1) For real run, run the `Manual Image Sender` action.
    1) When we hit 500 email limit, note the last successful email, and set the start index (`-si`) flag in the [workflow](https://github.com/rrout2/dynasty-ff/blob/main/.github/workflows/monthly-sender.yaml) for the next run. 
## In Case of Error
1) Download GH artifacts if available.
1) TODO: describe populating skip list