/****************************************************************************************************************************************************
 * Name: Untagged																																	*
 * 																																					*
 * This Plugin is designed to find notes/todos without tags and then tag them with a special "Untagged".											*
 * 																																                    *
 ***************************************************************************************************************************************************/

/** Imports ****************************************************************************************************************************************/
import joplin from 'api';
import { connectNoteChangedCallback } from './events';
import { configureMenu } from './menu';
import { configureSettings } from './settings'
import { updateAllNotes, updateNote } from './untagged';

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

