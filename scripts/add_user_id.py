#!/usr/bin/env python3

import csv
import requests

def get_user_ids(usernames):
	base_url = "https://api.sleeper.app/v1/user/"
	username_to_id = {}

	for username in usernames:
		try:
			response = requests.get(base_url + username)
			response.raise_for_status()

			if response.text == "null":
				username_to_id[username] = "User not found"
				continue

			data = response.json()
			user_id = data.get("user_id")
			username_to_id[username] = user_id if user_id else "User ID not found"

		except requests.RequestException as e:
			username_to_id[username] = f"Error: {e}"

	return username_to_id

def check_user_in_league(user_id, league_id):
	try:
		url = f"https://api.sleeper.app/v1/league/{league_id}/rosters"
		response = requests.get(url)
		response.raise_for_status()

		if response.text == "null":
			return "Invalid League ID"

		rosters = response.json()

		if not isinstance(rosters, list):
			return "Invalid roster data"

		for roster in rosters:
			if roster.get("owner_id") == user_id:
				return "Yes"
		return "No"

	except requests.RequestException as e:
		return f"Error: {e}"

# === Step 1: Read usernames and league_ids from CSV ===
input_file = "/Users/rishavrout/Downloads/need-new10.csv"
output_file = "/Users/rishavrout/Downloads/need-new10.csv_final.csv"
user_league_pairs = []

print('Step 1: Read usernames and league_ids from CSV...')

with open(input_file, newline='') as csvfile:
	reader = csv.DictReader(csvfile)
	# Optional: Clean up headers to avoid KeyErrors from spaces
	reader.fieldnames = [h.strip() for h in reader.fieldnames]

	for row in reader:
		username = row["sleeper_username"].strip()
		league_id = row["league_id"].strip()
		user_league_pairs.append((username, league_id))

# === Step 2: Get user IDs ===
print('Step 2: Get user IDs...')
unique_usernames = list(set([u for u, _ in user_league_pairs]))
user_ids = get_user_ids(unique_usernames)

# === Step 3: Check if users are in the league ===
print('Step 3: Check if users are in the league...')
results = []
for username, league_id in user_league_pairs:
	user_id = user_ids.get(username, "User not found")
	if "Error" in user_id or "not found" in user_id:
		in_league = "N/A"
	else:
		in_league = check_user_in_league(user_id, league_id)

	results.append({
		"sleeper_username": username,
		"user_id": user_id,
		"league_id": league_id,
		"in_league": in_league
	})

# === Step 4: Write results to new CSV ===
print('Step 4: Write results to new CSV...')
with open(output_file, "w", newline='') as csvfile:
	fieldnames = ["sleeper_username", "user_id", "league_id", "in_league"]
	writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
	writer.writeheader()
	for row in results:
		writer.writerow(row)
