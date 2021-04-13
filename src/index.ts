import joplin from 'api';


async function getAllNotes() {
	let notesObject = await joplin.data.get(['notes'])
	return notesObject.items;
}

async function getAllTags() {
	let tagsObject = await joplin.data.get(['tags'])
	return tagsObject.items;
}

async function getTagsForNote(noteID: string){
	let tagsObject = await joplin.data.get(['notes', noteID, 'tags']);
	return tagsObject.items;
}

async function addTagToNote(tagID: string, noteID: string){
	await joplin.data.post(['tags', tagID, 'notes'], null, {id: noteID});
}

async function createTag(tagID: string, tagName: string){
	await joplin.data.post(['tags'], null, {id:tagID, title: tagName});
}

async function createUntaggedTag(tagID: string, tagName: string) {
	var found = false;
	for (var tag of await getAllTags()){
        if(tag.id == tagID){
            found = true;
            break;
        }	
	}	
    if(!found){
		createTag(tagID, tagName)
    }
}



joplin.plugins.register({
	onStart: async function() {

		console.info('Untagged plugin started!');


		//todo save these to settings
		const tagID = '00000000000000000000000000000000'
		var tagName = 'Untagged2'

		createUntaggedTag(tagID, tagName);
		
		console.info(await getAllNotes())
		console.info(await getAllTags())

		for (var note of await getAllNotes()) {					 	// For each note in all notes
			if ((await getTagsForNote(note.id)).length == 0) {		// 		If note has no tags
				addTagToNote(tagID, note.id);						//		Add untagged tag to note
			}
		}

		console.info(await joplin.data.get(['notes']))

		//for note in notes with untagged tag
			//if note has other tag
				//remove tag from note
			



		//console.info(await joplin.data.get(['tags']));

	},
});
