# Changelog
All changes made after 05/30/2020 will be documented in this file.

## [07/1/2020]
### Added
 - 1.4.3 branch (based on v1.5 but without the autoscrolling)

### Removed 
 - All auto scrolling code from `textReader.js`
 - All auto scrolling code from `tts.js`
 - auto scrolling swtich from `tts.css` and `textToSpeech.html`

### Changed 
 - changed version number to `1.4.3`

## [06/27/2020]
### Added
 - get state of autoscrolling switch when page loads (fixes bug)
 - timer to prevent the tts from stopping in the middle of the paragraph
 - reset timer and start new timer on play/pause

## [06/24/2020]
### Added
 - manual indexing on words because splitting.js `--word-index` isn't very good

## [06/23/2020]
### Added
 - boilerplate on boundary event to enhance the auto indexing algo

## [06/18/2020]
### Added
 - code to add hyphenated words together to be used in tts (because they are split by hyphen by splitting.js)
 - auto scrolling switch html/css
 - universal function to get values from chrome storage
 - scrolling switch controls the autoscroll(successfully)
 - final styling for the popup

### Changed 
 - individual `get` functions into one function that takes a key (gets that key's value from chrome storage)
 - moved credits to default popup
 - moved on/off switch to default popup

## [06/16/2020]
### Added 
 - Play pause functionality

## [06/14/2020]
### Added
 - JS folder to hold all of the JS files
 - auto indexing when line is read by tts

## [06/11/2020]
### Changed
 - some if statements into switch case statements
 - rate slider values 

## [06/09/2020]
### Added
 - saving voice in popup
 - sending voice to tts instance in text reader 
 - speaking current paragraph on start 
 - pause button that does nothing

## [06/07/2020]
### Added
 - JS to speak when start button is pressed
 - start to saving the voice

## [06/06/2020]
### Added
 - styling for tts popup
 - js to only set default values in background if they are undefined
 - rate saves and updates when changed
 - transitions to hoverstates on tabs and back buttons

### Changed
 - popup.js to colorOptions.js

## [06/04/2020]
### Added
 - start button to tts popup
 - additional ui to tts popup
 - js to populate language list 

## [06/02/2020]
### Added
 - OneLine saves which tab you are on to increase UX
 - basis of txt to speech interface

## [05/31/2020]
### Added
 - check if color btn is set or not before applying the bg color
 - Menu interface so OneLine can hold more settings

### Changed
 - version number to v1.5
 - Organized files into folders

## [05/30/2020]
### Added
 - changelog
 - favorite button functionality
 - redirect on update

## [Before]
Changes before 05/30/2020 are not logged in this changelog, but you can press [before] to see the commit history.

[06/27/2020]: https://github.com/Gbillington1/OneLine-Chrome-Extension/compare/deafca6..HEAD
[06/24/2020]: https://github.com/Gbillington1/OneLine-Chrome-Extension/compare/82966e4..96bcafd
[06/23/2020]: https://github.com/Gbillington1/OneLine-Chrome-Extension/compare/8d528fc..766f948
[06/18/2020]: https://github.com/Gbillington1/OneLine-Chrome-Extension/compare/03b6e61..a560f89
[06/16/2020]: https://github.com/Gbillington1/OneLine-Chrome-Extension/compare/1c1088..f7b4fef
[06/14/2020]: https://github.com/Gbillington1/OneLine-Chrome-Extension/compare/cb42fda..16ffdcc
[06/11/2020]: https://github.com/Gbillington1/OneLine-Chrome-Extension/compare/baa5eaa..dbec2c2
[06/09/2020]: https://github.com/Gbillington1/OneLine-Chrome-Extension/compare/8b09872..6151166
[06/07/2020]: https://github.com/Gbillington1/OneLine-Chrome-Extension/compare/a47577a..12594eb
[06/06/2020]: https://github.com/Gbillington1/OneLine-Chrome-Extension/compare/06bf9b3..5538d9d
[06/04/2020]: https://github.com/Gbillington1/OneLine-Chrome-Extnesion/compare/99a0bed..6ceb18a
[06/02/2020]: https://github.com/Gbillington1/OneLine-Chrome-Extension/compare/de90531..675c448
[05/31/2020]: https://github.com/Gbillington1/OneLine-Chrome-Extension/compare/e8b62f7..8882dbc
[05/30/2020]: https://github.com/Gbillington1/OneLine-Chrome-Extension/compare/4b0b9a7..511107c
[Before]: https://github.com/Gbillington1/OneLine-Chrome-Extension/compare/795bb92..36685ff

