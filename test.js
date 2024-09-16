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

// Load word files
function loadWordFiles(category) {
    const dir = path.join(__dirname, 'js', category);
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        if (file.endsWith('.js')) {
            const content = fs.readFileSync(path.join(dir, file), 'utf8');
            eval(content);
        }
    });
}

['nouns', 'adjectives', 'adverbs', 'verbs'].forEach(loadWordFiles);

// Test functions
function testArrays() {
    const arrays = { nouns, adjectives, adverbs, verbs };
    Object.entries(arrays).forEach(([name, array]) => {
        console.log(`Testing ${name}:`);
        if (!Array.isArray(array)) {
            console.error(`❌ ${name} is not an array`);
            return;
        }
        if (array.length === 0) {
            console.error(`❌ ${name} array is empty`);
            return;
        }
        array.forEach((item, index) => {
            if (typeof item !== 'string') {
                console.error(`❌ ${name}[${index}] is not a string`);
            } else if (item.trim() !== item) {
                console.error(`❌ ${name}[${index}] "${item}" has leading/trailing whitespace`);
            }
        });
        console.log(`✅ ${name} passed validation`);
    });
}

function testRenderStory() {
    console.log('\nTesting renderStory function:');
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
