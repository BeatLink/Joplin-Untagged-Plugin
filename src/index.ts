
/****************************************************************************************************************************************************
 * Name: Untagged																																	*
 * 																																					*
 * This Plugin is designed to find notes/todos without tags and then tag them with a special "Untagged".											*
 * 																																                    *
 ***************************************************************************************************************************************************/

/** Imports ****************************************************************************************************************************************/
import joplin from 'api';
import { MenuItemLocation, SettingItemType } from 'api/types';

/** Plugin Registration *****************************************************************************************************************************
 * Registers the main function with joplin																											*
 ***************************************************************************************************************************************************/
joplin.plugins.register({onStart: main});

/** main ********************************************************************************************************************************************
 * Initializes all plugin settings 																													*
 ***************************************************************************************************************************************************/
async function main(){
	await configureSettings();
	await configureMenu();
	await updateAllNotes();
	await connectNoteChangedCallback(updateNote)
}

/** configureSettings *******************************************************************************************************************************
 * Configures all settings for the plugin																											*
 ***************************************************************************************************************************************************/
async function configureSettings(){
	await joplin.settings.registerSection("untaggedSettings", {
		label: "Untagged",
		iconName: 'fa fa-tag',
		name: "Untagged"
	})
	await joplin.settings.registerSettings({
		"untaggedTagTitle": {
			label: "Notes without tags will be given this tag",
			value: "Untagged",
			type: SettingItemType.String,
			public: true,
			section: 'untaggedSettings',
		},
		"untaggedEnableUntagging": {
			label: "Remove tag from notes if they have another tag",
			value: true,
			type: SettingItemType.Bool,
			public: true,
			section: 'untaggedSettings',
		}
	})
}

/** configureMenu ***********************************************************************************************************************************
 * Configures the menu for the plugin 																												*
 ***************************************************************************************************************************************************/
async function configureMenu() {
	await joplin.commands.register({
		name: 'updateUntaggedNotes',
		label: 'Update Untagged Notes',
		iconName: 'fas fa-tag',
		execute: updateAllNotes,
	});
	await joplin.views.menuItems.create('updateUntaggedNotesMenu', 'updateUntaggedNotes', MenuItemLocation.Tools);
}

/** updateAllNotes **********************************************************************************************************************************
 * Update all untagged and tagged notes. Run on plugin startup or via menu option 																	*
 ***************************************************************************************************************************************************/
async function updateAllNotes(){
	var taglessNotes = (await joplin.data.get(['search'], {'query': '-tag:*'})).items
	var untaggedTag = await getTag();
	for (var note of taglessNotes) {
		await tagNote(untaggedTag.id, note.id)
	}
	if (await joplin.settings.value('untaggedEnableUntagging')){
		const taggedNotes = (await joplin.data.get(['tags', untaggedTag.id, 'notes'])).items
		for (var note of taggedNotes) {
			if (await getTagCount(note.id) > 1) {
				await untagNote(untaggedTag.id, note.id)
			}
		}		
	}
}

/** connectNoteChangedCallback **********************************************************************************************************************
 * Setups a polling loop that runs every second and calls the given callback for any changed notes													*
 ***************************************************************************************************************************************************/
async function connectNoteChangedCallback(callback){
	var cursor = null
	async function processChanges(){
		do {
			var response = await joplin.data.get(['events'], { fields: ['id', 'item_id', 'type'], cursor: cursor})
			for (var item of response.items) { 
				await callback(item.item_id) 
			}
			cursor = response.cursor
		} while (response.has_more)    
	}
	setInterval(await processChanges, 1000)
}

/** updateNote **************************************************************************************************************************************
 * Tags the given note if it has no tag. If it has more than one tag, it untags the note															*
 ***************************************************************************************************************************************************/
async function updateNote(noteID){
	const untaggedTagID = (await getTag()).id;
	const tagCount = await getTagCount(noteID)
	console.log(noteID)
	console.log(untaggedTagID)
	console.log(tagCount)
	if (tagCount < 1){
		console.log('tagging')
		await tagNote(untaggedTagID, noteID)
	}
	else if (await joplin.settings.value('untaggedEnableUntagging') && tagCount > 1) {
		console.log('untagging')
		await untagNote(untaggedTagID, noteID)
	}
}

/** getTagCount *************************************************************************************************************************************
 * Gets the number of tags for a given note ID 																										*
 ***************************************************************************************************************************************************/
async function getTagCount(noteID){
	return (await joplin.data.get(['notes', noteID, 'tags'])).items.length
}

/** tagNote *****************************************************************************************************************************************
 * Adds the given tag to the given note 																											*
 ***************************************************************************************************************************************************/
async function tagNote(tagID, noteID){
	await joplin.data.post(['tags', tagID, 'notes'], null, {id: noteID});
}

/** untagNote ***************************************************************************************************************************************
 * Removes the given tag from the given note 																										*
 ***************************************************************************************************************************************************/ 
async function untagNote(tagID, noteID){
	return await joplin.data.delete(['tags', tagID, 'notes', noteID])
}

/** getTag ******************************************************************************************************************************************
 * Get or Create Untagged Tag 																														*
 ***************************************************************************************************************************************************/
async function getTag(){
	const tagTitle = await joplin.settings.value("untaggedTagTitle")
	const allTags = (await joplin.data.get(['tags'])).items
	for (var tag of allTags){
        if (tag.title == tagTitle.toLowerCase()) { 
			return tag;
		}
	}
	return await joplin.data.post(['tags'], null, {title: tagTitle.toLowerCase()});
}

/** End of Code ***********************************************************************************************************************************/
