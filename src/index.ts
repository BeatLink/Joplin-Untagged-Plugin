import joplin from 'api';

async function createUntaggedTag(tagID: string, tagName: string) {

	var found = false;
	let tagsObject = await joplin.data.get(['tags'])
	for (var tag of tagsObject.items){
        if(tag.id == tagID){
            found = true;
            break;
        }	
	}	
    if(!found){
		await joplin.data.post(['tags'], null, {id:tagID, title: tagName})
    }
}



joplin.plugins.register({
	onStart: async function() {
		console.info('Test plugin started!');


		//todo save these to settings
		const tagID = '00000000000000000000000000000000'
		var tagName = 'Untagged2'

		createUntaggedTag(tagID, tagName);
		
		console.info(await joplin.data.get(['notes']))
		console.info(await joplin.data.get(['tags']))

		//get all notes
		let notesObject = await joplin.data.get(['notes']) 
		for (var note of notesObject.items) {										//for note in note
			let tagsObject = await joplin.data.get(['notes', note.id, 'tags']);
			if (tagsObject.items.length == 0) {
				await joplin.data.post(['tags', tagID, 'notes'], null, {id: note.id});
			}
			
		}

		console.info(await joplin.data.get(['notes']))
		console.info(await joplin.data.get(['tags']))

		//for note in notes with untagged tag
			//if note has other tag
				//remove tag from note
			



		//console.info(await joplin.data.get(['tags']));

	},
});
