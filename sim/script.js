// Lista de IDs de YouTube
const videoItems = document.querySelectorAll('.video-item');
const player = document.getElementById('videoPlayer');

// Cargar el primer video al iniciar
loadVideo(videoItems[0].dataset.id);
videoItems[0].classList.add('active');

// Función para cargar un video en el iframe
function loadVideo(videoId) {
  player.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
}

// Evento al hacer clic en un video
videoItems.forEach(item => {
  item.addEventListener('click', () => {
    // Quitar clase activa
    document.querySelector('.video-item.active')?.classList.remove('active');
    // Añadir clase activa al clickeado
    item.classList.add('active');
    // Cargar video
    loadVideo(item.dataset.id);
  });
});

// Detectar final del video y pasar al siguiente
player.onload = () => {
  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
};

// Variable global para el reproductor de YouTube
let ytPlayer;

// Callback requerido por la API de YouTube
function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player('videoPlayer', {
    events: {
      'onStateChange': onPlayerStateChange
    }
  });
}

// Manejar eventos del reproductor
function onPlayerStateChange(event) {
  // 0 = video terminado
  if (event.data === 0) {
    const currentActive = document.querySelector('.video-item.active');
    const currentIndex = Array.from(videoItems).indexOf(currentActive);
    const nextIndex = (currentIndex + 1) % videoItems.length;
    const nextItem = videoItems[nextIndex];

    // Actualizar UI y reproducir siguiente
    currentActive.classList.remove('active');
    nextItem.classList.add('active');
    loadVideo(nextItem.dataset.id);
  }
}