# Seaworth theme

Full Site Editing block theme for Seaworth Holding ("The Poetic Oceanic Class"). It works with the
[Refine Lab](https://github.com/hoquangthaiholy/refine-lab-wp-releases) plugin, which turns the HTML templates in
`blocks/` into editable Gutenberg blocks.

Requires WordPress 6.6+ and PHP 8.0+.

## Install

Download `seaworth-<version>.zip` from the [latest release](../../releases/latest) and upload it in
**Appearance → Themes → Add Theme → Upload Theme**.

## Updates

Once installed, the theme checks this repository for new releases (`update.json`) and shows them in
**Dashboard → Updates** and **Appearance → Themes** like any other theme update; automatic updates can be turned on there.
Every package is verified against a SHA-256 checksum before it is installed.

## Releases and deployment (maintainers)

- Pushing a tag `vX.Y.Z` (matching `Version:` in `style.css`) runs the **Release** workflow: it lints the theme, builds
  `seaworth-X.Y.Z.zip`, creates the GitHub release, commits `update.json`, and calls **Deploy**.
- **Deploy** copies the theme to your server over SSH/rsync when the `DEPLOY_*` secrets are set (see the header of
  `.github/workflows/deploy.yml`). Run it by hand from the Actions tab to redeploy or roll back to any tag.
- **Validate** lints PHP and checks `theme.json` and the theme headers on every push and pull request.

## License

GNU General Public License v2 or later.
