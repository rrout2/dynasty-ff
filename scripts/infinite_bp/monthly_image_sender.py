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

class ImageEmailSender:
    def __init__(self, config_path='config.yaml'):
        # Load configuration
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
        else:
            self.team_id_list = config['team_id_list']


        self.smtp_server = config['smtp_server']
        self.smtp_port = int(config['smtp_port'])
        self.sender_email = config['sender_email']
        self.sender_password = config['sender_password']

        self.download_button_selector = '#root > button'


        # Create output directory if it doesn't exist
        self.download_dir = os.path.join(os.getcwd(), 'downloads')
        os.makedirs(self.download_dir, exist_ok=True)

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

    def construct_url(self, idx):
        """
        Construct the URL Certain League URL

        Args:
            idx (int): Index of blueprint
        """
        return f"https://rrout2.github.io/dynasty-ff/#/infinite?leagueId={self.league_id_list[idx]}&teamId={self.team_id_list[idx]}"

    def download_image(self, idx):
        """Navigate to website and click download button"""
        driver = self.setup_driver()
        try:
            # Navigate to the website
            url = self.construct_url(idx)
            print(f"Navigating to {url}")
            driver.get(url)

            # Wait for BP to load
            time.sleep(2)

            # Wait for and click the download button
            button = WebDriverWait(driver, 20).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, self.download_button_selector))
            )
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
            return latest_file

        finally:
            driver.quit()

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

        body = "Here's your unique monthly image:\n\n" + drive_link
        msg.attach(MIMEText(body, 'plain'))

        with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
            server.starttls()
            server.login(self.sender_email, self.sender_password)
            server.send_message(msg)

def main():
    sender = ImageEmailSender()

    # Path to your service account credentials JSON file
    credentials_path = 'service-account-credentials.json'

    # Initialize uploader
    uploader = GoogleDriveUploader(credentials_path)

    try:
        # Authenticate
        uploader.authenticate()

        for i in range(len(sender.email_list)):
            print(f"{i + 1}/{len(sender.email_list)}")
            downloaded_file = sender.download_image(i)

            print(f"Uploading {downloaded_file}...")
            file = uploader.upload_image(downloaded_file)

            if file:
                uploader.make_public(file['id'])

            sender.send_email_link(sender.email_list[i], file.get('webViewLink'))
            print(f"Successfully sent image to {sender.email_list[i]}\n")

            os.remove(downloaded_file)

        print("\nDone!")

    except Exception as e:
        print(f"\nAn error occurred: {str(e)}")
        print("\nPlease make sure you have:")
        print("1. Created a service account and downloaded the credentials")
        print("2. Placed the service account credentials JSON file in the correct location")
        print("3. Enabled the Google Drive API in your project")
        print("4. Placed your images in the 'images' folder")

if __name__ == "__main__":
    main()
