export function addDepth(arr, depth = 0) {
    if (!Array.isArray(arr)) return depth;

    if (arr.length == 0) return depth - 1;

    let depths = [];
    arr.forEach(obj => {
        depths.push(addDepth(obj.children, depth + 1));
    })
    return Math.max(...depths);
}

export const COLORS = {
    "Current Path": "#A64AC9",
    "Available": "#C5C6C7",
    "Info": "#66FCF1",
    "Warnings Apply": "#EE4C7C",
    "Work In Progress": "#FCCD04",
    "Ending": "#14A76C"
}