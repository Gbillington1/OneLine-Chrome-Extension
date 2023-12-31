# OneLine
Chrome extension that highlights a row of text on the web to help with online reading. Built with JS, jQuery & TailwindCSS

- `src/` contains the bulk of the app, in which you will find the extension files and assets separated into folder by filetype. 
  - `OneLine-Main.js` is the top file, everything extends downwards from that. 
- `dist/` contains the webpack bundle of the entire extension, files from `src/` are bundled together with webpack into this folder. This folder is not committed to the repository, but the `npm run build` command will build the project.
- `latest_build/` contains a .zip file of the most recent version of OneLine that is published on the Chrome store
- `libs_for_later/` are libraries that may be needed later on (or that have been implemented and removed) that aren't contained in `latest_build/` 