
var fs = require('fs');
var path = require('path');
var {isCordovaAbove} = require("../utils");

function replacerAllowBackup(match, p1, p2, p3, offset, string){
  if(p2){
    if(p2.includes("allowBackup")){
      p2 = p2.repalce("true","false");
      return [p1,p2,p3].join("");
    }
  }
  return [p1,' android:allowBackup="false" ',p3].join("");
  }

  function replacerWriteExternalStorage(match, p1, p2, p3, offset, string){
    return [p1,p3].join("");
  }

module.exports = function (context) {

    console.log("Start changing Manifest!");
    var deferral;
    var cordovaAbove8 = isCordovaAbove(context, 8);
    if (cordovaAbove8) {
      deferral = require('q').defer();
    } else {
      deferral = context.requireCordovaModule("q").defer();
    }

    var projectRoot = context.opts.cordova.project ? context.opts.cordova.project.root : context.opts.projectRoot;
    var manifestPath = path.join(projectRoot,"platforms","android","app","src","main","AndroidManifest.xml");
    var manifest = fs.readFileSync(manifestPath, "utf8");

    var regexAllowBackup = /(<\?xml [\s|\S]*<application.*)(android:allowBackup=".*")*(>[\s|\S]*<\/manifest>)/gm;
    manifest = manifest.replace(regexAllowBackup,replacerAllowBackup);

    var regexWriteExternalStorage = /(<\?xml [\s|\S]*)(<uses-permission android:name="android\.permission\.WRITE_EXTERNAL_STORAGE" \/>)*([\s|\S]*<\/manifest>)/gm;
    manifest = manifest.replace(regexWriteExternalStorage,replacerWriteExternalStorage);

    
    fs.writeFileSync(manifestPath, manifest);
    console.log("Finished changing Manifest!");
    deferral.resolve();

    return deferral.promise;
}