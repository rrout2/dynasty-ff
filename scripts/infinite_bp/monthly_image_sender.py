import json
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
from email.mime.text import MIMEText
from datetime import datetime
import yaml
import os
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from uploader import GoogleDriveUploader
import argparse
import uuid
import logging

class ImageEmailSender:
    def __init__(self, send_email=False, config_path='config.yaml'):
        # Example config
        # email_list: user1@example.com,user2@example.com
        # league_id_list: 1180303064879046656,1180303064879046656
        # team_id_list: 4,5
        # smtp_server: smtp.gmail.com
        # smtp_port: 587
        # sender_email: your-email@gmail.com
        # sender_password: your-app-password
        # disallowed_buys: 1-2-3-4,7-4-5-6
        # Load configuration
        script_dir = os.path.dirname(os.path.abspath(__file__))
        try:
            with open(os.path.join(script_dir, config_path), 'r') as file:
                config = yaml.safe_load(file)
        except FileNotFoundError:
            with open(config_path, 'r') as file:
                config = yaml.safe_load(file)

        # Parse email list from string to list if needed
        if isinstance(config['email_list'], str):
            self.email_list = [email.strip() for email in config['email_list'].split(',')]
        else:
            self.email_list = config['email_list']

        if isinstance(config['league_id_list'], str):
            self.league_id_list = [email.strip() for email in config['league_id_list'].split(',')]
        else:
            self.league_id_list = config['league_id_list']

        if isinstance(config['team_id_list'], str):
            self.team_id_list = [email.strip() for email in config['team_id_list'].split(',')]
        elif config['team_id_list'] != None:
            self.team_id_list = config['team_id_list']
        else:
            self.team_id_list = []
        if isinstance(config['user_id_list'], str):
            self.user_id_list = [email.strip() for email in config['user_id_list'].split(',')]
        elif config['user_id_list'] != None:
            self.user_id_list = config['user_id_list']
        else:
            self.user_id_list = []
        
        if isinstance(config['skip_list'], str):
            self.skip_list = set([email.strip() for email in config['skip_list'].split(',')])
        elif config['skip_list'] != None:
            self.skip_list = set(config['skip_list'])
        else:
            self.skip_list = set()
            
        if isinstance(config['disallowed_buys'], str):
            self.disallowed_buys = [email.strip() for email in config['disallowed_buys'].split(',')]
        else:
            self.disallowed_buys = config['disallowed_buys']

        if isinstance(config['manual_url_list'], str):
            self.manual_url_list = [email.strip() for email in config['manual_url_list'].split(',')]
        elif config['manual_url_list'] != None:
            self.manual_url_list = config['manual_url_list']
        else:
            self.manual_url_list = []

        if isinstance(config['manual_email_list'], str):
            self.manual_email_list = [email.strip() for email in config['manual_email_list'].split(',')]
        else:
            self.manual_email_list = config['manual_email_list']

        self.smtp_server = config['smtp_server']
        self.smtp_port = int(config['smtp_port']) if config['smtp_port'] != None else None
        if send_email:
            self.sender_email = config['sender_email']
            self.sender_password = config['sender_password']

        self.download_button_selector = '#root > button'
        self.buy_ids_selector = '#root > span'


        # Create output directory if it doesn't exist
        self.download_dir = os.path.join(os.getcwd(), 'downloads')
        os.makedirs(self.download_dir, exist_ok=True)

        self.email_to_buys = {}
        self.league_id_to_buys = {}
        self.user_id_to_buys = {}

        self.fails = []
        self.fail_indices = []

    def setup_driver(self):
        """Setup Chrome driver with custom download settings"""
        chrome_options = webdriver.ChromeOptions()

        # Run headless in GitHub Actions
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')

        # Set download preferences
        prefs = {
            "download.default_directory": self.download_dir,
            "download.prompt_for_download": False,
            "download.directory_upgrade": True,
            "safebrowsing.enabled": True
        }
        chrome_options.add_experimental_option("prefs", prefs)

        # Initialize the driver
        driver = webdriver.Chrome(options=chrome_options)
        return driver

    def wait_for_download(self, timeout=60):
        """Wait for download to complete"""
        time.sleep(5)
        seconds = 0
        dl_wait = True
        while dl_wait and seconds < timeout:
            time.sleep(1)
            dl_wait = False
            for fname in os.listdir(self.download_dir):
                if fname.endswith('.crdownload'):
                    dl_wait = True
            seconds += 1
        return seconds < timeout

    def construct_url(self, idx, manual=False):
        """
        Construct the URL Certain League URL

        Args:
            idx (int): Index of blueprint
            manual (bool): Whether to use manual URL
        """
        if manual:
            return f"https://rrout2.github.io/dynasty-ff/#/weekly?{self.manual_url_list[idx]}"
        disallowed_buys = str(self.disallowed_buys[idx])
        if disallowed_buys == 'None':
            disallowed_buys = ''
        else:
            disallowed_buys = disallowed_buys.replace('-', ',')
        if len(self.team_id_list) > 0:
            return f"https://rrout2.github.io/dynasty-ff/#/weekly?leagueId={self.league_id_list[idx]}&teamId={self.team_id_list[idx]}&disallowedBuys={disallowed_buys}"
        else:
            return f"https://rrout2.github.io/dynasty-ff/#/weekly?leagueId={self.league_id_list[idx]}&userId={self.user_id_list[idx]}&disallowedBuys={disallowed_buys}"

    def download_image(self, idx, manual=False):
        """Navigate to website and click download button"""
        driver = self.setup_driver()
        try:
            # Navigate to the website
            url = self.construct_url(idx, manual)
            print(f"Navigating to {url}")
            driver.get(url)
            
            time.sleep(2)
            # Wait for button to exist
            WebDriverWait(driver, 30).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, self.download_button_selector))
            )

            # Wait for and click the download button
            button = WebDriverWait(driver, 20).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, self.download_button_selector))
            )
            time.sleep(0.2)
            print("Clicking download button...")
            button.click()

            # Wait for download to complete
            if not self.wait_for_download():
                raise TimeoutException("Download timed out")

            # Get the latest downloaded file
            downloaded_files = os.listdir(self.download_dir)
            if not downloaded_files:
                raise Exception("No files found in download directory")

            latest_file = max([os.path.join(self.download_dir, f) for f in downloaded_files],
                            key=os.path.getctime)
            print(f"Downloaded file: {latest_file}")

            if not manual:
                self.store_buy_ids(driver, idx)
                print(f"Buy IDs: {self.email_to_buys[self.email_list[idx]]}")

            return latest_file
        
        except Exception as e:
            print(f"\nAn error occurred: {str(e)}")
            logging.exception("Exception occurred")
            return None

        finally:
            driver.quit()

    def store_buy_ids(self, driver, idx):
        WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, self.buy_ids_selector))
        )

        buy_ids = driver.find_element(By.CSS_SELECTOR, self.buy_ids_selector).text
        self.email_to_buys[self.email_list[idx]] = buy_ids
        self.league_id_to_buys[self.league_id_list[idx]] = buy_ids
        if len(self.user_id_list) > 0:
            self.user_id_to_buys[self.user_id_list[idx]] = buy_ids

    def send_image_directly(self, recipient_email, image_path):
        """
        Send email with image attachment

        Args:
            recipient_email (str): Email address of the recipient
            image_path (str): Path to the image file
        """
        msg = MIMEMultipart()
        msg['From'] = self.sender_email
        msg['To'] = recipient_email
        msg['Subject'] = f"Your Monthly Blueprint - {datetime.now().strftime('%B %Y')}"

        body = f"Attached is your Infinite Blueprint for {datetime.now().strftime('%B')}. Feel free to ask any questions in the Domain discord. Enjoy!"
        msg.attach(MIMEText(body, 'plain'))

        with open(image_path, 'rb') as img_file:
            img = MIMEImage(img_file.read())
            img.add_header('Content-Disposition', 'attachment', filename=os.path.basename(image_path))
            msg.attach(img)

        with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
            server.starttls()
            server.login(self.sender_email, self.sender_password)
            server.send_message(msg)

    def send_email_link(self, recipient_email, drive_link):
        """
        Send email with drive link

        Args:
            recipient_email (str): Email address of the recipient
            drive_link (str): Google Drive link to the image
        """
        msg = MIMEMultipart()
        msg['From'] = self.sender_email
        msg['To'] = recipient_email
        msg['Subject'] = f"Your Monthly Blueprint - {datetime.now().strftime('%B %Y')}"

        body = f"Attached is your Infinite Blueprint for {datetime.now().strftime('%B')}. Feel free to ask any questions in the Domain discord. Enjoy!\n\n" + drive_link
        msg.attach(MIMEText(body, 'plain'))

        with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
            server.starttls()
            server.login(self.sender_email, self.sender_password)
            server.send_message(msg)

