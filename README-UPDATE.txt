Parma 575 website update

This package reorganizes the site for easier future updates.

Changed:
- Added assets/js/components.js for a shared site header and footer.
- All HTML pages now load the shared header/footer from one file.
- Enlarged the site logo in assets/css/style.css.
- Rebuilt assets/js/main.js so weather, clock, countdown, menu, and gallery code run independently.
- Weather uses Open-Meteo with no API key and displays unavailable text instead of loading forever if the request fails.

For future logo changes:
Replace assets/images/site-logo.svg with a new logo using the same filename.

For future navigation/header/footer changes:
Edit assets/js/components.js only.
