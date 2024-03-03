import { COLORS } from "./storyTreeAttributes.js"

const MAX_TEXT_LENGTH = 25;

export function testNodes(obj) {
    if (obj.name.length > MAX_TEXT_LENGTH) console.error(`Node Name Too Long: ${obj.name}`);
    
    if (obj.code && !COLORS[obj.code]) console.error(`Node Color Code Does Not Exist: ${obj.name}`);

    if (!obj.work) console.error(`Node Does Not Have A Work Id: ${obj.name}`);
    if (!obj.chapter) console.error(`Node Does Not Have A Chapter Id: ${obj.name}`);

    if (obj.children && Array.isArray(obj.children) && obj.children.length > 0) {
        obj.children.forEach(obj => {
            testNodes(obj);
        })
    }

    return;
}