import joplin from "api";

/** getTags *****************************************************************************************************************************************
 * Gets list of tags for a given note ID 																										    *
 ***************************************************************************************************************************************************/
export async function getTags(noteID){
	return (await joplin.data.get(['notes', noteID, 'tags'])).items
}

/** tagNote *****************************************************************************************************************************************
 * Adds the given tag to the given note 																											*
 ***************************************************************************************************************************************************/
export async function tagNote(tagID, noteID){
	await joplin.data.post(['tags', tagID, 'notes'], null, {id: noteID});
}

/** untagNote ***************************************************************************************************************************************
 * Removes the given tag from the given note 																										*
 ***************************************************************************************************************************************************/ 
export async function untagNote(tagID, noteID){
	return await joplin.data.delete(['tags', tagID, 'notes', noteID])
}

/** getOrCreateTag ******************************************************************************************************************************************
 * Get or Create Tag from the given tag title 																														*
 ***************************************************************************************************************************************************/
export async function getOrCreateTag(tagTitle){
	const searchResult = (await joplin.data.get(['search'], {'query': `${tagTitle.toLowerCase()}`, 'type': "tag"})).items
	return searchResult.length > 0 ? searchResult[0] :  await joplin.data.post(['tags'], null, {title: tagTitle.toLowerCase()});
}

