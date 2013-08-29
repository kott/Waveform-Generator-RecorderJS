/*
 *  Main Recording operations 
 */

var isRecording = false; //flag that indicates whether or not recording
var clipID;
var audioSamples = new Array();
var timeOut = 100; //0.1 seconds
var duration = 0;
var timer;


/**
*   records the audio and uploads it to the server 
*   with the time codes and the audio clip
*/
function recordAudio(){
    var recordIMG = null;

    if( !isRecording ){
        clipID = createID();
        startRecording();

        recordIMG = document.images["record"];
        recordIMG.src = "res/img/stopButton.png" ;
        isRecording = true;
        timer = setInterval(function(){duration++} , timeOut);
    }
    else{
       window.clearInterval(timer);
       var recordedDuration  = duration / 10;
       duration = 0;
       stopRecording(clipID , recordedDuration);
       recordIMG = document.images["record"];
       recordIMG.src = "res/img/loading.gif";
       isRecording = false;
    }
}


/**
*   Draws the waveform of the YouTube audio on the canvas element
*   using the values given in the JSON object
*/
function createWaveform(recordedDuration){
 
  ctx.canvas.width = recordedDuration * 100;
  $('#waveformCanvas').css("width" , recordedDuration * 100);

  var width  = ctx.canvas.width;
  var height = (canvas.clientHeight / 2);
  var chunks = Math.round(audioSamples.length / width);

  for(var p = 0 ; p < width; p++){
    
    var chunkSet = audioSamples.slice(chunks * p, (chunks * p + chunks));
    var min      = Math.min.apply(null,chunkSet);
    var max      = Math.max.apply(null,chunkSet);
    drawLine(p,p,min*height,max*height);
  }

}

/**
*   Draws a line on the canvas element
*/
function drawLine(x1,x2,y1,y2){

  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x1,y1);
  ctx.lineTo(x2,y2);
  ctx.stroke();
}


/**
* Not currently used since it cause "clipping"
* of the waveform
*/
function normalizeData(){
  var oldMax = Math.max.apply(null, audioSamples);
  var oldMin = Math.min.apply(null, audioSamples);
  var newMax = 0.6;
  var newMin = 0.4;

  for(i=0 ; i < audioSamples.length ; i++){
    multFactor = (newMax - newMin) / (oldMax - oldMin);
    audioSamples[i] = ((audioSamples[i] - oldMin) * multFactor) + newMin;
  }

}

///
//Creates a unique id that is assigned to the description
//used as a link between the visual description space and 
//the text area for the description 
///
function createID() {
  return ("" + 1e10).replace(/[018]/g, function(a) {
    return (a ^ Math.random() * 16 >> a / 4).toString(16)
  });
}
