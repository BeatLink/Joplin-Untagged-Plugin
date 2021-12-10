import joplin from "api";
import { MenuItemLocation } from "api/types";
import { updateAllNotes } from "./untagged";

/** configureMenu ***********************************************************************************************************************************
 * Configures the menu for the plugin 																												*
 ***************************************************************************************************************************************************/
 export async function configureMenu() {
	await joplin.commands.register({
		name: 'updateUntaggedNotes',
		label: 'Update Untagged Notes',
		iconName: 'fas fa-tag',
		execute: updateAllNotes,
	});
	await joplin.views.menus.create(
		'untaggedMenu', 
		"Untagged", 
		[{
			label: "updateUntaggedNotes", 
			commandName: 'updateUntaggedNotes'
		}], 
		MenuItemLocation.Tools
    )
}