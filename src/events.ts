import joplin from "api"

/** connectNoteChangedCallback **********************************************************************************************************************
 * Setups a polling loop that runs every second and calls the given callback for any changed notes													*
 ***************************************************************************************************************************************************/
export async function connectNoteChangedCallback(callback){
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