def censor_email(email):
    parts = email.split('@')
    local_part = parts[0]
    local_part = local_part[:2] + '***' + local_part[-2:]
    return f"{local_part}@{parts[1]}"

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('-s', '--send_email', type=int, default=0, help="Whether or not to send emails (0 or 1)")
    parser.add_argument('-si', '--start_index', type=int, default=0, help="Start index for processing images")
    args = parser.parse_args()
    if int(args.send_email) != 1 and int(args.send_email) != 0:
        print("--send_email must be 0 or 1")
        return
    send_email = bool(int(args.send_email))
    print(f"Sending emails: {send_email}")
    sender = ImageEmailSender(send_email)

    start_idx = int(args.start_index)

    # Path to your service account credentials JSON file
    credentials_path = 'service-account-credentials.json'

    # Initialize uploader
    uploader = GoogleDriveUploader(credentials_path)

    try:
        # Authenticate
        uploader.authenticate()
        folder_id = '1GtdM5mE8ccBOaD4kge2c5Zrw_Cch9_Ju' #uploader.create_or_get_folder(args.folder_name)
        print(f"Folder link: https://drive.google.com/drive/folders/{folder_id}")

        print(f"Running manual URL list ({len(sender.manual_url_list)})...")
        for i in range(len(sender.manual_url_list)):
            if sender.manual_url_list[i] == '' or sender.manual_url_list[i] == None:
                continue
            print(f"{i + 1}/{len(sender.manual_url_list)}")
            for attempt in range(2): # This loop provides one retry
                try:
                    downloaded_file_path = sender.download_image(i, manual=True)
                    if not downloaded_file_path:
                        print(f"Failed to download image {i + 1}/{len(sender.manual_url_list)} for {sender.manual_email_list[i]}")
                        continue

                    time.sleep(0.1)
                    print(f"Uploading {downloaded_file_path}...")
                    file = uploader.upload_image(downloaded_file_path, f"{sender.manual_email_list[i]}.png", folder_id)
                    # if file:
                    #     uploader.make_public(file['id'])
                        # uploader.transfer_ownership(file['id'], sender.sender_email)
                    os.remove(downloaded_file_path)
                    break # Exit the retry loop on success

                except smtplib.SMTPDataError as e:
                    print(f"\nAn email error occurred: {str(e)}")
                    logging.exception("SMTPDataError occurred")
                    sender.fails.append(sender.email_list[i])
                    sender.fail_indices.append(i)
                    print("exiting early due to email error")
                    break
                except Exception as e:
                    print(f"\nAn upload/email error occurred: {str(e)}")
                    logging.exception("Exception occurred")
                    if attempt == 1: # Check if this is the final attempt
                        sender.fails.append(sender.manual_email_list[i])
                        sender.fail_indices.append(i)
        


        # print("No folder run, emailing directly")
        for i in range(start_idx, len(sender.league_id_list)):
            if sender.league_id_list[i] == '' or sender.league_id_list[i] == None:
                continue
            has_invalid_team_id = i >= len(sender.team_id_list) or sender.team_id_list[i] == '' or sender.team_id_list[i] == None
            has_invalid_user_id = i >= len(sender.user_id_list) or sender.user_id_list[i] == '' or sender.user_id_list[i] == None
            if has_invalid_team_id and has_invalid_user_id:
                print(f"Skipping {i + 1}/{len(sender.league_id_list)}: No team or user ID")
                continue
            if sender.email_list[i] in sender.skip_list:
                continue
            print(f"{i + 1}/{len(sender.league_id_list)}")

            for attempt in range(2): # This loop provides one retry
                try:
                    downloaded_file_path = sender.download_image(i)
                    if not downloaded_file_path:
                        print(f"Failed to download image {i + 1}/{len(sender.league_id_list)} for {sender.email_list[i]}")
                        sender.fails.append(sender.email_list[i])
                        sender.fail_indices.append(i)
                        print(f"failed indices: {sender.fail_indices}")
                        continue

                    time.sleep(0.1)
                    print(f"Uploading {downloaded_file_path}...")
                    file = uploader.upload_image(downloaded_file_path, f"{sender.email_list[i]}.png", folder_id)
                    if file:
                        uploader.make_public(file['id'])
                        # uploader.transfer_ownership(file['id'], sender.sender_email)
                    # sender.send_image_directly(sender.email_list[i], downloaded_file_path)
                    # print(f"Successfully sent image to {censor_email(sender.email_list[i])}\n")
                    
                    with open("email_to_buys.json", "w") as json_file:
                        json.dump(sender.email_to_buys, json_file, indent=4)
                    with open("league_id_to_buys.json", "w") as json_file:
                        json.dump(sender.league_id_to_buys, json_file, indent=4)
                    with open("user_id_to_buys.json", "w") as json_file:
                        json.dump(sender.user_id_to_buys, json_file, indent=4)
                    os.remove(downloaded_file_path)
                    break # Exit the retry loop on success

                except smtplib.SMTPDataError as e:
                    print(f"\nAn email error occurred: {str(e)}")
                    logging.exception("SMTPDataError occurred")
                    sender.fails.append(sender.email_list[i])
                    sender.fail_indices.append(i)
                    print("exiting early due to email error")
                    break
                except Exception as e:
                    print(f"\nAn upload/email error occurred: {str(e)}")
                    logging.exception("Exception occurred")
                    if attempt == 1: # Check if this is the final attempt
                        sender.fails.append(sender.email_list[i])
                        sender.fail_indices.append(i)
        

        print("\nDone!")
        print(f"Folder link: https://drive.google.com/drive/folders/{folder_id}")

    except Exception as e:
        print(f"\nAn error occurred: {str(e)}")
        logging.exception("Exception occurred")
        print("\nPlease make sure you have:")
        print("1. Created a service account and downloaded the credentials")
        print("2. Placed the service account credentials JSON file in the correct location")
        print("3. Enabled the Google Drive API in your project")
        print("4. Placed your images in the 'images' folder")
    finally:
        if len(sender.fails) > 0:
            print("\nFailed to download the following images:")
            for fail in sender.fails:
                print(fail)

if __name__ == "__main__":
    main()
