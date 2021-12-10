import joplin from "api";
import { getOrCreateTag, getTags, tagNote, untagNote } from "./tags";

/** updateAllNotes **********************************************************************************************************************************
 * Update all untagged and tagged notes. Run on plugin startup or via menu option 																	*
 ***************************************************************************************************************************************************/
export async function updateAllNotes(){
	var allNotes = (await joplin.data.get(['notes'])).items
	for (var note of allNotes) {
		await updateNote(note.id)
	}
}

/** updateNote **************************************************************************************************************************************
 * Tags the given note if it has no tag. If it has more than one tag, it untags the note															*
 ***************************************************************************************************************************************************/
export async function updateNote(noteID){
    var untaggedTagTitle = (await joplin.settings.value("untaggedTagTitle"))
    var untaggedTag = await getOrCreateTag(untaggedTagTitle)
	var tags = await getTags(noteID)
    if (tags.length == 0){
		await tagNote(untaggedTag.id, noteID)
	} else if (await joplin.settings.value('untaggedEnableUntagging') && tags.length > 1) {
		await untagNote(untaggedTag.id, noteID)
	}
}
