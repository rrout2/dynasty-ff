# Monthly Infinite Steps

1) Set up new B/S/H Data
    1) Download data as CSV from sheets.
    1) Convert CSV to JSON. 
    1) Run `populate_player_ids.py` to add player IDs to B/S/H data.
    1) Update `hooks.ts` to use new JSON file.
1) Set up customer data
    1) Download customer info from sheets.
    1) Download previous run's `email_to_buys.json`/`league_id_to_buys.json` if not already.
    1) Run `merge_customer_data_with_disallowed_buys.py` to combine the above two datasets. 
1) Set up Github Secrets
    1) Run `parse_customer_data.py` to get necessary emails, league IDs, user IDs, etc.
    1) Update https://github.com/rrout2/dynasty-ff/settings/secrets/actions with this output.