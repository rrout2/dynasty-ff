import json
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
last_month = 'july2025'
email_to_buys_path_list = ['email_to_buys.json', 'email_to_buys 2.json', 'email_to_buys 3.json']
league_id_to_buys_path_list = ['league_id_to_buys.json', 'league_id_to_buys 2.json', 'league_id_to_buys 3.json']
user_id_to_buys_path_list = ['user_id_to_buys.json', 'user_id_to_buys 2.json', 'user_id_to_buys 3.json']

all_email_to_buys = {}
for path in email_to_buys_path_list:
    with open(os.path.join(script_dir, 'previous_buys', last_month, path), 'r') as file:
        all_email_to_buys = all_email_to_buys | json.load(file)

# with open(os.path.join(script_dir, 'email_to_buys', month, 'email_to_buys.json'), 'r') as file:
#     email_to_buys = json.load(file)

# with open(os.path.join(script_dir, 'email_to_buys', month, 'email_to_buys 2.json'), 'r') as file:
#     email_to_buys2 = json.load(file)

# with open(os.path.join(script_dir, 'email_to_buys', month, 'email_to_buys 3.json'), 'r') as file:
#     email_to_buys3 = json.load(file)

all_league_id_to_buys = {}
for path in league_id_to_buys_path_list:
    with open(os.path.join(script_dir, 'previous_buys', last_month, path), 'r') as file:
        all_league_id_to_buys = all_league_id_to_buys | json.load(file)

# with open(os.path.join(script_dir, 'email_to_buys', month, 'league_id_to_buys.json'), 'r') as file:
#     league_id_to_buys = json.load(file)

# with open(os.path.join(script_dir, 'email_to_buys', month, 'league_id_to_buys 2.json'), 'r') as file:
#     league_id_to_buys2 = json.load(file)

# with open(os.path.join(script_dir, 'email_to_buys', month, 'league_id_to_buys 3.json'), 'r') as file:
#     league_id_to_buys3 = json.load(file)

all_user_id_to_buys = {}
for path in user_id_to_buys_path_list:
    with open(os.path.join(script_dir, 'previous_buys', last_month, path), 'r') as file:
        all_user_id_to_buys = all_user_id_to_buys | json.load(file)

# with open(os.path.join(script_dir, 'email_to_buys', month, 'user_id_to_buys.json'), 'r') as file:
#     user_id_to_buys = json.load(file)

# with open(os.path.join(script_dir, 'email_to_buys', month, 'user_id_to_buys 2.json'), 'r') as file:
#     user_id_to_buys2 = json.load(file)

# with open(os.path.join(script_dir, 'email_to_buys', month, 'user_id_to_buys 3.json'), 'r') as file:
#     user_id_to_buys3 = json.load(file)

with open(os.path.join(script_dir, 'customer_info', 'domain_customer_info_august_userids.json'), 'r') as file:
    customer_info = json.load(file)

for customer in customer_info:
    stripped_email = customer['Email'].strip()
    if stripped_email in all_email_to_buys:
        customer['disallowed'] = all_email_to_buys[stripped_email].split(',')
    else:
        customer['disallowed'] = None
    if "League ID" in customer:
        league_id = customer['League ID']
        if league_id in all_league_id_to_buys:
            customer['disallowed'] = all_league_id_to_buys[league_id].split(',')
    if "Sleeper ID" in customer:
        user_id = customer['Sleeper ID']
        if user_id in all_user_id_to_buys:
            customer['disallowed'] = all_user_id_to_buys[user_id].split(',')

with open(os.path.join(script_dir, 'previous_buys', last_month, f'{last_month}_customer_info_disallowed_userids.json'), 'w') as file:
    json.dump(customer_info, file, indent=4)
