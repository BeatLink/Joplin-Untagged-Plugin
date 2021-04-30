
/********************************************************************************************************************************
 * Name: Untagged																												*
 * 																																*
 * This Plugin is designed to find notes/todos without tags and then tag them with a special "Untagged".						*
 * 																																*
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
		await sleep(1000);
	}
}

// Log Startup ------------------------------------------------------------------------------------------------------------------

async function logStartup(){
	console.info('Untagged plugin started!');
}

// Configure Settings -----------------------------------------------------------------------------------------------------------

async function configureSettings(){
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

// tag Notes Without Tags -------------------------------------------------------------------------------------------------------

async function tagNotesWithoutTags(){
	var notesWithoutTags = await getNotesWithoutAnyTag();	
	for (var note of notesWithoutTags) {
		var untaggedTag = await getOrCreateUntaggedTag();
		await addTagToNote(untaggedTag.id, note.id)
	}
}

// Untag Notes With Tags --------------------------------------------------------------------------------------------------------

async function untagNotesWithTags(){
	var enableUntagging = await joplin.settings.value('untaggedEnableUntagging')
	if (enableUntagging){
		var untaggedTag = await getOrCreateUntaggedTag();
		var taggedNotes = await getNotesWithTag(untaggedTag.id)
		for (var note of taggedNotes){
			var noteTags = await getTagsForNote(note.id)
			if (noteTags.length > 1){
				await deleteTagFromNote(untaggedTag.id, note.id)
			}
		}		
	}
}

// Tag Title Changed Handler ----------------------------------------------------------------------------------------------------

async function onTagTitleChanged(event){
	if (event.keys.includes("untaggedTagTitle")){
		const lastTagTitle = await joplin.settings.value("untaggedLastTagTitle")
		const lastTag = await getTag(lastTagTitle)
		if (lastTag) {
			await deleteTag(lastTag.id)
		}
		const newTagTitle = await joplin.settings.value("untaggedTagTitle")
		await joplin.settings.setValue("untaggedLastTagTitle",  newTagTitle);	
	}
}

// Get or Create Untagged Tag ---------------------------------------------------------------------------------------------------

async function getOrCreateUntaggedTag() {
	const tagTitle = await joplin.settings.value("untaggedTagTitle")
	const existingTag = await getTag(tagTitle)
	return existingTag ? existingTag : await joplin.data.post(['tags'], null, {title: tagTitle.toLowerCase()});
}


// Get All Tags -----------------------------------------------------------------------------------------------------------------

async function getAllTags(){
	const allTagsObject = await joplin.data.get(['tags'])
	return allTagsObject.items
}

// Get Tag ----------------------------------------------------------------------------------------------------------------------

async function getTag(tagName: string){
	const lowerCaseTagName = tagName.toLowerCase();
	const allTags = await getAllTags();
	for (var tag of allTags){
        if(tag.title == lowerCaseTagName){ 
			return tag;
		}
	}
}

// Delete Tag -------------------------------------------------------------------------------------------------------------------

async function deleteTag(tagID){
	return await joplin.data.delete(['tags', tagID])
}

// Get Notes Without Any Tag ----------------------------------------------------------------------------------------------------

async function getNotesWithoutAnyTag(){
	const notesWithoutTagsObject = await joplin.data.get(['search'], {'query': '-tag:*'})
	return notesWithoutTagsObject.items
}

// Get Notes With Tag -----------------------------------------------------------------------------------------------------------

async function getNotesWithTag(tagID){
	const notesWithTagObject = await joplin.data.get(['tags', tagID, 'notes'])
	return notesWithTagObject.items
}

// Get Tags For Note ------------------------------------------------------------------------------------------------------------

async function getTagsForNote(noteID){
	const noteTagsObject = await joplin.data.get(['notes', noteID, 'tags'])
	return noteTagsObject.items
}

// Add Tag to Note --------------------------------------------------------------------------------------------------------------

async function addTagToNote(tagID, noteID){
	await joplin.data.post(['tags', tagID, 'notes'], null, {id: noteID});
}

// Delete Tag From Note ---------------------------------------------------------------------------------------------------------

async function deleteTagFromNote(tagID, noteID){
	return await joplin.data.delete(['tags', tagID, 'notes', noteID])
}

// Sleep ------------------------------------------------------------------------------------------------------------------------

async function sleep(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

// End of Code ------------------------------------------------------------------------------------------------------------------
