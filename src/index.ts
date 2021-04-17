
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

// Global Constants -------------------------------------------------------------------------------------------------------------

const untaggedTagID = "756e7461676765640000000000000000";
const untaggedDefaultTagTitle = ">> untagged <<";

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

	await joplin.settings.registerSetting("untaggedEnableUntagging", {
		label: "Remove Untagged tag from notes if they have another tag",
		value: true,
		type: SettingItemType.Bool,
		public: true,
		section: 'untaggedSettings',
	})
}

// tag Notes Without Tags -------------------------------------------------------------------------------------------------------

async function tagNotesWithoutTags(){
	// Finds notes without tags and tags them with the "Untagged" tag
	var notesWithoutTags = (await joplin.data.get(['search'], {'query': '-tag:*'})).items
	for (var note of notesWithoutTags) {
		var untaggedTag = await getOrCreateTag();
		try {
			await joplin.data.post(['tags', untaggedTag.id, 'notes'], null, {id: note.id});
		} catch(err) {
			console.error(err);
			console.log("Untagged tag not found. Will create on next attempted retrieval")
		}
	}
}

// Untag Notes With Tags --------------------------------------------------------------------------------------------------------
async function untagNotesWithTags(){
	//Checks notes tagged with "Untagged" that have been given another tag and removes the "Untagged" tag

	var enableUntagging = await joplin.settings.value('untaggedEnableUntagging')
	if (enableUntagging){
		var untaggedTag = await getOrCreateTag();
		var taggedNotes = (await joplin.data.get(['tags', untaggedTag.id, 'notes'])).items
		for (var note of taggedNotes){
			var noteTags = (await joplin.data.get(['notes', note.id, 'tags'])).items
			if (noteTags.length > 1){
				await joplin.data.delete(['tags', untaggedTag.id, 'notes', note.id]);
			}
		}		
	}
}


// Get or Create Tag ------------------------------------------------------------------------------------------------------------

async function getOrCreateTag() {
	//Searches for and returns tag with matching name. If not found, a new tag is created
	var allTags = (await joplin.data.get(['tags'])).items
	for (var tag of allTags){
        if(tag.id == untaggedTagID){ 
			return tag;
		}
	}

	// This while loop tries to create a new tag with a random name until a unique name is found, at which point the function returns
	try {
		var newTag = await joplin.data.post(['tags'], null, {id: untaggedTagID, title: untaggedDefaultTagTitle});
		return newTag;
	} catch (err) {
		while (true){
			var randomString = Math.random().toString().substr(2, 5)
			var backuptitle = ">> " + randomString + ' ' + untaggedDefaultTagTitle + ' ' + randomString + " << ";
			try {
				var newTag = await joplin.data.post(['tags'], null, {id: untaggedTagID, title: backuptitle});
				return newTag;
			} catch {
				continue;
			}
		}
	}
}


// End of Code ------------------------------------------------------------------------------------------------------------------
