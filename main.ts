import { Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
interface Item {
	type: "file" | "search";
	title: string,
	path?: string,
	query?: string,
}
const DEFAULT_SETTINGS: HotkeysForStarredFilesSettings = {
	changeStandardNoteMode: false,
	openInPreview: false,
};

interface HotkeysForStarredFilesSettings {
	changeStandardNoteMode: boolean;
	openInPreview: boolean;
}

export default class HotkeysForStarredFiles extends Plugin {
	settings: HotkeysForStarredFilesSettings;
	async onload() {
		console.log('loading ' + this.manifest.name);
		await this.loadSettings();
		this.addSettingTab(new SettingsTab(this));
		for (let i = 1; i <= 9; i++) {
			this.addCommand({
				id: `open-file-${i}`,
				name: `Open starred file: ${i}`,
				callback: (() => this.open(i - 1, false)),
			});
		}
		for (let i = 1; i <= 9; i++) {
			this.addCommand({
				id: `open-file-in-new-pane-${i}`,
				name: `Open starred file in a new pane: ${i}`,
				callback: (() => this.open(i - 1, true)),
			});
		}
	}
	async open(index: number, inNewPane: boolean) {
		const rawItems = (this.app as any).internalPlugins.plugins.starred.instance.items as Item[];
		let items: Item[] = [];

		for (let item of rawItems) {
			if (items.length == 9) {
				break;
			}
			if (item.type == "file") {
				const exists = await this.app.vault.adapter.exists(item.path);
				if (exists) items.push(item);
			} else {
				items.push(item);
			}
		}

		if (items[index]) {
			if (items[index].type == "file") {
				this.app.workspace.openLinkText(items[index].path, "", inNewPane, { state: { mode: this.settings.changeStandardNoteMode ? this.settings.openInPreview ? "preview" : "source" : undefined } });
			} else if (items[index].type == "search") {
				const searchPlugin = (this.app as any).internalPlugins.plugins["global-search"];
				searchPlugin.instance.openGlobalSearch(items[index].query);
			}
		} else {
			new Notice(`There is nothing starred at index ${index + 1}`);
		}
	}

	async loadSettings() {
		this.settings = Object.assign(DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	onunload() {
		console.log('unloading ' + this.manifest.name);
	}
}

class SettingsTab extends PluginSettingTab {
	plugin: HotkeysForStarredFiles;
	constructor(plugin: HotkeysForStarredFiles) {
		super(plugin.app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let { containerEl } = this;
		containerEl.empty();
		containerEl.createEl("h2", { text: this.plugin.manifest.name });

		new Setting(containerEl)
			.setName("Change standard note mode ('source' or 'preview')")
			.setDesc("Turned off it will use default Obsidian settings.")
			.addToggle(cb => cb.onChange(value => {
				this.plugin.settings.changeStandardNoteMode = value;
				this.plugin.saveSettings();
			}).setValue(this.plugin.settings.changeStandardNoteMode));

		new Setting(containerEl)
			.setName("Open in preview mode")
			.setDesc("This setting only takes affect, if the above setting is turned on")
			.addToggle(cb => cb.onChange(value => {
				this.plugin.settings.openInPreview = value;
				this.plugin.saveSettings();
			}).setValue(this.plugin.settings.openInPreview));
	}
}
