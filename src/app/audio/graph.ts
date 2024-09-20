import { produce, setAutoFreeze } from "immer";
import { Node } from "./webAudioNodes";

export interface BaseNode {
  children?: BaseNode[];
  type: string;
  key?: string;
  parent?: BaseNode;
  auxConnections?: string[];
  backingNode?: any;
  props?: any;
}

export interface AudioGraphDelegate {
  createNode: (
    type: string,
    findNode: (key: string) => Node | null,
    key?: string,
  ) => any;
  deleteNode: (node: Node) => void;
  updateNode: (node: Node) => void;
  connectNodes: (src: Node, dest: Node) => void;
  start: (step?: number) => void;
  stop: () => void;
  isPlaying: () => boolean;
  initialize: () => Promise<void>;
}

type NodeProps<T extends BaseNode["type"]> = Extract<
  Node,
  { type: T }
>["props"];

// Disable auto freezing in immer so we can mutate the current state when
// setting props
setAutoFreeze(false);

export class AudioGraph {
  constructor(private delegate: AudioGraphDelegate) {}

  private currentRoot: Node | null = null;

  async render(newRoot: Node) {
    await this.delegate.initialize();

    newRoot = this.buildAudioGraph({
      newNode: newRoot,
      currentNode: this.currentRoot,
      parent: null,
    });
    this.currentRoot = produce(this.currentRoot, () => newRoot);
    this.setupAuxConnections(this.currentRoot!);
  }

  public isPlaying() {
    return this.delegate.isPlaying();
  }

  start(startStep?: number) {
    this.delegate.start(startStep);
  }

  stop() {
    this.delegate.stop();
  }

  setProperty<T extends Node["type"], P extends keyof NodeProps<T>>(
    nodeKey: string,
    nodeType: T,
    propId: P,
    value: NodeProps<T>[P],
  ) {
    if (!this.currentRoot) {
      return;
    }
    const node = this.findNodeWithKey(this.currentRoot, nodeKey);
    if (!node) {
      return;
    }
    if (node.type === nodeType) {
      node.props[propId] = value;
      this.delegate.updateNode(node);
    } else {
      throw new Error(
        `Node types were incompatible ${nodeType} and ${node.type}`,
      );
    }
  }

  /// Recursively builds a WebAudio graph by diffing the new tree (rooted at newNode) with
  /// the current tree, then adding, removing, or updating nodes and their connections
  /// to fulfill the requested state.
  ///
  /// Returns the Node created for `newNode`, or null if none was created.
  private buildAudioGraph({
    newNode,
    currentNode,
    parent,
  }: {
    newNode: Node;
    currentNode: Node | null;
    parent: Node | null;
  }): Node {
    const keyMatch =
      newNode.key !== undefined && newNode.key === currentNode?.key;
    const addNode =
      !keyMatch && (!currentNode || newNode.type !== currentNode.type);
    if (addNode) {
      if (currentNode) {
        // Remove existing node
        this.delegate.deleteNode(currentNode);
      }
      newNode = produce(newNode, (node) => {
        node.parent = parent ?? undefined;
        // Build the new audio node
        node.backingNode = this.delegate.createNode(
          newNode.type,
          (key) => this.findNodeWithKey(this.currentRoot, key),
          newNode.key,
        );
      });
      if (parent) {
        this.delegate.connectNodes(newNode, parent);
      }
    } else {
      newNode = produce(newNode, (node) => {
        node.parent = currentNode.parent;
        node.backingNode = currentNode.backingNode;
      });
      // TODO: if sequencer is reworked this may not be necessary
      // if (newNode.backingNode instanceof Sequencer) {
      //   newNode.backingNode.setNode(newNode as SequencerNode);
      // }
    }
    const updatedNode = this.applyChildNodeUpdates(newNode, currentNode);
    this.delegate.updateNode(updatedNode);
    return updatedNode;
  }

  /// Recursively iterates over the children of newNode and currentNode and adds or
  /// removes AudioNodes from the tree to satisfy the requested state.
  private applyChildNodeUpdates(
    newParent: Node,
    currentParent: Node | null,
  ): Node {
    if (newParent.children) {
      newParent.children.forEach((newChild: BaseNode, index: number) => {
        const currentChild =
          currentParent &&
          currentParent.children &&
          currentParent.children.length > index
            ? currentParent.children[index]
            : null;
        newParent = produce(newParent, (parent) => {
          parent.children![index] = this.buildAudioGraph({
            newNode: newChild as Node,
            currentNode: currentChild as Node,
            parent: newParent,
          });
        });
      });
    }

    // Delete removed children
    const numNewChildren = newParent.children ? newParent.children.length : 0;
    if (
      currentParent &&
      currentParent.children &&
      currentParent.children.length > numNewChildren
    ) {
      // Delete any children that are no longer in the child array
      for (let i = numNewChildren; i < currentParent.children!.length; ++i) {
        this.delegate.deleteNode(currentParent.children![i] as Node);
      }
    }
    return newParent;
  }

  private findNodeWithKey(root: Node | null, key: string): Node | null {
    if (!root) {
      return null;
    }
    if (root.key === key) {
      return root;
    }
    if (root.children) {
      for (const child of root.children) {
        const node = this.findNodeWithKey(child as Node, key);
        if (node) {
          return node;
        }
      }
    }
    return null;
  }

  private setupAuxConnections(node: Node) {
    if (node.auxConnections) {
      node.auxConnections.forEach((key) => {
        const auxNode = this.findNodeWithKey(this.currentRoot, key);
        if (auxNode) {
          this.delegate.connectNodes(node, auxNode);
        } else {
          throw new Error(
            `Failed to make aux connection to node with key: ${key}`,
          );
        }
        node.children?.forEach((child) =>
          this.setupAuxConnections(child as Node),
        );
      });
    }
    node.children?.forEach((child) => this.setupAuxConnections(child));
  }
}
