# codetodocx
It scans the directory recursively, filters files, directories and writes the contents of the file to docx with the path.

# How to start

install
```
npm i
```

run 
```
node . --dir=../some/folder/src/
```
after that the file `output.docx` is created in the root directory.

# args

- `--dir` - path to directory. for example `../some/folder`
- `--excludeDir` - for example `node_modules,tests` 
- `--includeExt` - for example `.ts,.js`
- `--excludePartPath` - it will remove part of path to file, for example:

```
node . --dir=../some/folder/src/ --excludePartPath=../some/folder
```
result '/src' will be written in docx