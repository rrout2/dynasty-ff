from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
import os

class GoogleDriveUploader:
    def __init__(self, credentials_path):
        """
        Initialize the uploader with service account credentials.

        Args:
            credentials_path (str): Path to the service account JSON file
        """
        # Define the scopes
        self.SCOPES = ['https://www.googleapis.com/auth/drive.file']
        self.credentials_path = credentials_path
        self.service = None

    def authenticate(self):
        """Authenticate using service account credentials."""
        try:
            script_dir = os.path.dirname(os.path.abspath(__file__))
            try:
                credentials = service_account.Credentials.from_service_account_file(
                    self.credentials_path,
                    scopes=self.SCOPES
                )
            except FileNotFoundError:
                credentials = service_account.Credentials.from_service_account_file(
                    os.path.join(script_dir, self.credentials_path),
                    scopes=self.SCOPES
                )

            # Build the service
            self.service = build('drive', 'v3', credentials=credentials)
            print("Successfully authenticated with service account\n")

        except Exception as e:
            print(f"Authentication error: {str(e)}")
            raise

    def upload_image(self, image_path, file_name=None, folder_id=None):
        """
        Upload an image to Google Drive.

        Args:
            image_path (str): Path to the image file
            folder_id (str, optional): ID of the folder to upload to
        """
        try:
            # File metadata
            file_metadata = {
                'name': os.path.basename(image_path) if file_name is None else file_name
            }

            # If folder_id is provided, set it as the parent
            if folder_id:
                file_metadata['parents'] = [folder_id]

            # Create media file upload object
            media = MediaFileUpload(
                image_path,
                mimetype='image/*',
                resumable=True
            )

            # Execute the upload
            file = self.service.files().create(
                body=file_metadata,
                media_body=media,
                fields='id, name, webViewLink',
                supportsAllDrives=True
            ).execute()

            print(f"Successfully uploaded {file.get('name')}")
            print(f"Web View Link: {file.get('webViewLink')}")

            return file

        except Exception as e:
            print(f"Upload error: {str(e)}")
            return None
        
    def transfer_ownership(self, file_id, email):
        """
        Transfer ownership of a file to another user.

        Args:
            file_id (str): The ID of the file to transfer
            email (str): The email address of the new owner
        """
        try:
            permission = {
                'type': 'user',
                'role': 'owner',
                'emailAddress': email
            }

            self.service.permissions().create(
                fileId=file_id,
                body=permission,
                transferOwnership=True,
                sendNotificationEmail=False,
                supportsAllDrives=True
            ).execute()

            print(f"Successfully transferred ownership to {email}")

        except Exception as e:
            print(f"Ownership transfer error: {str(e)}")

    def share_file(self, file_id, email):
        """
        Share a file with a specific user.

        Args:
            file_id (str): The ID of the file to share
            email (str): The email address to share with
        """
        try:
            permission = {
                'type': 'user',
                'role': 'reader',
                'emailAddress': email
            }

            self.service.permissions().create(
                fileId=file_id,
                body=permission,
                sendNotificationEmail=False,
                supportsAllDrives=True
            ).execute()

            print(f"Successfully shared file with {email}")

        except Exception as e:
            print(f"share_file error: {str(e)}")

    def make_public(self, file_id):
        """
        Make file accessible to anyone with the link.

        Args:
            file_id (str): The ID of the file to share
        """
        try:
            permission = {
                'type': 'anyone',
                'role': 'reader',
            }

            self.service.permissions().create(
                fileId=file_id,
                body=permission,
                sendNotificationEmail=False,
                supportsAllDrives=True
            ).execute()

            print(f"Successfully made file public")

        except Exception as e:
            print(f"make_public error: {str(e)}")
    
    def create_or_get_folder(self, folder_name):
        """Create or retrieve a folder in Google Drive"""
        # Check if folder already exists
        results = self.service.files().list(
            q=f"name='{folder_name}' and mimeType='application/vnd.google-apps.folder'",
            spaces='drive'
        ).execute()
        
        if results['files']:
            # Folder exists, return its ID
            return results['files'][0]['id']
        
        # Create new folder
        folder_metadata = {
            'name': folder_name,
            'mimeType': 'application/vnd.google-apps.folder'
        }
        folder = self.service.files().create(
            body=folder_metadata,
            fields='id'
        ).execute()
        
        # Set folder to be accessible via link
        self.service.permissions().create(
            fileId=folder['id'],
            body={'type': 'anyone', 'role': 'reader'},
            fields='id'
        ).execute()
        
        return folder['id']

def main():
    # Path to your service account credentials JSON file
    credentials_path = 'service-account-credentials.json'
    script_dir = os.path.dirname(os.path.abspath(__file__))

    # Initialize uploader
    uploader = GoogleDriveUploader(os.path.join(script_dir, credentials_path))

    try:
        # Authenticate
        uploader.authenticate()

        # Folder where your images are stored
        image_folder = "images"

        # Optional: Google Drive folder ID where you want to upload the images
        # folder_id = None  # Replace with your folder ID if needed

        # Check if images folder exists
        if not os.path.exists(image_folder):
            print(f"Creating images folder at: {os.path.abspath(image_folder)}")
            os.makedirs(image_folder)
            print("Please place your images in this folder and run the script again.")
            return

        # Get list of image files
        images = [f for f in os.listdir(image_folder)
                 if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp'))]

        if not images:
            print("No images found in the images folder.")
            print("Supported formats: PNG, JPG, JPEG, GIF, BMP")
            return
        
        folder_id = uploader.create_or_get_folder("Infinite BP test")

        # Upload each image
        print(f"Found {len(images)} images to upload.")
        for filename in images:
            image_path = os.path.join(image_folder, filename)
            print(f"\nUploading {filename}...")
            uploader.upload_image(image_path, folder_id)

    except Exception as e:
        print(f"\nAn error occurred: {str(e)}")
        print("\nPlease make sure you have:")
        print("1. Created a service account and downloaded the credentials")
        print("2. Placed the service account credentials JSON file in the correct location")
        print("3. Enabled the Google Drive API in your project")
        print("4. Placed your images in the 'images' folder")

if __name__ == '__main__':
    main()
