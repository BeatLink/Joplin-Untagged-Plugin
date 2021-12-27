import joplin from "api";
import { getOrCreateTag, getTags, noteContainsTag, tagNote, untagNote } from "./tags";

/** updateAllNotes **********************************************************************************************************************************
 * Update all untagged and tagged notes. Run on plugin startup or via menu option 																	*
 ***************************************************************************************************************************************************/
export async function updateAllNotes(){
	var allNotes = (await joplin.data.get(['notes'])).items
	for (var note of allNotes) {
		await updateNote(note.id)
	}
    await joplin.views.dialogs.showMessageBox("Untagged - All Notes updated.");
}

/** updateNote **************************************************************************************************************************************
 * Tags the given note if it has no tag. If it has more than one tag, it untags the note															*
 ***************************************************************************************************************************************************/
export async function updateNote(noteID){
    const untaggedTagTitle = await joplin.settings.value("untaggedTagTitle")
	const untaggingEnabled = await joplin.settings.value('untaggedEnableUntagging')
    const untaggedTag = await getOrCreateTag(untaggedTagTitle)
	const noteIsTagged = await noteContainsTag(noteID, untaggedTag.id)
	const tags = await getTags(noteID)
    if ((!noteIsTagged) && (tags.length == 0)){
		await tagNote(untaggedTag.id, noteID)
	} else if (untaggingEnabled && noteIsTagged && tags.length > 1) {
		await untagNote(untaggedTag.id, noteID)
	}
}
