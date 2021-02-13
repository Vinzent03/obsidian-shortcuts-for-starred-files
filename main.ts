import { Notice, Plugin } from 'obsidian';
interface Item {
	type: "file" | "search";
	title: string,
	path?: string,
	query?: string,
}
export default class MyPlugin extends Plugin {
	onload() {
		console.log('loading ' + this.manifest.name);
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
		const rawItems = this.app.internalPlugins.plugins.starred.instance.items as Item[];
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
				this.app.workspace.openLinkText(items[index].path, "", inNewPane);
			} else if (items[index].type == "search") {
				const searchPlugin = this.app.internalPlugins.plugins["global-search"];
				searchPlugin.instance.openGlobalSearch(items[index].query);
			}
		} else {
			new Notice(`There is nothing starred at index ${index + 1}`);
		}
	}
	onunload() {
		console.log('unloading ' + this.manifest.name);
	}
}