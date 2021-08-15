const resultAudio = document.querySelector('#result');
const recordButton = document.querySelector('#record');
const recordWrapper = document.querySelector('#record-wrapper');
const stopButton = document.querySelector('#stop');
const stopWrapper = document.querySelector('#stop-wrapper');
const submitButton = document.querySelector('#submit');
const submitConfirmButton = document.querySelector('#confirm-submit');
const modal = document.querySelector('#modal');

const recordAudio = () =>
    new Promise(async resolve => {
      const stream = await navigator.mediaDevices.getUserMedia(
        { audio: { sampleSize: 16, channelCount: 1, sampleRate: 24000 } }
      );
      const mediaRecorder = new MediaRecorder(stream);
      let audioChunks = [];

      mediaRecorder.addEventListener('dataavailable', event => {
        audioChunks.push(event.data);
      });

      const start = () => {
        audioChunks = [];
        mediaRecorder.start();
      };

      const stop = () =>
        new Promise(resolve => {
          mediaRecorder.addEventListener('stop', () => {
            const audioBlob = new Blob(audioChunks,{ 'type' : 'audio/mp3; codecs=opus' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            resolve({ audioChunks, audioBlob, audioUrl });

            resultAudio.src = audioUrl
          });

          mediaRecorder.stop();
        });

      resolve({ start, stop });
});

const sleep = time => new Promise(resolve => setTimeout(resolve, time));


const submitdAudioMessagesContainer = document.querySelector('#submitd-audio-messages');

let recorder;
let audio;

recordButton.addEventListener('click', async () => {
    recordButton.classList.add('uk-hidden');
    recordWrapper.classList.add('uk-hidden');
    stopButton.classList.remove('uk-hidden');
    stopWrapper.classList.remove('uk-hidden');
    submitButton.setAttribute('disabled', true);
    if (!recorder) {
      recorder = await recordAudio();
    }
    recorder.start();
    resultAudio.src='';
});

stopButton.addEventListener('click', async () => {
    recordButton.classList.remove('uk-hidden');
    recordWrapper.classList.remove('uk-hidden');
    stopButton.classList.add('uk-hidden');
    stopWrapper.classList.add('uk-hidden');
    submitButton.removeAttribute('disabled');
    audio = await recorder.stop();
});

submitButton.addEventListener('click', (e) => {
    title.value=''
    intro.value=''
    UIkit.modal(modal).show();
});

submitConfirmButton.addEventListener('click', (e) => {
    submit();
});


function submit(){

    const reader = new FileReader();
    const title = document.querySelector('#title').value;
    const intro = document.querySelector('#intro').value;

    if (!title) {
        UIkit.notification({
                message: 'Please provide a title',
                status: 'warning',
                pos: 'bottom-center',
                timeout: 5000
            });

    }else{

        reader.readAsDataURL(audio.audioBlob);
        reader.onload = () => {
          const base64AudioMessage = reader.result.split(',')[1];

          fetch('/save/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json','X-CSRFToken':csrf },
            body: JSON.stringify({ audio: base64AudioMessage,title:title,intro:intro })
          }).then(res => {
            if (res.status==200){
                UIkit.notification({
                    message: 'Successfully submitted your audio ',
                    status: 'primary',
                    pos: 'bottom-center',
                    timeout: 5000
                });
                UIkit.modal(modal).hide();
                submitButton.setAttribute('disabled', true);
                resultAudio.src='';
            }
          });
        };
    }
}


