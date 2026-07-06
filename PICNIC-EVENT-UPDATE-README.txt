PICNIC EVENT UPDATE

This site has been updated with a removable event system.

Files added/updated:
- assets/js/events-data.js
- assets/js/events-render.js
- assets/images/picnic-rsvp-banner.png
- assets/css/style.css
- index.html
- events.html
- .github/workflows/static.yml

To remove the picnic after the event:
1. Open assets/js/events-data.js
2. Change active: true to active: false
3. Commit/push to GitHub

Survey link currently used:
https://script.google.com/d/1NjdFYJ166ZvJ1lEabJGDtwo7Gdrwv6QSMjfrbufZJseHkFjh9ZjIMyo0/edit?usp=sharing

Note: this looks like a Google Apps Script editor link, not the public Google Form link.
After you create/run the form script, replace buttonLink in assets/js/events-data.js with the Public Form URL from Apps Script logs.

GitHub Pages workflow was replaced with a single upload-pages-artifact workflow to fix the duplicate github-pages artifact error.
