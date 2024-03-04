import storyTree from "./storyTree.js";
import { testNodes } from "../storyTreeTest.js";
import { addDepth } from "../storyTreeAttributes.js";
import { Tree } from "../tree.js";

testNodes(storyTree);
const MAX_DEPTH = addDepth(storyTree["children"], 1);
Tree(storyTree, MAX_DEPTH)