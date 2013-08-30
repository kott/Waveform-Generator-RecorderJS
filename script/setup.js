/**
*
*   This JS file takes care of the setup required for the Recorder
*   and associated 
*/
var audio_context;
var recorder;
var canvas;
var ctx;

$(document).ready(function(){   
  jsRecorderInit(); //set up the JS recorder by default
  canvas = document.getElementById('waveformCanvas');
  ctx = canvas.getContext('2d');
});

function jsRecorderInit(){
  try {
      // webkit shim
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
      window.URL = window.URL || window.webkitURL;
      
      audio_context = new AudioContext;
      console.log('Audio context set up.');
      console.log('navigator.getUserMedia ' + (navigator.getUserMedia ? 'available.' : 'not present!'));
  } 
  catch (e) {
      alert('No web audio support in this browser! ');
  }
    
  navigator.getUserMedia({audio: true}, startUserMedia, function(e) {
    alert('No live audio input: ' + e + ' Maybe a microphone is disconnected');
  });
}


function startUserMedia(stream) {

  $("#shown").toggle();
  $("#hidden").toggle();

  var input = audio_context.createMediaStreamSource(stream);
  console.log('Media stream created.');

  input.connect(audio_context.destination);
  console.log('Input connected to audio context destination.');

  recorder = new Recorder(input, {
      workerPath: "script/lib/recorderjs/recorderWorker.js"
    });

  console.log('Recorder initialized.');

  document.getElementById("recordButton").disabled = false;
  recordIMG = document.images["record"];
  recordIMG.src = "res/img/recordButton.png";
}


function startRecording() {
  recorder && recorder.record();
  console.log('Recording...');
}

function stopRecording(clipID , recordedDuration) {
  recorder && recorder.stop();
  console.log('Stopped recording.');
  
  recorder.exportWAV(function(blob) {
    uploadToServer(blob , clipID , recordedDuration);
  });

  recorder.clear();
}


function uploadToServer(blob, clipID , recordedDuration){

  var url = URL.createObjectURL(blob);
  var fd = new FormData();

  fd.append('data', blob);
  fd.append('id', clipID);
  fd.append('request' , "readData");

  $.ajax({
      type: 'POST',
      dataType: 'json',
      url: 'script/record.php',
      data: fd,
      processData: false,
      contentType: false,
  
      success: function(json){
        //put all sampleData values into an array
        for(var i in json.sampleValues){
          audioSamples.push(json.sampleValues[i]);
        }

        audioFilename = json.audioFilename;
        createWaveform(recordedDuration);
        recordIMG.src = "res/img/recordButton.png";
        console.log("Filename: " + json.audioFilename);
        
      },
      error: function(json){
        recordIMG.src = "res/img/recordButton.png";
        alert( "An error occured while retrieving the videos audio data. Some information may not be displayed.");
      }

  });
}
