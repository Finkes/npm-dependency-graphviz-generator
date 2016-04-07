'use strict';

var child_process = require('child_process');


let packages = ["cmmn-moddle", "cmmn-js", "moddle-xml", "bpmn-moddle", "diagram-js", "moddle", "bpmn-js", "bpmn-js-cli", "diagram-js-origin", "bpmn-js-differ", "camunda-bpmn-moddle"];
let promises = [];

packages.forEach(packageName => {
    promises.push(getDependenciesOf(packageName));
});

Promise.all(promises)
.then((results) => {
    console.log("digraph G {");
    
    results.forEach((element, index) => {
        if(Object.keys(element).length === 0){
            console.log('\"' + packages[index] + '\"');
            return;
        }
       for(var key in element){
           if(packages.indexOf(key) != -1 ){
               console.log('\"' + packages[index] + '\"'  + ' -> "' + key + '"');
           }
       }
    });
    console.log("}");
}).catch(error => {
    console.error(error);
});


function getDependenciesOf(packageName) {
    return new Promise((resolve, reject) => {
        var child = child_process.spawn('npm', ['view', packageName, 'dependencies']);
        var buffer = "";
        child.stdout.on('data', chunk => {
            buffer += chunk.toString();
        })
        child.stdout.on('end', () => {
            var correctJson = buffer.replace(new RegExp('https://', 'g'), '');
            correctJson = correctJson.replace(/(['"])?([a-z0-9A-Z_-]+)(['"])?:/g, '\'$2\': ');
            correctJson = correctJson.replace(new RegExp('\'', 'g'), '"');
            
            try{
            resolve(JSON.parse(correctJson));}
            catch(error){
                if(correctJson == ""){
                    resolve({});
                }
                reject(packageName +': '+ error);
                console.log(correctJson);
            }
        });
    });
}