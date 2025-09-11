import json
import os

# Get the directory of the current script
script_dir = os.path.dirname(os.path.abspath(__file__))

# Specify the JSON file name
json_file_name = 'domain_customer_info_weekly2_teamids.json'

last_month = 'july2025'

# Construct the full path to the JSON file
customer_info_file_path = os.path.join(script_dir, 'customer_info', json_file_name)
disallowed_buys_path = os.path.join(script_dir, f'email_to_buys/{last_month}/{last_month}_customer_info_disallowed_userids.json')

league_id_key = "League ID"
team_id_key = "Team ID"
# user_id_key = "Sleeper ID"
# sub_team_id_key = "\r\n\r\nFIND YOUR TEAM ID HERE\r\nTEAM ID FINDER"
email_key = "Email"
# verified_key = 'Column 1\r'
# Open and read the JSON file
try:
    with open(customer_info_file_path, 'r') as file:
        customer_data = json.load(file)
except FileNotFoundError:
    print(f"Error: {json_file_name} not found in the directory {script_dir}")
    exit(1)
except json.JSONDecodeError as e:
    print(f"Error: Failed to decode JSON - {e}")
    exit(1)

# try:
#     with open(disallowed_buys_path, 'r') as file:
#         disallowed_data = json.load(file)
# except FileNotFoundError:
#     print(f"Error: Unabled to find {disallowed_buys_path}")
#     exit(1)
# except json.JSONDecodeError as e:
#     print(f"Error: Failed to decode JSON - {e}")
#     exit(1)



# verified_data = [item for item in data if item[verified_key] == 'Verified\r']
verified_customer_data = customer_data

disallowed_buys = []

for item in verified_customer_data:
    league_id = item[league_id_key]
    # team_id = item[team_id_key]
    # user_id = item[user_id_key]
    # found_disallowed = False
    # for disallowed_item in disallowed_data:
    #     if league_id == disallowed_item["League ID"] and disallowed_item['disallowed']:
    #         disallowed_buys.append('-'.join(disallowed_item['disallowed']))
    #         found_disallowed = True
    #         break
    # if not found_disallowed:
    #     disallowed_buys.append('None')

# print(len(disallowed_buys))
print(len(verified_customer_data))

league_ids = [str(item[league_id_key]) for item in verified_customer_data]
print(f'League IDs: ({len(league_ids)})')
print(','.join(league_ids))

# team_ids = [str(item[team_id_key][sub_team_id_key]) for item in verified_customer_data]
team_ids = [str(item[team_id_key]) for item in verified_customer_data]
print(f'\nTeam IDs: ({len(team_ids)})')
print(','.join(team_ids))

# user_ids = [str(item[user_id_key]) for item in verified_customer_data]
# print(f'\nUser IDs: ({len(user_ids)})')
# print(','.join(user_ids))

emails = [item[email_key].strip() for item in verified_customer_data]
print(f'\nEmails: ({len(emails)})')
print(','.join(emails))
# print(f'\nDisallowed Buys: ({len(disallowed_buys)})')
# print(','.join(disallowed_buys))