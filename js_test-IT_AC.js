const charactersUrl = 'https://rickandmortyapi.com/api/character';
let nextCharactersUrl;

const fetchRemoteData = async (url) => {
  let response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Ошибка HTTP:  ${response.status}`);
  }
  return await response.json();
}

const drawCharacterView = (data) => {
  return data.reduce((accum, item) => {
    return accum +
      `<div class="mb-4">
        <div class="card">
          <a href="#popup" class="popup-link">
            <img class="card-img-top character-image" src="${item.image}" alt="Card image cap" loading="lazy" data-character-id="${item.id}">
          </a>
          <div class="card-body">
            <h3 class="card-title">${item.name}</h3>
          </div>
        </div>
      </div>`
  }, '')
}

const loadCharacters = async (charactersUrl) => {
  const json = await fetchRemoteData(charactersUrl)

  nextCharactersUrl = json.info.next
  const str = drawCharacterView(json.results)

  document.getElementById('app').innerHTML += '<div class="row">'+str+'</div>'
}

// Create a “throttling” decorator throttle(function, time, ms) – that returns a wrapper.
// When it’s called multiple times, it passes the call to function at maximum once per time in milliseconds.
let throttleTimer;

const throttle = (callback, time) => {
  if (throttleTimer) { return; }
  throttleTimer = true;
  setTimeout(() => { callback(); throttleTimer = false}, time);
};

const handleInfiniteScroll = async () => {
  throttle(async () => {
    // Parameters destructuration
    const {scrollTop, scrollHeight, clientHeight} = document.documentElement;

    if (scrollTop + clientHeight >= scrollHeight - 4) { // end of page
      await loadCharacters(nextCharactersUrl)
    }

    if (!nextCharactersUrl) {
      // Teardown after pagination finished
      window.removeEventListener('scroll', handleInfiniteScroll);
    }
  }, 1000);
};

(async () => { // IIFE
  // Initial load for the first page
  await loadCharacters(charactersUrl)

  // Listener for infinite data loading
  window.addEventListener('scroll', async () => {
    await handleInfiniteScroll()
  });
  
  document.addEventListener('click', async function (e) {
    if (!e.target.classList.contains('character-image')) {
      return;
    }
    const characterId = e.target.getAttribute('data-character-id');
    const json = await fetchRemoteData(`${charactersUrl}/${characterId}/`)

    document.getElementById('exapleModalLabel').innerHTML = `<img src="${json.image}"> </img>`;
    document.getElementById('modalContent').innerHTML =
      `<div class = "popup_data">
      <p>Name: ${json.name} </p>
      <p>Gender: ${json.gender} </p>
       <p>Species: ${json.species} </p>
       <p>Status: ${json.status} </p>
       <p>Location: ${json.location.name} </p>
       </div>`
  });
})()