<?php
/**
*   This page will recieve the .wav audio file Recorded 
*   from the JS audio recorder.
*/

require("AudioReader.php");
$temp_name = isset($_FILES['data']['tmp_name']) ? $_FILES['data']['tmp_name'] : null;
$clip_id = isset($_POST['id']) ? $_POST['id'] : null;
$request = isset($_POST['request'])? $_POST['request'] : null;
$dirname = '../res/uploads/'; //the directory we want to write our clips in

//check if the directory has already been created
if(!is_dir($dirname)){
    mkdir ($dirname, 0757);
}


$destination = "$dirname/clip_$clip_id" . ".wav";
move_uploaded_file($temp_name, $destination);
chmod($destination, 0755);

//can add further requests later
switch($request){
	case ("readData"):
		$audioFile = $destination;
		$audioOP = new AudioReader($audioFile);
		$response = $audioOP->readData();

		echo(json_encode($response)); //send back a json object that will be used in the javascript file	
		break;
}


?>