PARMA 575 VERSION 2.0 CLEAN SITE

Upload-ready static website for GitHub Pages.

Main files:
- index.html
- events.html
- repeater.html
- weather.html
- solar.html
- contact.html
- assets/css/style.css
- assets/js/app.js
- assets/data/site.js
- .github/workflows/static.yml

How to edit the picnic event:
1. Open assets/data/site.js
2. Edit CURRENT_EVENT
3. To hide the event after the picnic, change:
   active: true
   to:
   active: false

Visitor counter:
- The footer uses a free visitor badge:
  https://visitor-badge.laobi.icu/
- Change the page_id inside assets/js/app.js if you want a different counter ID.

RSVP Form:
- The RSVP button and QR code point to:
  https://docs.google.com/forms/d/e/1FAIpQLSeWM8JRkixKm_jnnZDMxGTT9STpJOgLL3j694VfMgpTywkA5A/viewform

Deployment:
1. Upload all files to the root of your GitHub repository.
2. Commit changes.
3. GitHub Actions will deploy using .github/workflows/static.yml.
4. In GitHub repo Settings > Pages, source should be GitHub Actions.
