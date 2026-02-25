let allVideos = [];
let filteredVideos = [];
let currentCap = null; // ← ahora es el valor de "i", no un índice

const player = document.getElementById('videoPlayer');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const videoList = document.getElementById('videoList');

// Cargar videos desde JSON o localStorage
async function loadVideos() {
  try {
    const saved = JSON.parse(localStorage.getItem('videoPlaylist')) || {};
    
    //* console.warn("¿había cache?");
    if (saved.allVideos && saved.currentCap !== undefined) {
      //* console.warn("sí había cache");
      // Usar datos guardados
      allVideos = saved.allVideos;
      currentCap = saved.currentCap;
    } else {
      //* console.warn("no había cache");
      // Cargar desde JSON
      const res = await fetch('series/narutito.json');
      allVideos = await res.json();

      //* Imprimir con formato (indentación de 2 espacios)
      //* console.warn(JSON.stringify(allVideos, null, 2));

      currentCap = allVideos.length > 0 ? allVideos[0].i : null;
      // Guardar en localStorage
      localStorage.setItem('videoPlaylist', JSON.stringify({ allVideos, currentCap }));
    }

    applyFilter();
  } catch (err) {
    console.error('Error al cargar videos:', err);
  }
}

// Aplicar filtro según modo
function applyFilter() {
  const mode = document.querySelector('input[name="mode"]:checked')?.value || 'mixto';

  switch (mode) {
    case 'sin':
      filteredVideos = allVideos.filter(v => v.relleno === false);
      break;
    case 'con':
      filteredVideos = allVideos.filter(v => v.relleno === true);
      break;
    default:
      filteredVideos = [...allVideos];
  }

  // Buscar el índice del currentCap en la lista filtrada
  let index = filteredVideos.findIndex(v => v.i === currentCap);

  // Si no está en la lista filtrada, usar el primero
  if (index === -1 && filteredVideos.length > 0) {
    currentCap = filteredVideos[0].i;
    index = 0;
  }

  renderList();
  updateVideo();
  updateButtons();
}

// Actualizar reproductor
function updateVideo() {
  const video = filteredVideos.find(v => v.i === currentCap);
  player.src = video ? video.link.trim() : '';
  document.getElementById('cap').textContent = currentCap !== null ? `Cap ${currentCap}` : '-';
  saveState();
}

// Actualizar botones
function updateButtons() {
  const index = filteredVideos.findIndex(v => v.i === currentCap);
  prevBtn.disabled = index <= 0;
  nextBtn.disabled = index >= filteredVideos.length - 1;
}

// Renderizar lista
function renderList() {
  videoList.innerHTML = '';
  filteredVideos.forEach(video => {
    const item = document.createElement('div');
    item.className = 'video-item';
    if (video.i === currentCap) item.classList.add('active');
    item.textContent = `Cap ${video.i} (${video.relleno ? 'relleno' : 'sin'})`;
    item.addEventListener('click', () => {
      currentCap = video.i;
      updateVideo();
      updateButtons();
      renderList();
    });
    videoList.appendChild(item);
  });
}

// Siguiente
nextBtn.addEventListener('click', () => {
  const index = filteredVideos.findIndex(v => v.i === currentCap);
  if (index < filteredVideos.length - 1) {
    currentCap = filteredVideos[index + 1].i;
    updateVideo();
    updateButtons();
    renderList();
  }
});

// Anterior
prevBtn.addEventListener('click', () => {
  const index = filteredVideos.findIndex(v => v.i === currentCap);
  if (index > 0) {
    currentCap = filteredVideos[index - 1].i;
    updateVideo();
    updateButtons();
    renderList();
  }
});

// Cambiar modo
document.querySelectorAll('input[name="mode"]').forEach(radio => {
  radio.addEventListener('change', applyFilter);
});

// Guardar estado en localStorage
function saveState() {
  localStorage.setItem('videoPlaylist', JSON.stringify({ allVideos, currentCap }));
}

// Iniciar
document.addEventListener('DOMContentLoaded', loadVideos);