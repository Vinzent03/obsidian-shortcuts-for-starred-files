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
				callback: (() => this.open(i - 1)),
			});
		}
	}
	async open(index: number) {
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
				this.app.workspace.openLinkText(items[index].path, "");
			} else if (items[index].type == "search") {
				new Notice(`At index ${index + 1} is a search starred, not a file`);
			}
		} else {
			new Notice(`There is no starred file at index ${index + 1}`);
		}
	}
	onunload() {
		console.log('unloading ' + this.manifest.name);
	}
}