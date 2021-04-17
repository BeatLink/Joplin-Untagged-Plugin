
/********************************************************************************************************************************
 * Name: Untagged																												*
 * 																																*
 * This Plugin is designed to find notes/todos without tags and then tag them with a special "Untagged".						*
 * 																																*
 * The table of contents is shown below:																						*
 * 	- Imports																													*
 *  - Plugin Registration																										*
 *  - Main Function																												*
 * 	- Sub Functions																												*
 *  	- Log Startup																											*
 * 		- Configure Settings																									*
 * 		- Tag Notes Without Tags																								*
 * 		- Untag Notes with Tags																									*
 * 	- Helper Functions																											*
 * 		- On Tag Settings Changed																								*
 * 		- Update Last Tags																										*
 * 		- Get or Create Tag																										*
 * 		- Get Tag																									            *
 *******************************************************************************************************************************/


// Imports ----------------------------------------------------------------------------------------------------------------------

import joplin from 'api';
import { SettingItemType } from 'api/types';

// Plugin Registration ----------------------------------------------------------------------------------------------------------

joplin.plugins.register({
	onStart: async function() {
		await main();
	}
});

// Main Function ----------------------------------------------------------------------------------------------------------------

async function main(){
	await logStartup();
	await configureSettings();
	while(true){
		await tagNotesWithoutTags();
		await untagNotesWithTags();
	}
}

// Log Startup ------------------------------------------------------------------------------------------------------------------

async function logStartup(){
	console.info('Untagged plugin started!');
}

// Configure Settings -----------------------------------------------------------------------------------------------------------

async function configureSettings(){
	//This function initializes all settings related
	await joplin.settings.registerSection("untaggedSettings", {
		label: "Untagged",
		iconName: 'fa fa-tag',
		name: "Untagged"
	})

	await joplin.settings.registerSetting("untaggedTagTitle", {
		label: "Assign untagged notes and to-dos to this tag",
		value: 'Unsorted',
		type: SettingItemType.String,
		public: true,
		section: 'untaggedSettings',
	})

	await joplin.settings.registerSetting("untaggedLastTagTitle", {
		label: "Saves the last tag for deletion purposes",
		value: '',
		type: SettingItemType.String,
		public: false,
		section: 'untaggedSettings',
	})

	await joplin.settings.registerSetting("untaggedEnableUntagging", {
		label: "Remove Untagged tag from notes if they have another tag",
		value: true,
		type: SettingItemType.Bool,
		public: true,
		section: 'untaggedSettings',
	})

	//Connect handler for tag title changes
	await joplin.settings.onChange(onTagSettingChanged)
	await onTagSettingChanged("INIT");
}

// tag Notes Without Tags -------------------------------------------------------------------------------------------------------

async function tagNotesWithoutTags(){
	// Finds notes without tags and tags them with the "Untagged" tag
	var notesWithoutTags = (await joplin.data.get(['search'], {'query': '-tag:*'})).items
	for (var note of notesWithoutTags) {			
		var tagName = await joplin.settings.value('untaggedTagTitle');
		var tag = await getOrCreateTag(tagName);
		try {
			await joplin.data.post(['tags', tag.id, 'notes'], null, {id: note.id});
		} catch(err) {
			console.error(err);
		}
	}
}

// Untag Notes With Tags --------------------------------------------------------------------------------------------------------
async function untagNotesWithTags(){
	//Checks notes tagged with "Untagged" that have been given another tag and removes the "Untagged" tag

	var enableUntagging = await joplin.settings.value('untaggedEnableUntagging')
	if (enableUntagging){
		var tagName = await joplin.settings.value('untaggedTagTitle');
		var tag = await getOrCreateTag(tagName);
		var untaggedNotes = (await joplin.data.get(['search'], {'query': 'tag:' + tagName})).items
		for (var note of untaggedNotes){
			var noteTags = (await joplin.data.get(['notes', note.id, 'tags'])).items
			if (noteTags.length > 1){
				await joplin.data.delete(['tags', tag.id, 'notes', note.id]);
			}
		}		
	}
}

// On Tag Settings Changed ------------------------------------------------------------------------------------------------------

async function onTagSettingChanged(event){
	//This function deletes the last "Untagged" tag if the user has changed the tag to a new one through settings
	if (event == "INIT"){
		await updateLastTag();
	} else if (event.keys.includes("untaggedTagTitle"))  {
		var lastTag = await getTag(await joplin.settings.value('untaggedLastTagTitle'))
		if (lastTag){
			await joplin.data.delete(['tags', lastTag.id])
		}
		await updateLastTag()
	}
}

// Update Last Tag --------------------------------------------------------------------------------------------------------------

async function updateLastTag(){
	//Sets the last tag setting to the current tag title. Used to track the last untagged tag title for cleanup purposes
	var currentTagTitle = await joplin.settings.value('untaggedTagTitle');
	await joplin.settings.setValue('untaggedLastTagTitle', currentTagTitle)
}


// Get or Create Tag ------------------------------------------------------------------------------------------------------------

async function getOrCreateTag(tagName: string) {
	//Searches for and returns tag with matching name. If not found, a new tag is created
	var foundTag = await getTag(tagName);
	return foundTag ? foundTag : await joplin.data.post(['tags'], null, {title: tagName});
}

// Get Tag ----------------------------------------------------------------------------------------------------------------------

async function getTag(tagName: string){
	var allTags = (await joplin.data.get(['tags'])).items
	for (var tag of allTags){
        if(tag.title == tagName.toLowerCase()){ 
			return tag;
		}
	}	
}

// End of Code ------------------------------------------------------------------------------------------------------------------
