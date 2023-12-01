import * as fs from "fs/promises";

const fileContent = (await fs.readFile("input.txt")).toString();
const lines = fileContent.split("\n");

// const system = {
//   "/": { directChildrenSize: 23390, children: ["a", "d"], parent: '' },
// };

const appendDirectory = (currentDirectory, newDirectory) => {
  if (currentDirectory === "/" || currentDirectory === "") {
    return `${currentDirectory}${newDirectory}`;
  }
  return `${currentDirectory}/${newDirectory}`;
};

const computeFileSystem = (lines) => {
  // let i = 0;
  let currentDirectory = "";
  const currentDirectories = [];
  const fileSystem = {};
  for (const line of lines) {
    // i += 1;
    // console.log("i : ", i);
    // console.log(currentDirectories.slice(-20));
    const command = line.split(" ");
    if (command[0] === "$" && command[1] === "cd") {
      if (command[2] === "..") {
        currentDirectory = fileSystem[currentDirectory].parent;
        currentDirectories.push(currentDirectory);
      } else {
        const newCurrentDirectory = appendDirectory(
          currentDirectory,
          command[2]
        );
        if (!fileSystem[newCurrentDirectory]) {
          fileSystem[newCurrentDirectory] = {
            directChildrenSize: 0,
            children: [],
            parent: currentDirectory,
          };
        }
        currentDirectory = newCurrentDirectory;
        currentDirectories.push(currentDirectory);
      }
    } else if (command[0] === "dir") {
      fileSystem[currentDirectory].children.push(
        appendDirectory(currentDirectory, command[1])
      );
    } else if (command[0] !== "$") {
      fileSystem[currentDirectory].directChildrenSize += parseInt(command[0]);
    }
  }
  return fileSystem;
};

let SIZE_SUM = 0;

const computeDirectorySize = (directory, fileSystem, directorySizes) => {
  const directSize = fileSystem[directory].directChildrenSize;
  const childrenSize = [...new Set(fileSystem[directory].children)].reduce(
    (prevSum, subDirectory) =>
      prevSum + computeDirectorySize(subDirectory, fileSystem, directorySizes),
    0
  );
  const directorySize = directSize + childrenSize;
  directorySizes[directory] = directorySize;
  if (directorySize <= 100000) {
    SIZE_SUM += directorySize;
  }
  return directorySize;
};

const fileSystem = computeFileSystem(lines);
// console.log(fileSystem);
const directorySizes = {};
computeDirectorySize("/", fileSystem, directorySizes);
// console.log(directorySizes);
// console.log(SIZE_SUM);

const TOTAL_SPACE = 70000000;
const unusedSpace = TOTAL_SPACE - directorySizes["/"];
const spaceToFree = 30000000 - unusedSpace;

let minDirectorySize = TOTAL_SPACE;
for (const dirSize of Object.values(directorySizes)) {
  if (dirSize >= spaceToFree && dirSize < minDirectorySize) {
    minDirectorySize = dirSize;
  }
}
console.log(minDirectorySize);
