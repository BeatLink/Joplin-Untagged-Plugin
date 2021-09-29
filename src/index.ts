
/********************************************************************************************************************************
 * Name: Untagged																												*
 * 																																*
 * This Plugin is designed to find notes/todos without tags and then tag them with a special "Untagged".						*
 * 																																*
 *******************************************************************************************************************************/

// Imports ----------------------------------------------------------------------------------------------------------------------
import joplin from 'api';
import { MenuItemLocation, SettingItemType } from 'api/types';

// Plugin Registration ----------------------------------------------------------------------------------------------------------
joplin.plugins.register({onStart: main});

// Main Function ----------------------------------------------------------------------------------------------------------------
async function main(){
	await configureSettings();
	await configureMenu();
	await updateUntagged();
	//await setupEventListener();
	getAllEvents();
}

// Configure Settings -----------------------------------------------------------------------------------------------------------
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


async function configureMenu() {
	await joplin.commands.register({
		name: 'updateUntaggedNotes',
		label: 'Update Untagged Notes',
		iconName: 'fas fa-tag',
		execute: updateUntagged,
	});
	await joplin.views.menuItems.create('updateUntaggedNotesMenu', 'updateUntaggedNotes', MenuItemLocation.Tools);
}

// Update all untagged and tagged notes ----------------------------------------------------------------------------------------------
async function updateUntagged(){
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


async function setupEventListener(){
	//on note changed or created
	// if note has no tags, tag note, else untag note

}

async function getAllEvents(){
    var allEvents = [];
    var cursor = "";
    var morePagesExist = false;
	console.log("here")
	do {
		var response = await joplin.data.get(['events'])//, { fields: ['id', 'item_type', 'item_id', 'type', 'created_time'], cursor:cursor})
        console.log(response)
		//allNotes = allNotes.concat(response.items)
        morePagesExist = response.has_more;
	} while (morePagesExist)
    return allEvents;
}



// Get Number of Tags ------------------------------------------------------------------------------------------------------------
async function getTagCount(noteID){
	return (await joplin.data.get(['notes', noteID, 'tags'])).items.length
}

// Add Tag to Note --------------------------------------------------------------------------------------------------------------
async function tagNote(tagID, noteID){
	await joplin.data.post(['tags', tagID, 'notes'], null, {id: noteID});
}

// Delete Tag From Note ---------------------------------------------------------------------------------------------------------
async function untagNote(tagID, noteID){
	return await joplin.data.delete(['tags', tagID, 'notes', noteID])
}

// Get or Create Untagged Tag ---------------------------------------------------------------------------------------------------
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


// End of Code ------------------------------------------------------------------------------------------------------------------
