import * as path from "path";
import * as vscode from "vscode";
import { commandList } from "../commads/common";
import { ClipboardManager, IClipboardItem } from "../manager";

export class ClipHistoryItem extends vscode.TreeItem {
  constructor(readonly clip: IClipboardItem) {
    super(clip.value);

    this.contextValue = "clipHistoryItem:";
    this.label = this.clip.value.replace(/\s+/g, " ").trim();
    this.tooltip = this.clip.value;

    this.command = {
      command: commandList.historyTreeDoubleClick,
      title: "Paste",
      tooltip: "Paste",
      arguments: [this.clip]
    };

    if (this.clip.createdLocation) {
      this.resourceUri = this.clip.createdLocation.uri;
      this.contextValue += "file";
    } else {
      const basePath = path.join(__filename, "..", "..", "..", "resources");

      this.iconPath = {
        light: path.join(basePath, "light", "string.svg"),
        dark: path.join(basePath, "dark", "string.svg")
      };
    }
  }
}

export class ClipboardTreeDataProvider
  implements vscode.TreeDataProvider<ClipHistoryItem>, vscode.Disposable {
  private _disposables: vscode.Disposable[] = [];

  private _onDidChangeTreeData: vscode.EventEmitter<ClipHistoryItem | null> = new vscode.EventEmitter<ClipHistoryItem | null>();
  public readonly onDidChangeTreeData: vscode.Event<ClipHistoryItem | null> = this
    ._onDidChangeTreeData.event;

  constructor(protected _manager: ClipboardManager) {
    this._manager.onDidChangeClipList(() => {
      this._onDidChangeTreeData.fire();
    });
  }

  public getTreeItem(
    element: ClipHistoryItem
  ): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  public getChildren(
    element?: ClipHistoryItem | undefined
  ): vscode.ProviderResult<ClipHistoryItem[]> {
    const clips = this._manager.clips;

    const childs = clips.map(c => new ClipHistoryItem(c));

    return childs;
  }

  public dispose() {
    this._disposables.forEach(d => d.dispose());
  }
}
