# ClientoraHQ niche demo sites

One demo website for each of the 41 local-business niches that ClientoraHQ's Local Biz search finds (OpenStreetMap). When we contact a business without a website, we send it a link to the demo for its niche with its own name, city and phone in the link.

Live: https://star-anonymus.github.io/chq-niche-sites/

## Folders: one per intern, named after you

```
chq-niche-sites/
  ahsan-ali/              <- your name, lowercase, words joined by "-"
    gyms-fitness/         <- the niche slug from your task PDF
      index.html
      style.css
      script.js
      config.js
      images/
      CREDITS.md          <- where each photo came from
  areeba-fazzal/
    dentists/
  starter/                <- copy this to begin a new niche
```

- Work **only inside your own folder**. Never change another intern's folder, the home page or `starter/`.
- The home page finds your folders by itself: you do not need to add a link anywhere.

## How to start a niche

1. Copy `starter/` to `<your-name>/<niche-slug>/`.
2. Fill `config.js` with the demo business from your task PDF.
3. Build the sections and the three special features from your task PDF.
4. Test on a 360 px wide phone view and a laptop; run Lighthouse (mobile) and aim for 90+.

## How to send your work

0. The first time: press **Fork** on GitHub to get your own copy, then clone your fork. (If the founder has added you as a collaborator, you can clone this repository directly instead.)
1. Create a branch: `git checkout -b <your-name>/<niche-slug>` (for example `ahsan-ali/gyms-fitness`).
2. Commit only your folder: `git add <your-name>/<niche-slug>` then `git commit -m "gyms-fitness: first version"`.
3. Push and open a **pull request** to `main`. Fill in the checklist in the pull request.
4. The founder reviews it. When it is merged, it is live at
   `https://star-anonymus.github.io/chq-niche-sites/<your-name>/<niche-slug>/`
5. Send that link and your Loom report in the ClientoraHQ Team app.

## Personal in one minute

Every business detail lives in `config.js`. The link can replace the name, city and phone:

```
.../ahsan-ali/gyms-fitness/?name=Al+Noor+Gym&city=Multan&phone=03001234567
```

`starter/script.js` already does this for any element with `data-field="name"`, `data-field="city"` or `data-field="phone"`, and for links with `data-link="whatsapp"` or `data-link="call"`. Keep it working.

## Rules

- Plain HTML, CSS and JavaScript. No website builders.
- Forms need no server: they open WhatsApp (wa.me) with the message written.
- Photos only from Unsplash or Pexels, listed in your folder's `CREDITS.md`. Images under 200 KB.
- No logos or names of real businesses. Reviews are marked "Sample review: replace with a real one".
- No passwords, keys or personal data in the repository.
