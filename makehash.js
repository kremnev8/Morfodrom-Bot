const fs = require('fs');
const util = require('./build/utilites.js');
const path = require('path');
require('dotenv').config();

const configPath = path.join(__dirname, 'config');
const srcPath = path.join(__dirname, 'build');

let configName = 'config';
if (process.env.NODE_ENV == "production") configName = 'production';

const config = util.loadJson(path.join(configPath, configName));

const modulesPath = path.join(srcPath, config.moduleFolder);

const commandFiles = fs.readdirSync(modulesPath).filter(file => file.endsWith('.js'));
const exeFiles = fs.readdirSync(srcPath).filter(file => file.endsWith('.js'));
let hashes = util.loadJson(path.join(configPath, 'filehashes'));

for (const file of commandFiles) {
    let hash = util.hash(path.join(modulesPath, file));
    hashes[file] = hash;
}

for (const file of exeFiles) {
    let hash = util.hash(path.join(srcPath, file));
    hashes[file] = hash;
}

let ver = "version_stable"; // require('os').platform() == "win32" ? "version_exp" : "version_stable";

hashes[ver] = hashes[ver] + 1;

util.saveJson(path.join(configPath, 'filehashes'), hashes);