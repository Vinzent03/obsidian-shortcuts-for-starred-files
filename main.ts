import { FileView, Notice, Plugin, PluginSettingTab, Setting } from "obsidian";
interface Item {
    type: "file" | "search";
    title: string;
    path?: string;
    query?: string;
}
const DEFAULT_SETTINGS: HotkeysForBookmarksSettings = {
    changeStandardNoteMode: false,
    openInPreview: false,
};

interface HotkeysForBookmarksSettings {
    changeStandardNoteMode: boolean;
    openInPreview: boolean;
}

export default class HotkeysForBookmarks extends Plugin {
    settings: HotkeysForBookmarksSettings;
    async onload() {
        console.log("loading " + this.manifest.name);
        await this.loadSettings();
        this.addSettingTab(new SettingsTab(this));
        for (let i = 1; i <= 9; i++) {
            this.addCommand({
                id: `open-file-${i}`,
                name: `Open bookmark: ${i}`,
                callback: () => this.open(i - 1, false),
            });
        }
        for (let i = 1; i <= 9; i++) {
            this.addCommand({
                id: `open-file-in-new-pane-${i}`,
                name: `Open bookmark in a new pane: ${i}`,
                callback: () => this.open(i - 1, true),
            });
        }
    }
    async open(index: number, inNewPane: boolean) {
        const bookmarksPlugin = (
            this.app as any
        ).internalPlugins.getEnabledPluginById("bookmarks");
        const rawItems = bookmarksPlugin.items;
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
            await bookmarksPlugin.openBookmark(items[index], inNewPane);
            const view = this.app.workspace.getActiveViewOfType(FileView);
            if (view) {
                const viewState = view.leaf.getViewState();
                viewState.state.mode = this.settings.changeStandardNoteMode
                    ? this.settings.openInPreview
                        ? "preview"
                        : "source"
                    : viewState.state.mode;

                view.leaf.setViewState(viewState);
            }
        } else {
            new Notice(`There is no bookmark at index ${index + 1}`);
        }
    }

    async loadSettings() {
        this.settings = Object.assign(DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    onunload() {
        console.log("unloading " + this.manifest.name);
    }
}

class SettingsTab extends PluginSettingTab {
    plugin: HotkeysForBookmarks;
    constructor(plugin: HotkeysForBookmarks) {
        super(plugin.app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        let { containerEl } = this;
        containerEl.empty();
        containerEl.createEl("h2", { text: this.plugin.manifest.name });

        new Setting(containerEl)
            .setName("Change standard note mode ('Editor' or 'Reading')")
            .setDesc("Turned off it will use default Obsidian settings.")
            .addToggle((cb) =>
                cb
                    .onChange((value) => {
                        this.plugin.settings.changeStandardNoteMode = value;
                        this.plugin.saveSettings();
                    })
                    .setValue(this.plugin.settings.changeStandardNoteMode)
            );

        new Setting(containerEl)
            .setName("Open in Reading mode")
            .setDesc(
                "This setting only takes affect, if the above setting is turned on"
            )
            .addToggle((cb) =>
                cb
                    .onChange((value) => {
                        this.plugin.settings.openInPreview = value;
                        this.plugin.saveSettings();
                    })
                    .setValue(this.plugin.settings.openInPreview)
            );
    }
}
