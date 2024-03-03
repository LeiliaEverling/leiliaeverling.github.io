import storyTree from "./storyTree.js";
import { COLORS } from "./storyTreeAttributes.js"

const MAX_TEXT_LENGTH = 25;

function testNodes(obj) {
    if (obj.name.length > MAX_TEXT_LENGTH) console.error(`Node Name Too Long: ${obj.name}`);
    
    if (obj.code && !COLORS[obj.code]) console.error(`Node Color Code Does Not Exist: ${obj.name}`);

    if (!obj.chapter_id) console.error(`Node Does Not Have A Chapter Id: ${obj.name}`);

    if (obj.children && Array.isArray(obj.children) && obj.children.length > 0) {
        obj.children.forEach(obj => {
            testNodes(obj);
        })
    }

    return;
}

testNodes(storyTree);