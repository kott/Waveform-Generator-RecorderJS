<?php
/**
*	This class is responisble for getting information based 
*	on a given wav file. The main purpose is to obtain the 
*	sample data needed for creating the waveform
**/


class AudioReader{

	private $fileName; 
	private $audioData = array();
	private $fp;
	private $sampleData = array();
	private $duration = null; 
	private $sampleRate;
	

	public function __construct($file){
		$this->fileName = $file;
		define("DETAIL", 5);
	}

	/**
	*	@return array audioData
	*	Reads the header of the wav file and then calls 
	**/
	public function readData(){
		ini_set('memory_limit', '512M');
		$fields = join('/',array('H8ChunkID', 'VChunkSize', 'H8Format',
		'H8Subchunk1ID', 'VSubchunk1Size',
		'vAudioFormat', 'vNumChannels', 'VSampleRate',
		'VByteRate', 'vBlockAlign', 'vBitsPerSample',
		'vSubchunk2ID', 'vSubchunk2Size', 'vdata'));
		
		$this->fp        = fopen($this->fileName,'rb');
		$header          = fread($this->fp,44);
		$this->audioData = unpack($fields,$header);
	
		$this->sampleRate = $this->audioData['SampleRate'];
		$this->duration = ($this->audioData['ChunkSize'] * 8 ) / ( $this->audioData['SampleRate'] * $this->audioData['BitsPerSample']  * $this->audioData['NumChannels']);


        $this->getSamples();
      	$this->audioData['sampleValues'] = $this->sampleData;
      	
      	return $this->audioData;
	}

	/**	 
	*	@return double $val
	*	finds the sample value based on the bytes 
	*	passed to the function.
	**/
	private function findValues($byte1, $byte2){
		$byte1 = hexdec(bin2hex($byte1));                        
	    $byte2 = hexdec(bin2hex($byte2));
	    $val   = $byte1 + ($byte2*256);
	    return $val;
	 }

	 /**
	 *	Reads the wav file file fom the end of the header 
	 *	onwards until finished and stores the 
	 *	sample values in the array sampleData
	 */
	private function getSamples(){
		$bps = $this->audioData['BitsPerSample'];
		
		$byte = $bps / 8;

		$channel = $this->audioData['NumChannels'];

		$ratio = ($channel == 2 ? 40 : 80);

		$data_size = floor((filesize($this->fileName) - 44) / ($ratio + $byte) + 1);
		$data_point = 0;
		$index = 0;

		while(!feof($this->fp) && $data_point < $data_size){
			
			if ($data_point++ % DETAIL == 0) {
			  // get number of bytes depending on bitrate
			  for ($i = 0; $i < $byte; $i++)
			    $bytes[$i] = fgetc($this->fp);
						  
			  switch($byte){
			    //8-bit
			    case 1:
			      $data = $this->findValues($bytes[0], $bytes[1]);
			      break;
			    
			    // 16
			    case 2:
			      if(ord($bytes[1]) & 128)
			        $temp = 0;
			      else
			        $temp = 128;

			      $temp = chr((ord($bytes[1]) & 127) + $temp);
			      $data = floor($this->findValues($bytes[0], $temp) / 256);
			      break;
			  }
			  
			  // skip bytes for memory optimization
			  fseek($this->fp, $ratio, SEEK_CUR);
			  
			  //value of the data point normalized
			  $value =  ($data / 255);
			 
			  $this->sampleData[$index++] = $value;       
			  
			} 
			else {
			  // skip this one due to lack of detail
			  fseek($this->fp, $ratio + $byte, SEEK_CUR);
			}
		}
		fclose($this->fp);
	}
}
?>
