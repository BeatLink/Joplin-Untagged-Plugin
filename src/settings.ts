import joplin from "api"
import { SettingItemType } from "api/types"

/** configureSettings *******************************************************************************************************************************
 * Configures all settings for the plugin																											*
 ***************************************************************************************************************************************************/
 export async function configureSettings(){
    await configureSettingsSection()
    await registerSettings()
}

/** configureSettingsSection ************************************************************************************************************************
 * Configures the settings section for the plugin																									*
 ***************************************************************************************************************************************************/
async function configureSettingsSection(){
    await joplin.settings.registerSection("untaggedSettings", {
		label: "Untagged",
		iconName: 'fa fa-tag',
		name: "Untagged"
	})
}

/** registerSettings ********************************************************************************************************************************
 * Registers all settings for the plugin																											*
 ***************************************************************************************************************************************************/
async function registerSettings(){
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