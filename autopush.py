import os
from datetime import datetime

# Add all files
os.system("git add .")

# Commit with time
msg = "Auto commit " + datetime.now().strftime("%Y-%m-%d %H:%M:%S")
os.system(f'git commit -m "{msg}"')

# Push to GitHub
os.system("git push")

print("Auto push completed!")