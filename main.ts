import { App, Notice, Plugin, SuggestModal, TAbstractFile, TFile, TFolder } from 'obsidian';
import { buffer } from 'stream/consumers';

function _recur_subdir_read(folder: TFolder, ret: string[]) {
	folder.children.forEach(file => {
		if (file instanceof TFolder) {
			ret.push(file.path);
			_recur_subdir_read(file, ret);
		}
	});
}

function _recur_subfiles_read(folder: TFolder, ret: TFile[]) {
	folder.children.forEach(file => {
		if (file instanceof TFolder) {
			_recur_subfiles_read(file, ret);
		}
		else if (file instanceof TFile) {
			ret.push(file);
		}
	});
}

export class SimpleDictionaryModal extends SuggestModal<string> {
	app: App;

	getSuggestions(query: string): string[] | Promise<string[]> {
		const root_folder = this.app.vault.getRoot();
		let folder_names: string[] = [];
		_recur_subdir_read(root_folder, folder_names);
		folder_names.unique();
		folder_names.push('/');

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

		let files: TFile[] = [];
		const cur_path: TFolder = this.app.vault.getAbstractFileByPath(item);
		_recur_subfiles_read(cur_path, files);
		files.sort((a, b) => {
			let cond = a.basename < b.basename ? -1 : 1;
			return cond;
		});

		files.forEach(file => {
			this.app.workspace.activeEditor?.editor?.replaceSelection(`[${file.basename}: ${file.parent?.name}](${file.path})<br>`);
		});
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
