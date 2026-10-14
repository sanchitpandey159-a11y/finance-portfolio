# Sanchit Pande: Finance Portfolio

Static site (HTML, CSS, vanilla JS). No build step. Works on GitHub Pages.

## Folder structure
```
index.html
css/style.css
js/script.js
assets/
  images/professional-photo.jpg          <- ADD your photo (4:5 portrait, under 300 KB)
  documents/
    Resume.pdf                           <- ADD
    NISM_Series_VIII_Certificate.jpg     <- ADD (redact PAN / registration / enrolment numbers first)
    Social_Stock_Exchange_Certificate.jpg <- ADD
    projects/                            <- optional: sanitised project reports
```
File names are case-sensitive on GitHub Pages. Keep them exactly as above, or update the links in `index.html`.

## Deploy to GitHub Pages
1. Create a repository (e.g. `E-Portfolio`) and upload everything in this folder, keeping the structure.
2. Repository **Settings → Pages → Build and deployment → Source: Deploy from a branch**.
3. Choose branch `main` and folder `/ (root)`, then **Save**.
4. After 1–2 minutes the site appears at `https://<username>.github.io/<repository>/`.
5. Open it, then test: every nav link, Resume view/download/preview, certificate view/download, and the photo.

## Updating later
- **Resume:** replace `assets/documents/Resume.pdf` with the new file, same name.
- **New certificate:** copy the `<article class="card cert">` block in the Certifications section, change the text and file name, and add the file to `assets/documents/`.
- **Project:** copy a `<article class="card project">` block. Add a "View Project" link only once the file exists in `assets/documents/projects/`.
- **Colours:** edit the variables at the top of `css/style.css`.

## Fixing common errors
- **Image or PDF not showing:** check the exact name and capitalisation, and that the file is inside `assets/`.
- **Page shows no styling:** confirm `css/style.css` is uploaded and the folder is named `css`.
- **Old version showing:** hard refresh (Ctrl+Shift+R).

## Custom domain (optional)
Settings → Pages → Custom domain; then add a CNAME (or A) record at your registrar as GitHub's instructions show. Enable "Enforce HTTPS".

## Privacy
Anything in a public repository is public. Redact ID numbers on certificates, and remove confidential information and PDF metadata from reports before uploading.
