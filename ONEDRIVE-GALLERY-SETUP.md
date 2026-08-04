# Parma 575 automatic OneDrive gallery — one-time setup

The website is already built. This setup connects the personal OneDrive account `parma575@outlook.com` to GitHub. Afterward, adding, deleting, or moving pictures in OneDrive automatically updates the website within about 15 minutes.

## Required OneDrive folder

The workflow expects this structure:

```text
Parma575 Website Photos
└── Summer Picnic 2026
    ├── photo1.jpg
    └── photo2.jpg
```

Every folder directly inside **Parma575 Website Photos** becomes an album. Keep the existing **Summer Picnic 2026** folder inside that main folder.

## Part 1 — Create the OneDrive connection on a Windows computer

The authorization step is easiest on Windows and only needs to be done once.

1. Download and install **rclone** from its official website.
2. Open Command Prompt in the folder containing `rclone.exe`.
3. Run:

```bat
rclone config
```

4. Choose `n` for a new remote.
5. Enter this remote name exactly:

```text
parma575
```

6. Select **Microsoft OneDrive**.
7. Leave Client ID and Client Secret blank.
8. Choose the normal/global Microsoft cloud.
9. Choose automatic browser authorization.
10. Sign in as `parma575@outlook.com` and approve access.
11. Select the personal OneDrive drive and save the configuration.
12. Test it:

```bat
rclone lsd "parma575:Parma575 Website Photos"
```

You should see `Summer Picnic 2026`.

## Part 2 — Copy the rclone configuration as a GitHub secret

The configuration file is normally here:

```text
%APPDATA%\rclone\rclone.conf
```

Open PowerShell and run:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("$env:APPDATA\rclone\rclone.conf")) | Set-Clipboard
```

This places the encoded configuration on your clipboard.

In the GitHub repository containing the Parma575 website:

1. Open **Settings**.
2. Select **Secrets and variables → Actions**.
3. Select **New repository secret**.
4. Name it exactly:

```text
RCLONE_CONFIG_B64
```

5. Paste the clipboard contents as the secret value and save.

Never post this secret publicly. It permits access to the connected OneDrive account.

## Part 3 — Run the first synchronization

1. Open the repository's **Actions** tab.
2. Select **Gallery Sync**.
3. Select **Run workflow**.
4. Wait for the workflow to finish successfully.
5. Open `gallery.html` on the published site.

The workflow also runs automatically every 15 minutes. GitHub schedules may occasionally start several minutes late.

## Normal photo management from an iPad

1. Open OneDrive.
2. Open **Parma575 Website Photos**.
3. Open an album folder, such as **Summer Picnic 2026**.
4. Upload or delete pictures.
5. Allow up to about 15–20 minutes for the public website to update.

Create another folder inside **Parma575 Website Photos** to create a new album. Rename a folder to rename its album.

## Authorized users

Share **Parma575 Website Photos** with selected Microsoft accounts and enable editing. Editors can add and delete files, so only give editing permission to trusted members. Website visitors can only see the copies published to the site; they do not receive OneDrive editing access.

## Important privacy note

All synchronized pictures become public files in the website repository and on Parma575.com. Only place photos in **Parma575 Website Photos** when they are approved for public display.
