# Untagged

## Overview
This Joplin plugin finds notes and todos without a tag and gives them a special tag. This tag defaults to the title " >> untagged <<" but can be renamed to what the user wants (eg. "Untagged", "Uncategorized", "No Tags", "Tag Me", "To Be Tagged", ect)

The plugin will automatically remove the untagged tag if another tag is added to that note or to-do. This option can be disabled in the plugin's settings.

The plugin will automatically recreate the tag if it is accidentally deleted. 

## Download and Installation
The plugin is published on NPM here https://www.npmjs.com/package/joplin-plugin-untagged and is also published to Jolpin's official plugin repository, so you can download it by searching in jolpin's plugin menu for "Untagged"

## Technical Details
The plugin uses a special tag id of "756e7461676765640000000000000000" which is the word "untagged" converted to hexadecimal, with the addition of padded zeros.

### Building The Plugin
For more detailed instructions on building this plugin, refer to [Generator_DOC.md](./Generator_DOC.md) in the source repository.