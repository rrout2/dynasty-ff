import json
import os

script_dir = os.path.dirname(os.path.abspath(__file__))

month = 'may2025'

with open(os.path.join(script_dir, 'email_to_buys', month, 'email_to_buys.json'), 'r') as file:
    email_to_buys = json.load(file)

with open(os.path.join(script_dir, 'email_to_buys', month, 'email_to_buys 1.json'), 'r') as file:
    email_to_buys2 = json.load(file)

# with open(os.path.join(script_dir, 'email_to_buys', month, 'email_to_buys 3.json'), 'r') as file:
#     email_to_buys3 = json.load(file)

with open(os.path.join(script_dir, 'email_to_buys', month, 'league_id_to_buys.json'), 'r') as file:
    league_id_to_buys = json.load(file)

with open(os.path.join(script_dir, 'email_to_buys', month, 'league_id_to_buys 1.json'), 'r') as file:
    league_id_to_buys2 = json.load(file)

with open(os.path.join(script_dir, 'customer_info', 'domain_customer_info_june_userids.json'), 'r') as file:
    customer_info = json.load(file)

for customer in customer_info:
    stripped_email = customer['Email'].strip()
    if stripped_email in email_to_buys:
        customer['disallowed'] = email_to_buys[stripped_email].split(',')
    elif stripped_email in email_to_buys2:
        customer['disallowed'] = email_to_buys2[stripped_email].split(',')
    # elif stripped_email in email_to_buys3:
    #     customer['disallowed'] = email_to_buys3[stripped_email].split(',')
    else:
        customer['disallowed'] = None
    league_id = customer['League ID']
    if league_id in league_id_to_buys:
        customer['disallowed'] = league_id_to_buys[league_id].split(',')
    elif league_id in league_id_to_buys2:
        customer['disallowed'] = league_id_to_buys2[league_id].split(',')

with open(os.path.join(script_dir, 'email_to_buys', month, f'{month}_customer_info_disallowed_v2.json'), 'w') as file:
    json.dump(customer_info, file, indent=4)
