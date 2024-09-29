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

export type FindNode = (key: string) => Node | undefined;
export interface AudioGraphDelegate {
  createNode: (
    type: Node["type"],
    findNode: FindNode,
    getSample: (key: string) => AudioBuffer | undefined,
    key?: string,
  ) => Promise<any>;
  deleteNode: (node: Node) => void;
  updateNode: (node: Node, findNode: FindNode) => void;
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

export class AudioGraph {
  constructor(private delegate: AudioGraphDelegate) {}

  private currentRoot: Node | null = null;
  private nodeStore: Map<string, Node> = new Map();
  private sampleStore: Map<string, AudioBuffer> = new Map();

  async render(newRoot: Node) {
    await this.delegate.initialize();

    newRoot = await this.buildAudioGraph({
      newNode: newRoot,
      currentNode: this.currentRoot,
      parent: null,
    });
    this.currentRoot = newRoot;
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
    const node = this.nodeStore.get(nodeKey);
    if (!node) {
      return;
    }
    if (node.type === nodeType) {
      node.props[propId] = value;
      this.delegate.updateNode(node, (key) => this.nodeStore.get(key));
    } else {
      throw new Error(
        `Node types were incompatible ${nodeType} and ${node.type}`,
      );
    }
  }

  addSample(key: string, buffer: AudioBuffer) {
    this.sampleStore.set(key, buffer);
  }

  /// Recursively builds a WebAudio graph by diffing the new tree (rooted at newNode) with
  /// the current tree, then adding, removing, or updating nodes and their connections
  /// to fulfill the requested state.
  ///
  /// Returns the Node created for `newNode`, or null if none was created.
  private async buildAudioGraph({
    newNode,
    currentNode,
    parent,
  }: {
    newNode: Node;
    currentNode: Node | null;
    parent: Node | null;
  }): Promise<Node> {
    const keyMatch =
      newNode.key !== undefined && newNode.key === currentNode?.key;
    const addNode =
      !keyMatch && (!currentNode || newNode.type !== currentNode.type);
    if (addNode) {
      if (currentNode) {
        // Remove existing node
        this.delegate.deleteNode(currentNode);
      }
      newNode.parent = parent ?? undefined;
      newNode.backingNode = await this.delegate.createNode(
        newNode.type,
        (key) => this.nodeStore.get(key),
        (key) => this.sampleStore.get(key),
        newNode.key,
      );
      if (parent) {
        this.delegate.connectNodes(newNode, parent);
      }
    } else {
      newNode.parent = currentNode.parent;
      newNode.backingNode = currentNode.backingNode;
    }
    const updatedNode = await this.applyChildNodeUpdates(newNode, currentNode);
    this.delegate.updateNode(updatedNode, (key) => this.nodeStore.get(key));
    if (updatedNode.key) {
      this.nodeStore.set(updatedNode.key, updatedNode);
    }
    return updatedNode;
  }

  /// Recursively iterates over the children of newNode and currentNode and adds or
  /// removes AudioNodes from the tree to satisfy the requested state.
  private async applyChildNodeUpdates(
    newParent: Node,
    currentParent: Node | null,
  ): Promise<Node> {
    if (newParent.children) {
      for (let index = 0; index < newParent.children.length; ++index) {
        const newChild = newParent.children[index];
        const currentChild =
          currentParent &&
          currentParent.children &&
          currentParent.children.length > index
            ? currentParent.children[index]
            : null;
        newParent.children![index] = await this.buildAudioGraph({
          newNode: newChild as Node,
          currentNode: currentChild as Node,
          parent: newParent,
        });
      }
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

  private setupAuxConnections(node: Node) {
    if (node.auxConnections) {
      node.auxConnections.forEach((key) => {
        const auxNode = this.nodeStore.get(key);
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
