import './App.css';
import { createWorker } from 'tesseract.js';
import Camera from 'react-html5-camera-photo';
import 'react-html5-camera-photo/build/css/index.css';

function App() {

  const handleClick = async() => {
    const worker = await createWorker({
      logger: m => console.log(m)
    });
    
    (async () => {
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      const { data: { text } } = await worker.recognize('https://tesseract.projectnaptha.com/img/eng_bw.png');
      console.log(text);
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
      console.log(text);
      await worker.terminate();
    })();
  }

  function handleTakePhoto (dataUri) {
    // Do stuff with the photo...
    console.log('takePhoto',dataUri);
    recognizeImg(dataUri);
  }

  return (
    <div className="App">

      <Camera
        onTakePhoto = { (dataUri) => { handleTakePhoto(dataUri); } }
      />

      <button onClick={handleClick}>start</button>

    </div>
  );
}

export default App;
