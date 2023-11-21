import './App.css';
import { createWorker } from 'tesseract.js';
import WebCamera, { FACING_MODES } from 'react-html5-camera-photo';
import 'react-html5-camera-photo/build/css/index.css';
import { useState } from 'react';
import { useRef } from "react";
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";

function App() {

  const [recognizedText, setRecognizedText] = useState("");
  const [image, setImage] = useState(null);
  const [cropedImage, setCropedImage] = useState(null);
  const [croped, setCroped] = useState(null);
  const cropperRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [improvedImage, setImprovedImage] = useState(null);

  const onCrop = (e) => {
    // console.log(e)
    const cropper = cropperRef.current?.cropper;
    //console.log(cropper.getCroppedCanvas().toDataURL());
    setCropedImage(cropper.getCroppedCanvas().toDataURL());
  };


  const handleClick = async() => {
    const worker = await createWorker({
      logger: m => console.log(m)
    });
    
    (async () => {
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      const { data: { text } } = await worker.recognize('https://tesseract.projectnaptha.com/img/eng_bw.png');
      console.log(text);
      setRecognizedText(text);
      await worker.terminate();
    })();
  }

  const recognizeImg = async(imgUrl) => {
    const worker = await createWorker({
      logger: m => console.log(m)
    });
    
    (async () => {
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      const { data: { text } } = await worker.recognize(imgUrl);
      console.log('sended text',text);
      setRecognizedText(formatText(text));
      postTheMessage(formatText(text));
      setLoading(false);
      await worker.terminate();
    })();
  }

  function postTheMessage(data) {
    try {
      window.parent.postMessage(`${data}`, "*");
      // alert("sended")
      // window.postMessage(data, "*");
      //alert('enviando')
    } catch (error) {
      alert('Ha ocurrido un error');
    }
  }

  function handleTakePhoto (dataUri) {
    // Do stuff with the photo...
    //console.log('takePhoto',dataUri);
    // recognizeImg(dataUri);
    setImage(dataUri);

  }

  const handleRecognition = async () => {
    console.log("here")
    setRecognizedText("");
    setLoading(true);
    const enhancedImage = await enhanceImageQuality(cropedImage || image);
    setImprovedImage(enhancedImage);
    recognizeImg(enhancedImage);
  }

  const enhanceImageQuality = async (imgUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        context.filter = 'brightness(1.2) contrast(1.2)'; // Ajusta estos valores según tus necesidades
        context.drawImage(img, 0, 0, img.width, img.height);
        resolve(canvas.toDataURL());
      };
      img.src = imgUrl;
    });
  };

  function formatText(input) {
    // Convertir a mayúsculas y eliminar caracteres especiales y espacios en blanco
    const cleanedText = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
  
    // Separar cada 4 caracteres con un guión
    const formattedText = cleanedText.replace(/(.{4})/g, '$1-').slice(0, -1);
  
    return formattedText;
  }

  const handleReset = () => {
    setImage(null); 
    setCroped(null);
  }

  return (
    <div className="App">

      <div className={'alert '+((recognizedText!=='')?'show':'hide')}>
        { recognizedText }
      </div>

      <div className="camera-wrapper" style={{opacity:(image?"0":"1"), backgroundColor: "#000", height: "100vh", display: "flex", alignItems:"center", overflow:"hidden", maxHeight:"100vh"}}>
        <WebCamera
          onTakePhoto = { (dataUri) => { handleTakePhoto(dataUri); } }
          idealFacingMode = {FACING_MODES.ENVIRONMENT}
          isImageMirror = {false}
          isSilentMode = {true}
          // isFullscreen
          // idealResolution = {{width: "100%", height: "100vh"}}
          // idealResolution
          // style={{ height: "100vh", width: "100%", position:"absolute", top: "0", left: "0"}}
        />
      </div>
      
      <div className="cropper-wrapper" style={{opacity:(image?"1":"0"), backgroundColor: "#000", height: "100vh", display: "flex", alignItems:"center", overflow:"hidden", maxHeight:"100vh"}}>
        <Cropper
          src={image}
          style={{ height: "100vh", width: "100%", position:"absolute", top: "0", left: "0", backgroundColor: "#000", maxHeight:"100vh"}}
          // Cropper.js options
          // initialAspectRatio={16 / 9}
          zoomable={false}
          guides={false}
          crop={onCrop}
          ref={cropperRef}
          scalable={false}
          viewMode={1}
          background={false}
          modal={false}
          autoCrop={false}
        />
      </div>

      {/* <div>
        Texto: { recognizedText }
      </div> */}
      {/* <button onClick={handleClick}>start</button> */}

      {
        image?
        // <img src={enhancedImage} alt=""/>
          <div className='actions'>
            {/* <img src={improvedImage} alt=""/> */}
            <button className="button secondary" onClick={handleReset} disabled={loading}>
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
              </span>
              New picture
            </button>
            <button className="button" onClick={handleRecognition} disabled={loading}>
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </span>
              Scan
            </button>
          </div>
        :
        <></>
      }

      {/* <button onClick={handleRecognition} style="position: fixed;bottom: 1em;right: 1em;padding: .5em;background: green;">Recognize</button> */}

      {
        loading?
        <div className='loader'>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        :
        <></>
      }

    </div>
  );
}

export default App;
