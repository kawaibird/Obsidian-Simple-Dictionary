import { App, Plugin, SuggestModal, TFile } from 'obsidian';

export class SimpleDictionaryModal extends SuggestModal<string> {
	app: App;
	sorted_files: TFile[];

	getSuggestions(query: string): string[] | Promise<string[]> {
		const files = this.app.vault.getFiles();
		const sorted_files = files.sort((a, b) => {
			const a_is_smaller = a.basename < b.basename;
			return a_is_smaller ? -1 : 1;
		});
		this.sorted_files = sorted_files;
		const folder_names = sorted_files.map(file => { return file.parent?.path; }).unique();

		return folder_names;
	}

	renderSuggestion(value: string, el: HTMLElement) {
		el.createEl("div", { text: value });
	}

	onChooseSuggestion(item: string, evt: MouseEvent | KeyboardEvent) {
		let condition = '';
		if (item != '/') {
			condition = item + '/';
		}

		const targets = this.sorted_files.filter(file => {
			return file.path.startsWith(condition);
		});

		const contents = targets.map(file => { return `[${file.basename}](${file.path})<br>`; })
			.reduce((accumulator, cur_name) => accumulator + cur_name, '');

		let editor = this.app.workspace.activeEditor?.editor;
		editor?.replaceRange(contents, editor?.getCursor());
	}
}

export default class SimpleDictionaryPlugin extends Plugin {
	async onload() {
		// This creates an icon in the left ribbon.
		this.addRibbonIcon('dice', 'Simple Ditionary', (evt: MouseEvent) => {
			let modal = new SimpleDictionaryModal(this.app);
			modal.open();
		});
	}

	onunload() {
	}
}
