# EdgarAllanMusic

Official site for [edgarallanmusic.github.io](https://edgarallanmusic.github.io). Static files at the repository root. No build step.

A raven, a candle, and the old stories set to sound.

## Edit the catalog

Releases and the podcast block are generated from [`data/releases.json`](data/releases.json). The page reads that file in the browser.

To add a release, copy an object inside `"releases"` and edit it:

```json
{
  "id": "new-release",
  "title": "Title as it should appear",
  "format": "ep",
  "year": 2026,
  "work": "Book title, or null",
  "author": "Author or thinker, or null",
  "genre": "Only if you actually know it, otherwise null",
  "summary": "One or two sentences.",
  "spotify": [
    {
      "id": "new-release-spotify",
      "title": "Title on Spotify",
      "url": "https://open.spotify.com/album/xxxxxxxxxxxxxxxxxxxx",
      "role": "primary"
    }
  ]
}
```

`format` is `"ep"` or `"single"`. A second Spotify object with `"role": "edition"` shows as an extra link (a later pressing, for example).

### Spotify links

Use only an `https://open.spotify.com/...` URL you have opened and confirmed. If you do not have one yet, leave the link as a placeholder:

```json
{
  "id": "new-release-spotify",
  "title": "Title",
  "url": null,
  "status": "placeholder",
  "note": "Placeholder. Spotify link not confirmed yet."
}
```

The site prints that note on the card and does not invent a player. Do not guess an album ID.

These releases are still placeholders: **Nat-Pan**, **The route**, **Good&Evil**, **perhaps**.

The player marked “Latest on the stand” is chosen by `"featured"` (`releaseId` plus `spotifyId`). Point those ids at entries that already exist in this file.

Podcast episodes live under `"podcast"`. Set `"releaseId"` to a release `id` when an episode is the making-of for that record; the card will link to it.

## Edit the prose

The tagline, About text, and footer live in [`index.html`](index.html). The missing-page text lives in [`404.html`](404.html). Shared appearance is [`css/styles.css`](css/styles.css).

## Pictures

| File | Use |
| --- | --- |
| `assets/hero-960.jpg`, `assets/hero-1920.jpg` | Home hero |
| `assets/og.jpg` | Link preview (Open Graph / Twitter) |
| `assets/about-band.jpg` | About section |
| `assets/seal-banner.jpg` | 404 page |
| `assets/raven-seal-128.png` | Raven mark in the header and footer |
| `favicon.ico`, `assets/favicon-32.png` | Browser icon, from the raven avatar |

Replace a file with the same name if the art changes. Keep hero and `og.jpg` reasonably small (the current set is about 1.3&nbsp;MB).

## Fonts

Display type is Cormorant Garamond. Body type is Source Serif 4. Both are under the SIL Open Font License. Files are in `assets/fonts/`.

## Visualizer

The public visualizer is [visualizer/](visualizer/). It is the Portada picture: the raven and the candle. Visitors get Play and Fullscreen. There is no palette picker and no recorder.

`visualizer/playlist.json` starts empty, so the page rests on a slow candle. The Play button stays hidden until a track is listed.

To publish a track:

1. Put the file in `visualizer/audio/`. It has to live on this site. The player will not load audio from another domain.
2. Add it to `visualizer/playlist.json`:

```json
[
  { "title": "The face that never sleeps", "src": "audio/the-face-that-never-sleeps.mp3" }
]
```

`src` is a path relative to the `visualizer/` folder. The list plays in order, then repeats. Use mp3 or wav.

## GitHub Pages

This is a user site. GitHub serves it from the default branch `main`, from the repository root, at `https://edgarallanmusic.github.io`.

1. The repository name stays `edgarallanmusic.github.io`.
2. In the repository: **Settings → Pages → Build and deployment → Deploy from a branch**.
3. Branch: **main**. Folder: **/ (root)**.
4. [`.nojekyll`](.nojekyll) is present so Pages will not run Jekyll or ignore files that begin with an underscore.

Pushing to `main` publishes the site. There is nothing to compile.

## Preview locally

From the repository root:

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`. Fetching `data/releases.json` needs a local server; opening `index.html` as a file will not load the catalog.
