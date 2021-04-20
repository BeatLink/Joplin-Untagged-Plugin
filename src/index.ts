
/********************************************************************************************************************************
 * Name: Untagged																												*
 * 																																*
 * This Plugin is designed to find notes/todos without tags and then tag them with a special "Untagged".						*
 * 																																*
 * The table of contents is shown below:																						*
 * 	- Imports																													*
 *  - Plugin Registration																										*
 *  - Main Function																												*
 *  - Log Startup																												*
 * 	- Configure Settings																										*
 *	- Tag Title Changed Handler																									*
 * 	- Tag Notes Without Tags																									*
 * 	- Untag Notes with Tags																										*
 * 	- Get or Create Tag																											*
 * 	- Get Tag																													*																									            *
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

	await joplin.settings.registerSetting("untaggedLastTagTitle", {
		label: "The last tag name before settings change (used to delete old tag names)",
		value: "",
		type: SettingItemType.String,
		public: false,
		section: 'untaggedSettings',
	})

	await joplin.settings.registerSetting("untaggedTagTitle", {
		label: "Notes without tags will be given this tag",
		value: ">> untagged <<",
		type: SettingItemType.String,
		public: true,
		section: 'untaggedSettings',
	})

	await joplin.settings.registerSetting("untaggedEnableUntagging", {
		label: "Remove tag from notes if they have another tag",
		value: true,
		type: SettingItemType.Bool,
		public: true,
		section: 'untaggedSettings',
	})

	await joplin.settings.setValue("untaggedLastTagTitle",  await joplin.settings.value("untaggedTagTitle"));	
	await joplin.settings.onChange(onTagTitleChanged);
}

// Tag Title Changed Handler ----------------------------------------------------------------------------------------------------

async function onTagTitleChanged(event){

	if (event.keys.includes("untaggedTagTitle")){
		const oldTag = await getTag(await joplin.settings.value("untaggedLastTagTitle"))
		if (oldTag) {
			await joplin.data.delete(['tags', oldTag.id])
		}
		await joplin.settings.setValue("untaggedLastTagTitle",  await joplin.settings.value("untaggedTagTitle"));	
	}
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
	const tagTitle = await joplin.settings.value("untaggedTagTitle")
	const existingTag = await getTag(tagTitle)
	return existingTag ? existingTag : await joplin.data.post(['tags'], null, {title: tagTitle.toLowerCase()});
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
