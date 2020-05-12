const fs = require('fs');
const util = require('./build/utilites.js');
const path = require('path');

const configPath = path.join(__dirname, 'config');
const srcPath = path.join(__dirname, 'build');
const config = util.loadJson(`${configPath}\\config`);

const modulesPath = path.join(srcPath, config.moduleFolder);

const commandFiles = fs.readdirSync(modulesPath).filter(file => file.endsWith('.js'));
const exeFiles = fs.readdirSync(srcPath).filter(file => file.endsWith('.js'));
let hashes = util.loadJson(`${configPath}\\filehashes`);

for (const file of commandFiles) {
    let hash = util.hash(`${modulesPath}\\${file}`);
    hashes[file] = hash;
}

for (const file of exeFiles) {
    let hash = util.hash(`${srcPath}\\${file}`);
    hashes[file] = hash;
}

let ver = require('os').platform() == "win32" ? "version_exp" : "version_stable";

hashes[ver] = hashes[ver] + 1;

util.saveJson(`${configPath}\\filehashes`, hashes);