import { Notice, Plugin } from 'obsidian';

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
	open(index: number) {
		const items = this.app.internalPlugins.plugins.starred.instance.items;
		if (items[index]) {
			this.app.workspace.openLinkText(items[index].path, "");
		} else {
			new Notice(`There is no starred file at index ${index + 1}`);
		}
	}
	onunload() {
		console.log('unloading ' + this.manifest.name);
	}
}