// Used for server-side testing. Kyle wrote this and you
// shouldn't edit it!
const fs = require('fs');
const path = require('path');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

// Read the HTML file
const html = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf8');

// Set up the JSDOM environment
const dom = new JSDOM(html, { runScripts: "dangerously" });
const document = dom.window.document;
global.document = document;

// Initialize arrays
let nouns = [];
let adjectives = [];
let adverbs = [];
let verbs = [];

let hadError = false;


function getArrayLength(category) {
    switch (category) {
        case 'nouns':
            return nouns.length;
        case 'adjectives':
            return adjectives.length;
        case 'adverbs':
            return adverbs.length;
        case 'verbs':
            return verbs.length;
        default:
            throw new Error(`Invalid category: ${category}`);
    }
}

// Load word files
function loadWordFiles(category) {
    const dir = path.join(__dirname, 'js', category);
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file.endsWith('.js')) {
            let lengthBefore = getArrayLength(category);
            const content = fs.readFileSync(path.join(dir, file), 'utf8');
            try {
                eval(content);
            } catch (error) {
                console.error(`❌ js/${category}/${file} threw an error:`, error);
                hadError = true;
            }
            let lengthAfter = getArrayLength(category);
            if (lengthAfter === lengthBefore) {
                console.error(`❌ js/${category}/${file} did not add any ${category}`);
                hadError = true;
            }
        }
    }
}

['nouns', 'adjectives', 'adverbs', 'verbs'].forEach(loadWordFiles);

// Test functions
function testArrays() {
    const arrays = { nouns, adjectives, adverbs, verbs };
    for (const [name, array] of Object.entries(arrays)) {
        if (!Array.isArray(array)) {
            console.error(`❌ ${name} is not an array`);
            hadError = true;
            continue;
        }
        if (array.length === 0) {
            console.error(`❌ ${name} array is empty`);
            hadError = true;
            continue;
        }
        for (let index = 0; index < array.length; index++) {
            const item = array[index];
            if (typeof item !== 'string') {
                console.error(`❌ ${name}[${index}] is not a string`);
                hadError = true;
            } else if (item.trim() !== item) {
                console.error(`❌ ${name}[${index}] "${item}" has leading/trailing whitespace`);
                hadError = true;
            }
        }
        if (!hadError) {
            console.log(`✅ ${name} passed validation`);
        }
    }
}

function testRenderStory() {
    const renderStory = dom.window.renderStory;
    if (typeof renderStory !== 'function') {
        console.error('❌ renderStory is not a function');
        return;
    }

    renderStory();
    const renderedStory = document.querySelector('#rendered-story').innerHTML;

    if (renderedStory.includes('NOUN') ||
        renderedStory.includes('VERB') ||
        renderedStory.includes('ADJECTIVE') ||
        renderedStory.includes('ADVERB')) {
        console.error('❌ renderStory did not replace all placeholders');
    } else {
        console.log('✅ renderStory replaced all placeholders');
    }
}

// Run tests
testArrays();
testRenderStory();

if (hadError) {
    process.exit(1);
}
