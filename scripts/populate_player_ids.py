import json
import os

def process_json_files(players_file, ids_file, output_file):
    """
    Read two JSON files and update the first one with player IDs based on name matching.
    
    Args:
        players_file (str): Path to JSON file containing list of player objects with 'name' field
        ids_file (str): Path to JSON file containing ID mappings with first_name and last_name fields
        output_file (str): Path where the updated JSON will be saved
    """
    # Read the JSON files
    script_dir = os.path.dirname(os.path.abspath(__file__))
    try:
        with open(os.path.join(script_dir, players_file), 'r') as f:
            players = json.load(f)
        
        with open(os.path.join(script_dir, ids_file), 'r') as f:
            id_mappings = json.load(f)
    except FileNotFoundError as e:
        print(f"Error: Could not find file - {e}")
        return
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON format - {e}")
        return

    # Create a dictionary to map full names to IDs
    name_to_id = {}
    name_to_age = {}
    for player_id, info in id_mappings.items():
        full_name = f"{info['first_name']} {info['last_name']}".lower()
        if full_name in name_to_id:
            continue
        name_to_id[full_name] = player_id
        if 'age' not in info:
            print(f"Warning: player mapping missing 'age' field: {full_name}")
            continue
        name_to_age[full_name] = info['age']

    # Update player objects with corresponding IDs
    matches_found = 0
    for player in players:
        if 'Player (ADP)' not in player:
            print(f"Warning: Player object missing 'name' field: {player}")
            continue

        player['name'] = player['Player (ADP)']
        player['alt_name'] = player['Player (Domain)']
        player['difference'] = player['Difference']
        player['team'] = player['Team']
        player['position'] = player['Position']
        player['verdict'] = player['REAL VERDICT']
        # player['reason'] = player['Explanation']
        player['domain_rank'] = player['Domain Rank']
        player['pos_adp'] = player['Market ADP ']

        del player['Player (ADP)']
        del player['Player (Domain)']
        del player['Difference']
        del player['Team']
        del player['Position']
        del player['REAL VERDICT']
        # del player['Explanation']
        del player['Domain Rank']
        del player['Market ADP ']
            
        if player['name'].lower() in name_to_id:
            player['player_id'] = name_to_id[player['name'].lower()]
            matches_found += 1
        elif player['alt_name'].lower() in name_to_id:
            player['player_id'] = name_to_id[player['alt_name'].lower()]
            matches_found += 1
        elif player['name'].lower() == 'marquise brown':
            player['player_id'] = name_to_id['hollywood brown']
            matches_found += 1
        elif player['name'].lower() == 'chigoziem okonkwo':
            player['player_id'] = name_to_id['chig okonkwo']
            matches_found += 1
        else:
            print(f"Warning: No ID found for player: {player['name']}")

        if player['name'].lower() in name_to_age:
            player['age'] = name_to_age[player['name'].lower()]
        elif player['alt_name'].lower() in name_to_age:
            player['age'] = name_to_age[player['alt_name'].lower()]
        elif player['name'].lower() == 'marquise brown':
            player['age'] = name_to_age['hollywood brown']
        elif player['name'].lower() == 'chigoziem okonkwo':
            player['player_id'] = name_to_age['chig okonkwo']
            matches_found += 1
        else:
            print(f"Warning: No age found for player: {player['name']}")

    # Save the updated data
    try:
        with open(os.path.join(script_dir, output_file), 'w') as f:
            json.dump(players, f, indent=2)
        print(f"Successfully processed {matches_found} players")
        print(f"Updated data saved to {output_file}")
    except IOError as e:
        print(f"Error: Could not write to output file - {e}")

# Example usage
if __name__ == "__main__":
    process_json_files(
        '../src/data/buyssellsholds_053025_v2.json',  # First JSON file with player objects
        '../src/data/players.json',  # Second JSON file with ID mappings
        '../src/data/buyssellsholds_with_ids_053025_v2.json'  # Output file
    )