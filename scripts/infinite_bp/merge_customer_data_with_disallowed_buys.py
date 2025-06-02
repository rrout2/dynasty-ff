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

with open(os.path.join(script_dir, 'domain_customer_info_june_teamids.json'), 'r') as file:
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

with open(os.path.join(script_dir, 'email_to_buys', month, f'{month}_customer_info_disallowed.json'), 'w') as file:
    json.dump(customer_info, file, indent=4)
