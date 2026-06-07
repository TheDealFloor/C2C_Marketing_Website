# Coast 2 Coast Properties — Marketing Website

Static marketing site (HTML/CSS/JS, no build step) for Coast 2 Coast Properties.

Separate from the TDF tenant portal at `coast2coast.thedealfloor.com`.

## Pages
- `index.html` — Home
- `platform.html` — The Platform
- `buyers.html` — For Buyers
- `brokers.html` — For Brokers
- `bnb.html` — Coast 2 Coast BnB
- `about.html` — About / Team
- `contact.html` — Contact

## Deploy
Push to `main` → GitHub Actions rsyncs the site to InterServer (DirectAdmin) at
`vda8600.is.cc:domains/wh1533543.ispot.cc/public_html/`.

Repo secrets required:
- `DA_USERNAME` — DirectAdmin username
- `DA_SSH_PRIVATE_KEY` — SSH private key authorized on the server
