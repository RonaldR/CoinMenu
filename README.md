# CoinMenu 💰

CoinMenu is a compact cryptocurrency portfolio and watchlist for your macOS, Windows, or Linux menu bar. It also runs in a browser.

## Features

- **Portfolio at a glance**: total value, change over 1 hour, 24 hours, or 7 days, profit and loss against your average buy price, and an allocation bar.
- **Live price in the menu bar** (macOS): show your portfolio value, its 24-hour change, or the price of one coin next to the icon.
- **Price alerts**: native notifications when a coin crosses a price, even while the window is closed.
- **Coin pages**: an interactive chart (24H, 7D, 30D, 1Y) with keyboard support, market stats, your position, and your alerts.
- **Watchlist**: coin logos, sparklines, sortable columns, drag-to-reorder, instant search, and undo after removing a coin.
- **Privacy mode** to hide balances when you share your screen.
- **Light and dark themes** that follow your system, USD and EUR, and keyboard shortcuts for everything (listed in Settings).
- **Your data stays local**: no account and no tracking. Export and import a JSON backup at any time. Watchlists from earlier CoinMenu versions migrate automatically.
- **Tray menu** with Refresh, Settings, Launch at Login, and Quit. Electron runs with a sandboxed renderer, a content security policy, and a small allow-listed preload bridge.

Market data comes from the [CoinPaprika API](https://docs.coinpaprika.com/). Its free tier needs no API key and allows 20,000 requests a month per IP address. CoinMenu stays well within that limit: it refreshes every 5 minutes while open, and every 10 minutes in the background only when the menu bar title or an alert needs fresh prices. Search runs locally against the 2,000 coins already loaded, and chart history is cached.

## Requirements

- Node.js 22.12 or newer (24 recommended; run `nvm use` to pick up the included `.nvmrc`).
- npm 10.8 or newer.

## Develop

```sh
npm install
npm run dev                 # Web app at http://127.0.0.1:5173
npm run electron:dev        # Menu bar app with hot reload
npm test                    # Unit tests (Vitest)
npm run lint                # ESLint
npm run check               # Lint, test, and build in one go
```

## Build

```sh
npm run build               # Build the web app into dist/
npm start                   # Open the built desktop app
npm run dist                # Installer for the current platform
```

Target one platform with `npm run dist:mac`, `npm run dist:win`, or `npm run dist:linux`; build each installer on its own operating system. Use `npm run preview` to preview the production web build.

## Release

Releases are built by GitHub Actions (`.github/workflows/release.yml`). Bump the version and push the tag:

```sh
npm version patch           # or minor / major; updates package.json and creates the tag
git push --follow-tags
```

The workflow lints, tests, and builds, then publishes a GitHub release with macOS `.dmg` files for Apple Silicon (`arm64`) and Intel (`x64`), a Windows installer, and a Linux AppImage. Separate Mac builds keep each one about half the size of a universal app, which would carry Chromium twice. Run the workflow by hand from the Actions tab to build installers without publishing a release.

The installers are not signed with an Apple or Windows certificate. The macOS app has a free ad-hoc signature, so people open it the first time from **System Settings → Privacy & Security → Open Anyway**, and Windows asks them to confirm under **More info → Run anyway**.

The web version deploys to Vercel with the settings in `vercel.json`.

## Project layout

```
electron/        Main process, preload bridge, and tray icons
src/lib/         Framework-free helpers: formatting, portfolio maths, chart geometry, platform bridge
src/services/    CoinPaprika API client
src/stores/      App state: settings, watchlist, alerts, market data, background tasks
src/components/  UI building blocks
src/views/       Home, coin, and settings screens
```

Contributions are welcome.

Created by [Ronald Runia](https://github.com/RonaldR) and designed by [Bob van Aubel](https://github.com/bobvaubel).
