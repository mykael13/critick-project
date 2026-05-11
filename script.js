const notifications = [
  {
    icon: '!',
    title: 'Bem-vindo ao Critick',
    message: 'A plataforma ainda está em desenvolvimento.',
    time: 'Sistema'
  },
  {
    icon: '+',
    title: 'Perfil atualizado',
    message: 'Agora seu perfil salva nome, @, bio, foto, banner e avaliações.',
    time: 'Atualização'
  }
];

const albums = {
  midnights: {
    name: 'Midnights',
    artist: 'Taylor Swift',
    year: 2022,
    genre: 'Synth-pop',
    cover: 'assets/covers/midnights.jpg',

    tracks: [
      { title: 'Lavender Haze', score: null },
      { title: 'Maroon', score: null },
      { title: 'Anti-Hero', score: null },
      { title: 'Snow On The Beach', score: null },
      { title: "You're On Your Own, Kid", score: null },
      { title: 'Midnight Rain', score: null },
      { title: 'Question...?', score: null },
      { title: 'Vigilante Shit', score: null },
      { title: 'Bejeweled', score: null },
      { title: 'Labyrinth', score: null },
      { title: 'Karma', score: null },
      { title: 'Sweet Nothing', score: null },
      { title: 'Mastermind', score: null }
    ]
  },

  brat: {
    name: 'BRAT',
    artist: 'Charli xcx',
    year: 2024,
    genre: 'Electropop',
    cover: 'assets/covers/brat.jpg',

    tracks: [
      { title: '360', score: null },
      { title: 'Club classics', score: null },
      { title: 'Sympathy is a knife', score: null },
      { title: 'I might say something stupid', score: null },
      { title: 'Talk talk', score: null },
      { title: 'Von dutch', score: null },
      { title: 'Everything is romantic', score: null },
      { title: 'Rewind', score: null },
      { title: 'So I', score: null },
      { title: 'Girl, so confusing', score: null },
      { title: 'Apple', score: null },
      { title: 'B2b', score: null },
      { title: 'Mean girls', score: null },
      { title: 'I think about it all the time', score: null },
      { title: '365', score: null }
    ]
  }
};

let currentAlbum = structuredClone(albums.midnights);

let selectedAlbumKey = 'midnights';

const DEFAULT_PROFILE_IMAGE =
  'assets/profile/default-avatar.png';

const DEFAULT_BANNER_IMAGE =
  'assets/profile/default-banner.png';

let spotifySearchResults = [];

let userProfile =
  JSON.parse(
    localStorage.getItem('critickProfile')
  ) || {

    displayName: 'Seu nome',

    username: 'usuario',

    bio: 'Sua bio aparecerá aqui.',

    image: DEFAULT_PROFILE_IMAGE,

    banner: DEFAULT_BANNER_IMAGE,

    bannerPosition: 50
};

let userReviews =
  JSON.parse(
    localStorage.getItem('critickReviews')
  ) || [];

function safeText(value, fallback = '') {

  return value &&
    String(value).trim()

    ? String(value).trim()

    : fallback;
}

function getAlbumKeyByName(albumName) {

  return Object.keys(albums).find(key => {
    return albums[key].name === albumName;
  });
}

function normalizeReviews() {

  userReviews = userReviews

    .filter(review => {
      return review &&
        review.album &&
        review.average;
    })

    .map(review => {

      const albumKey =
        getAlbumKeyByName(review.album);

      const albumData =
        albumKey
          ? albums[albumKey]
          : null;

      return {

        album:
          review.album,

        artist:
          review.artist ||
          albumData?.artist ||
          'Artista desconhecido',

        year:
          review.year ||
          albumData?.year ||
          '',

        average:
          Number(review.average).toFixed(1),

        text:
          review.text || '',

        cover:
          review.cover ||
          albumData?.cover ||
          DEFAULT_PROFILE_IMAGE,

        trackCount:
          Number(review.trackCount) ||
          albumData?.tracks?.length ||
          0,

        date:
          review.date ||
          new Date().toLocaleDateString('pt-BR')
      };
    });

  localStorage.setItem(
    'critickReviews',
    JSON.stringify(userReviews)
  );
}

async function searchSpotifyAlbums(query) {

  const response =
    await fetch(
      `/api/spotify?q=${encodeURIComponent(query)}`
    );

  const data =
    await response.json();

  if (!response.ok) {

    throw new Error(
      data.error ||
      'Erro ao buscar álbum.'
    );
  }

  return data.albums || [];
}

function hideAlbumSuggestions() {

  const suggestions =
    document.getElementById(
      'albumSuggestions'
    );

  if (suggestions) {

    suggestions.style.display = 'none';
  }
}

function renderNotifications() {

  const list =
    document.getElementById(
      'notificationList'
    );

  if (!list) return;

  list.innerHTML =
    notifications.map(notification => `
      <div class="notification-item">
        <div class="notification-icon">
          ${notification.icon}
        </div>

        <div class="notification-content">
          <strong>${notification.title}</strong>
          <span>${notification.message}</span>
          <span class="notification-time">
            ${notification.time}
          </span>
        </div>
      </div>
    `).join('');
}

function toggleNotifications(event) {

  event.stopPropagation();

  const panel =
    document.getElementById(
      'notificationPanel'
    );

  const dot =
    document.getElementById(
      'notificationDot'
    );

  if (!panel || !dot) return;

  panel.classList.toggle('show');

  const profileMenu =
    document.getElementById(
      'profileMenu'
    );

  if (profileMenu) {
    profileMenu.classList.remove('show');
  }

  dot.style.display =
    panel.classList.contains('show')
      ? 'none'
      : 'block';
}

function toggleProfileMenu(event) {

  event.stopPropagation();

  const profileMenu =
    document.getElementById(
      'profileMenu'
    );

  const notificationPanel =
    document.getElementById(
      'notificationPanel'
    );

  if (notificationPanel) {
    notificationPanel.classList.remove('show');
  }

  if (profileMenu) {
    profileMenu.classList.toggle('show');
  }
}

document.addEventListener('click', function(event) {

  const notificationWrap =
    document.querySelector(
      '.notification-wrap'
    );

  const notificationPanel =
    document.getElementById(
      'notificationPanel'
    );

  if (
    notificationWrap &&
    notificationPanel &&
    !notificationWrap.contains(event.target)
  ) {
    notificationPanel.classList.remove('show');
  }

  const profileWrap =
    document.querySelector(
      '.profile-wrap'
    );

  const profileMenu =
    document.getElementById(
      'profileMenu'
    );

  if (
    profileWrap &&
    profileMenu &&
    !profileWrap.contains(event.target)
  ) {
    profileMenu.classList.remove('show');
  }

  const searchWrapper =
    document.querySelector(
      '.search-wrapper'
    );

  if (
    searchWrapper &&
    !searchWrapper.contains(event.target)
  ) {
    hideAlbumSuggestions();
  }
});

function openAlbum(albumKey = selectedAlbumKey) {

  if (!albums[albumKey]) return;

  currentAlbum =
    structuredClone(
      albums[albumKey]
    );

  selectedAlbumKey = albumKey;

  const hero =
    document.getElementById('hero');

  const albumsSection =
    document.getElementById(
      'albumsSection'
    );

  const albumPanel =
    document.getElementById(
      'albumPanel'
    );

  if (hero) {
    hero.style.display = 'none';
  }

  if (albumsSection) {
    albumsSection.style.display = 'none';
  }

  if (albumPanel) {
    albumPanel.style.display = 'block';
  }

  const albumName =
    document.getElementById(
      'albumName'
    );

  const albumArtist =
    document.getElementById(
      'albumArtist'
    );

  const albumCover =
    document.getElementById(
      'albumCover'
    );

  if (albumName) {
    albumName.textContent =
      currentAlbum.name;
  }

  if (albumArtist) {
    albumArtist.textContent =
      `${currentAlbum.artist} · ${currentAlbum.year} · ${currentAlbum.genre}`;
  }

  if (albumCover) {
    albumCover.innerHTML = `
      <img
        src="${currentAlbum.cover}"
        alt="Capa do álbum ${currentAlbum.name}"
      />
    `;
  }

  const personalReview =
    document.getElementById(
      'personalReview'
    );

  if (personalReview) {
    personalReview.value = '';
  }

  createTracks();
  updateAverage();
  validateReviewCompletion();
  updateProfilePreview();

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

function createTracks() {

  const container =
    document.getElementById(
      'tracksContainer'
    );

  if (!container) return;

  container.innerHTML = '';

  currentAlbum.tracks.forEach(
    (track, index) => {

      const trackElement =
        document.createElement('div');

      trackElement.className = 'track';

      trackElement.innerHTML = `
        <div class="track-number">
          ${String(index + 1).padStart(2, '0')}
        </div>

        <div class="track-title">
          ${track.title}
        </div>

        <div class="track-rating-area">
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value="${track.score === null ? 0 : track.score}"
            oninput="updateTrackScore(${index}, this.value)"
          />

          <small>Arraste para avaliar</small>
        </div>

        <div
          class="track-score"
          id="track-score-${index}"
        >
          ${
            track.score === null
              ? '—'
              : Number(track.score).toFixed(1)
          }
        </div>
      `;

      container.appendChild(
        trackElement
      );
    }
  );
}

function updateTrackScore(index, value) {

  if (!currentAlbum.tracks[index]) return;

  currentAlbum.tracks[index].score =
    Number(value);

  const scoreElement =
    document.getElementById(
      `track-score-${index}`
    );

  if (scoreElement) {
    scoreElement.textContent =
      Number(value).toFixed(1);
  }

  updateAverage();
  validateReviewCompletion();
}

function updateAverage() {

  const averageScore =
    document.getElementById(
      'averageScore'
    );

  if (!averageScore) return;

  const ratedTracks =
    currentAlbum.tracks.filter(track => {
      return track.score !== null;
    });

  if (ratedTracks.length === 0) {
    averageScore.textContent = '0.0';
    return;
  }

  const total =
    ratedTracks.reduce((sum, track) => {
      return sum + Number(track.score);
    }, 0);

  const average =
    total / ratedTracks.length;

  averageScore.textContent =
    average.toFixed(1);
}

function validateReviewCompletion() {

  const button =
    document.getElementById(
      'submitReviewBtn'
    );

  const requirement =
    document.getElementById(
      'reviewRequirement'
    );

  if (!button) return;

  const allRated =
    currentAlbum.tracks.length > 0 &&
    currentAlbum.tracks.every(track => {
      return track.score !== null;
    });

  button.disabled = !allRated;

  if (allRated) {

    button.classList.add('ready');

    if (requirement) {

      requirement.textContent =
        'Tudo pronto. Agora você pode enviar sua avaliação.';

      requirement.className =
        'feedback success';
    }

  } else {

    button.classList.remove('ready');

    if (requirement) {

      requirement.textContent =
        'Avalie todas as faixas para liberar sua nota.';

      requirement.className =
        'feedback';
    }
  }
}

function submitReview() {

  const allRated =
    currentAlbum.tracks.every(track => {
      return track.score !== null;
    });

  if (!allRated) return;

  const average =
    document.getElementById(
      'averageScore'
    )?.textContent || '0.0';

  const reviewText =
    document.getElementById(
      'personalReview'
    )?.value.trim() || '';

  const existingReviewIndex =
    userReviews.findIndex(review => {
      return review.album === currentAlbum.name;
    });

  const review = {
    album: currentAlbum.name,
    artist: currentAlbum.artist,
    year: currentAlbum.year,
    average: Number(average).toFixed(1),
    text: reviewText,
    cover: currentAlbum.cover,
    trackCount: currentAlbum.tracks.length,
    date: new Date().toLocaleDateString('pt-BR')
  };

  if (existingReviewIndex >= 0) {

    userReviews[existingReviewIndex] =
      review;

  } else {

    userReviews.unshift(review);
  }

  localStorage.setItem(
    'critickReviews',
    JSON.stringify(userReviews)
  );

  renderWeeklyTopAlbums();
  renderProfileReviews();

  const albumPanel =
    document.getElementById(
      'albumPanel'
    );

  const completionMessage =
    document.getElementById(
      'completionMessage'
    );

  if (albumPanel) {
    albumPanel.style.display = 'none';
  }

  if (completionMessage) {
    completionMessage.classList.add('show');
  }
}

function closeCompletionMessage() {

  const completionMessage =
    document.getElementById(
      'completionMessage'
    );

  if (completionMessage) {
    completionMessage.classList.remove('show');
  }

  goHome();
}

function goHome() {

  const completionMessage =
    document.getElementById(
      'completionMessage'
    );

  const albumPanel =
    document.getElementById(
      'albumPanel'
    );

  const hero =
    document.getElementById(
      'hero'
    );

  const albumsSection =
    document.getElementById(
      'albumsSection'
    );

  if (completionMessage) {
    completionMessage.classList.remove('show');
  }

  if (albumPanel) {
    albumPanel.style.display = 'none';
  }

  if (hero) {
    hero.style.display = 'grid';
  }

  if (albumsSection) {
    albumsSection.style.display = 'block';
  }

  hideAlbumSuggestions();

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

function scrollToAlbums() {

  goHome();

  setTimeout(() => {

    const albumsSection =
      document.getElementById(
        'albumsSection'
      );

    if (albumsSection) {
      albumsSection.scrollIntoView({
        behavior: 'smooth'
      });
    }

  }, 100);
}

function focusFriendSearch() {

  goHome();

  setTimeout(() => {

    const friendInput =
      document.getElementById(
        'friendInput'
      );

    if (friendInput) {
      friendInput.focus();
    }

  }, 100);
}

function focusAlbumSearch() {

  goHome();

  setTimeout(() => {

    const albumSearchInput =
      document.getElementById(
        'albumSearchInput'
      );

    if (albumSearchInput) {
      albumSearchInput.focus();
    }

    showAlbumSuggestions();

  }, 100);
}

async function getAlbumTracks(albumId) {

  const response =
    await fetch(
      `/api/spotify/album/${albumId}`
    );

  const data =
    await response.json();

  console.log('API RESPONSE:', data);

  return (
    data.items ||
    data.tracks?.items ||
    data.tracks ||
    []
  );
}

function normalizeSpotifyTrack(track) {

  return {
    title:
      track.title ||
      track.name ||
      'Faixa sem nome',

    score: null
  };
}

function normalizeSpotifyAlbum(album) {

  const tracks =
    Array.isArray(album.tracks)
      ? album.tracks.map(normalizeSpotifyTrack)
      : [];

  return {
    id:
      album.id || null,

    name:
      album.name || 'Álbum sem nome',

    artist:
      album.artist ||
      album.artists?.[0]?.name ||
      'Artista desconhecido',

    year:
      album.year ||
      album.release_date?.slice(0, 4) ||
      '',

    genre:
      'Spotify',

    cover:
      album.cover ||
      album.images?.[0]?.url ||
      DEFAULT_PROFILE_IMAGE,

    tracks:
      tracks.length > 0
        ? tracks
        : [
            {
              title: 'Avaliação geral do álbum',
              score: null
            }
          ]
  };
}

async function searchAlbum() {

  const input =
    document.getElementById(
      'albumSearchInput'
    );

  const feedback =
    document.getElementById(
      'albumFeedback'
    );

  const query =
    input?.value.trim();

  if (!query) {

    if (feedback) {

      feedback.textContent =
        'Digite o nome de um álbum para pesquisar.';

      feedback.className =
        'feedback error';
    }

    return;
  }

  try {

    if (feedback) {

      feedback.textContent =
        'Buscando álbum no Spotify...';

      feedback.className =
        'feedback';
    }

    const results =
      await searchSpotifyAlbums(query);

    if (!results.length) {

      if (feedback) {

        feedback.textContent =
          'Nenhum álbum encontrado no Spotify.';

        feedback.className =
          'feedback error';
      }

      hideAlbumSuggestions();
      return;
    }

    spotifySearchResults =
      results;

    if (feedback) {

      feedback.textContent =
        'Álbum encontrado. Abrindo avaliação.';

      feedback.className =
        'feedback success';
    }

    hideAlbumSuggestions();

    selectSpotifyAlbum(
      results[0]
    );

  } catch (error) {

    console.error(error);

    if (feedback) {

      feedback.textContent =
        'Erro ao buscar álbum no Spotify. Verifique a rota /api/spotify.';

      feedback.className =
        'feedback error';
    }
  }
}

async function showAlbumSuggestions() {

  const input =
    document.getElementById(
      'albumSearchInput'
    );

  const suggestions =
    document.getElementById(
      'albumSuggestions'
    );

  if (!input || !suggestions) return;

  const query =
    input.value.trim();

  if (!query) {

    suggestions.style.display = 'none';
    return;
  }

  try {

    const results =
      await searchSpotifyAlbums(query);

    spotifySearchResults =
      results;

    if (!results.length) {

      suggestions.innerHTML = `
        <button
          class="suggestion-item"
          type="button"
        >
          <div class="suggestion-cover">
            ?
          </div>

          <div class="suggestion-info">
            <strong>Nenhum álbum encontrado</strong>
            <span>Tente pesquisar outro álbum.</span>
          </div>
        </button>
      `;

      suggestions.style.display =
        'block';

      return;
    }

    suggestions.innerHTML =
      results.map((album, index) => {

        const normalizedAlbum =
          normalizeSpotifyAlbum(album);

        return `
          <button
            class="suggestion-item"
            type="button"
            onclick="selectSpotifyAlbumFromIndex(${index})"
          >
            <div class="suggestion-cover">
              <img
                src="${normalizedAlbum.cover}"
                alt="${normalizedAlbum.name}"
              />
            </div>

            <div class="suggestion-info">
              <strong>
                ${normalizedAlbum.name}
              </strong>

              <span>
                ${normalizedAlbum.artist} · ${normalizedAlbum.year}
              </span>
            </div>
          </button>
        `;
      }).join('');

    suggestions.style.display =
      'block';

  } catch (error) {

    console.error(error);

    suggestions.innerHTML = `
      <button
        class="suggestion-item"
        type="button"
      >
        <div class="suggestion-cover">
          !
        </div>

        <div class="suggestion-info">
          <strong>Erro ao conectar</strong>
          <span>Verifique a API do Spotify.</span>
        </div>
      </button>
    `;

    suggestions.style.display =
      'block';
  }
}

function selectSpotifyAlbumFromIndex(index) {

  const album =
    spotifySearchResults[index];

  if (!album) return;

  selectSpotifyAlbum(album);
}

async function selectSpotifyAlbum(album) {

  const normalizedAlbum =
    normalizeSpotifyAlbum(album);

  currentAlbum =
    normalizedAlbum;

  selectedAlbumKey =
    '';

  const albumName =
    document.getElementById(
      'albumName'
    );

  const albumArtist =
    document.getElementById(
      'albumArtist'
    );

  const albumCover =
    document.getElementById(
      'albumCover'
    );

  const hero =
    document.getElementById(
      'hero'
    );

  const albumsSection =
    document.getElementById(
      'albumsSection'
    );

  const albumPanel =
    document.getElementById(
      'albumPanel'
    );

  if (albumName) {

    albumName.textContent =
      currentAlbum.name;
  }

  if (albumArtist) {

    albumArtist.textContent =
      `${currentAlbum.artist} · ${currentAlbum.year} · Spotify`;
  }

  if (albumCover) {

    albumCover.innerHTML = `
      <img
        src="${currentAlbum.cover}"
        alt="Capa do álbum ${currentAlbum.name}"
      />
    `;
  }

  if (hero) {
    hero.style.display = 'none';
  }

  if (albumsSection) {
    albumsSection.style.display = 'none';
  }

  if (albumPanel) {
    albumPanel.style.display = 'block';
  }

  const personalReview =
    document.getElementById(
      'personalReview'
    );

  if (personalReview) {
    personalReview.value = '';
  }

  createTracks();
  updateAverage();
  validateReviewCompletion();
  updateProfilePreview();

  hideAlbumSuggestions();

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

function selectAlbumSuggestion(albumKey) {

  if (!albums[albumKey]) return;

  const input =
    document.getElementById(
      'albumSearchInput'
    );

  if (input) {

    input.value =
      `${albums[albumKey].name} — ${albums[albumKey].artist}`;
  }

  selectedAlbumKey =
    albumKey;

  hideAlbumSuggestions();

  openAlbum(albumKey);
}

function searchFriend() {

  const input =
    document.getElementById(
      'friendInput'
    );

  const feedback =
    document.getElementById(
      'friendFeedback'
    );

  const username =
    input?.value.trim();

  if (!feedback) return;

  if (!username) {

    feedback.textContent =
      'Digite um @usuário para procurar.';

    feedback.className =
      'feedback error';

    return;
  }

  feedback.textContent =
    `O usuário "${username}" ainda não existe no Critick.`;

  feedback.className =
    'feedback error';
}

function openProfilePanel() {

  const profilePanel =
    document.getElementById(
      'profilePanel'
    );

  const profileMenu =
    document.getElementById(
      'profileMenu'
    );

  if (profilePanel) {
    profilePanel.classList.add('show');
  }

  if (profileMenu) {
    profileMenu.classList.remove('show');
  }

  loadProfile();
  renderProfileReviews();
}

function closeProfilePanel() {

  const profilePanel =
    document.getElementById(
      'profilePanel'
    );

  if (profilePanel) {
    profilePanel.classList.remove('show');
  }
}

function openSettingsPanel() {

  const settingsPanel =
    document.getElementById(
      'settingsPanel'
    );

  const profileMenu =
    document.getElementById(
      'profileMenu'
    );

  if (settingsPanel) {
    settingsPanel.classList.add('show');
  }

  if (profileMenu) {
    profileMenu.classList.remove('show');
  }

  const displayNameInput =
    document.getElementById(
      'displayNameInput'
    );

  const usernameInput =
    document.getElementById(
      'usernameInput'
    );

  const bioInput =
    document.getElementById(
      'bioInput'
    );

  const bannerPositionInput =
    document.getElementById(
      'bannerPositionInput'
    );

  if (displayNameInput) {
    displayNameInput.value =
      userProfile.displayName;
  }

  if (usernameInput) {
    usernameInput.value =
      userProfile.username;
  }

  if (bioInput) {
    bioInput.value =
      userProfile.bio;
  }

  if (bannerPositionInput) {
    bannerPositionInput.value =
      userProfile.bannerPosition || 50;
  }

  updateSettingsPreview();
  updateBioCounter();
}

function closeSettingsPanel() {

  const settingsPanel =
    document.getElementById(
      'settingsPanel'
    );

  if (settingsPanel) {
    settingsPanel.classList.remove('show');
  }
}

function saveBannerFile(bannerFile) {

  if (bannerFile) {

    const reader =
      new FileReader();

    reader.onload = function(event) {

      userProfile.banner =
        event.target.result;

      finishProfileSave();
    };

    reader.readAsDataURL(
      bannerFile
    );

    return;
  }

  finishProfileSave();
}

function finishProfileSave() {

  localStorage.setItem(
    'critickProfile',
    JSON.stringify(userProfile)
  );

  loadProfile();
  closeSettingsPanel();
}

function loadProfile() {

  const topUsername =
    document.getElementById(
      'topUsername'
    );

  const topProfileImage =
    document.getElementById(
      'topProfileImage'
    );

  const profileMenuUsername =
    document.getElementById(
      'profileMenuUsername'
    );

  const profileMenuImage =
    document.getElementById(
      'profileMenuImage'
    );

  const profileDisplayName =
    document.getElementById(
      'profileDisplayName'
    );

  const profileUsernameBig =
    document.getElementById(
      'profileUsernameBig'
    );

  const profileBio =
    document.getElementById(
      'profileBio'
    );

  const profileImageBig =
    document.getElementById(
      'profileImageBig'
    );

  const profileBannerImage =
    document.getElementById(
      'profileBannerImage'
    );

  const settingsPreviewAvatar =
    document.getElementById(
      'settingsPreviewAvatar'
    );

  const settingsPreviewBanner =
    document.getElementById(
      'settingsPreviewBanner'
    );

  const bannerPositionInput =
    document.getElementById(
      'bannerPositionInput'
    );

  if (!userProfile.displayName) {
    userProfile.displayName = 'Seu nome';
  }

  if (!userProfile.username) {
    userProfile.username = 'usuario';
  }

  if (!userProfile.bio) {
    userProfile.bio = 'Sua bio aparecerá aqui.';
  }

  if (!userProfile.image) {
    userProfile.image =
      DEFAULT_PROFILE_IMAGE;
  }

  if (!userProfile.banner) {
    userProfile.banner =
      DEFAULT_BANNER_IMAGE;
  }

  if (!userProfile.bannerPosition) {
    userProfile.bannerPosition = 50;
  }

  if (topUsername) {
    topUsername.textContent =
      `@${userProfile.username}`;
  }

  if (topProfileImage) {
    topProfileImage.src =
      userProfile.image;
  }

  if (profileMenuUsername) {
    profileMenuUsername.textContent =
      `@${userProfile.username}`;
  }

  if (profileMenuImage) {
    profileMenuImage.src =
      userProfile.image;
  }

  if (profileDisplayName) {
    profileDisplayName.textContent =
      userProfile.displayName;
  }

  if (profileUsernameBig) {
    profileUsernameBig.textContent =
      `@${userProfile.username}`;
  }

  if (profileBio) {
    profileBio.textContent =
      userProfile.bio;
  }

  if (profileImageBig) {
    profileImageBig.src =
      userProfile.image;
  }

  if (profileBannerImage) {

    profileBannerImage.src =
      userProfile.banner;

    profileBannerImage.style.objectPosition =
      `center ${userProfile.bannerPosition}%`;
  }

  if (settingsPreviewAvatar) {
    settingsPreviewAvatar.src =
      userProfile.image;
  }

  if (settingsPreviewBanner) {

    settingsPreviewBanner.src =
      userProfile.banner;

    settingsPreviewBanner.style.objectPosition =
      `center ${userProfile.bannerPosition}%`;
  }

  if (bannerPositionInput) {
    bannerPositionInput.value =
      userProfile.bannerPosition || 50;
  }

  renderProfileReviews();
}

function saveProfileSettings() {

  const displayName =
    document.getElementById(
      'displayNameInput'
    )?.value.trim();

  const username =
    document.getElementById(
      'usernameInput'
    )?.value.trim();

  const bio =
    document.getElementById(
      'bioInput'
    )?.value.trim();

  const profileImageInput =
    document.getElementById(
      'profileImageInput'
    );

  const bannerImageInput =
    document.getElementById(
      'bannerImageInput'
    );

  const bannerPosition =
    document.getElementById(
      'bannerPositionInput'
    )?.value || 50;

  userProfile.displayName =
    safeText(
      displayName,
      userProfile.displayName
    );

  let cleanUsername =
    String(username || '')
      .toLowerCase()
      .replace(/@/g, '')
      .replace(/[^a-z0-9._]/g, '')
      .trim();

  cleanUsername =
    cleanUsername.slice(0, 20);

  if (!cleanUsername) {
    cleanUsername = 'usuario';
  }

  userProfile.username =
    cleanUsername;

  userProfile.bio =
    safeText(
      bio,
      userProfile.bio
    );

  userProfile.bannerPosition =
    bannerPosition;

  const profileFile =
    profileImageInput?.files?.[0];

  const bannerFile =
    bannerImageInput?.files?.[0];

  if (profileFile) {

    const reader =
      new FileReader();

    reader.onload = function(event) {

      userProfile.image =
        event.target.result;

      saveBannerFile(
        bannerFile
      );
    };

    reader.readAsDataURL(
      profileFile
    );

    return;
  }

  saveBannerFile(
    bannerFile
  );
}

function renderProfileReviews() {

  normalizeReviews();

  const container =
    document.getElementById(
      'profileReviews'
    );

  const reviewCount =
    document.getElementById(
      'profileReviewCount'
    );

  const trackCount =
    document.getElementById(
      'profileTrackCount'
    );

  const favoriteAlbum =
    document.getElementById(
      'profileFavoriteAlbum'
    );

  const highestScore =
    document.getElementById(
      'profileHighestScore'
    );

  if (
    !container ||
    !reviewCount ||
    !trackCount ||
    !favoriteAlbum ||
    !highestScore
  ) {
    return;
  }

  reviewCount.textContent =
    userReviews.length;

  if (userReviews.length === 0) {

    trackCount.textContent = '0';
    favoriteAlbum.textContent = '—';
    highestScore.textContent = '0.0';

    container.innerHTML = `
      <p class="empty-profile">
        Você ainda não avaliou nenhum álbum.
      </p>
    `;

    return;
  }

  const totalTracks =
    userReviews.reduce((sum, review) => {

      return sum +
        (Number(review.trackCount) || 0);

    }, 0);

  const bestReview =
    [...userReviews].sort((a, b) => {

      return Number(b.average) -
        Number(a.average);

    })[0];

  trackCount.textContent =
    totalTracks;

  favoriteAlbum.textContent =
    bestReview.album;

  highestScore.textContent =
    Number(bestReview.average).toFixed(1);

  container.innerHTML =
    userReviews.map(review => `
      <div class="profile-review-item">
        <img
          src="${review.cover}"
          alt="${review.album}"
        />

        <div>
          <h3>${review.album}</h3>

          <p>
            ${review.artist} · ${review.year}
          </p>

          ${
            review.text
              ? `<span class="profile-review-text">${review.text}</span>`
              : ''
          }
        </div>

        <strong>
          ${Number(review.average).toFixed(1)}
        </strong>
      </div>
    `).join('');
}

function updateProfilePreview() {

  const review =
    document.getElementById(
      'personalReview'
    )?.value.trim();

  const preview =
    document.getElementById(
      'profilePreview'
    );

  const text =
    document.getElementById(
      'profileReviewText'
    );

  if (!preview || !text) return;

  if (!review) {

    preview.style.display = 'none';
    text.textContent = '';

    return;
  }

  preview.style.display = 'block';
  text.textContent = review;
}

function updateSettingsPreview() {

  const displayName =
    document.getElementById(
      'displayNameInput'
    );

  const username =
    document.getElementById(
      'usernameInput'
    );

  const bio =
    document.getElementById(
      'bioInput'
    );

  const previewName =
    document.getElementById(
      'settingsPreviewName'
    );

  const previewUsername =
    document.getElementById(
      'settingsPreviewUsername'
    );

  const previewBio =
    document.getElementById(
      'settingsPreviewBio'
    );

  if (previewName) {

    previewName.textContent =
      displayName?.value ||
      'Usuário';
  }

  const previewCleanUsername =
    String(username?.value || '')
      .toLowerCase()
      .replace(/@/g, '')
      .replace(/[^a-z0-9._]/g, '')
      .trim()
      .slice(0, 20);

  if (previewUsername) {

    previewUsername.textContent =
      `@${previewCleanUsername || 'usuario'}`;
  }

  if (previewBio) {

    previewBio.textContent =
      bio?.value ||
      'Sua bio aparecerá aqui.';
  }
}

function removeProfileAvatar() {

  userProfile.image =
    DEFAULT_PROFILE_IMAGE;

  const input =
    document.getElementById(
      'profileImageInput'
    );

  const preview =
    document.getElementById(
      'settingsPreviewAvatar'
    );

  if (input) {
    input.value = '';
  }

  if (preview) {
    preview.src =
      DEFAULT_PROFILE_IMAGE;
  }

  loadProfile();
}

function removeProfileBanner() {

  userProfile.banner =
    DEFAULT_BANNER_IMAGE;

  userProfile.bannerPosition =
    50;

  const input =
    document.getElementById(
      'bannerImageInput'
    );

  const preview =
    document.getElementById(
      'settingsPreviewBanner'
    );

  const positionInput =
    document.getElementById(
      'bannerPositionInput'
    );

  if (input) {
    input.value = '';
  }

  if (preview) {

    preview.src =
      DEFAULT_BANNER_IMAGE;

    preview.style.objectPosition =
      'center 50%';
  }

  if (positionInput) {
    positionInput.value = 50;
  }

  loadProfile();
}

function validateUsernameInput() {

  const input =
    document.getElementById(
      'usernameInput'
    );

  const warning =
    document.getElementById(
      'usernameWarning'
    );

  if (!input || !warning) return;

  const original =
    input.value;

  const cleaned =
    original
      .toLowerCase()
      .replace(/@/g, '')
      .replace(/[^a-z0-9._]/g, '');

  if (original !== cleaned) {

    warning.textContent =
      'Use apenas letras, números, ponto (.) ou underline (_). O @ já é fixo.';

    warning.classList.add(
      'show'
    );

  } else {

    warning.textContent =
      '';

    warning.classList.remove(
      'show'
    );
  }

  input.value =
    cleaned.slice(0, 20);

  updateSettingsPreview();
}

function updateBioCounter() {

  const bioInput =
    document.getElementById(
      'bioInput'
    );

  const bioCounter =
    document.getElementById(
      'bioCounter'
    );

  if (!bioInput || !bioCounter) return;

  bioInput.value =
    bioInput.value.slice(0, 120);

  bioCounter.textContent =
    bioInput.value.length;

  updateSettingsPreview();
}

function setupProfileImagePreview() {

  const input =
    document.getElementById(
      'profileImageInput'
    );

  if (!input) return;

  input.addEventListener(
    'change',
    function(event) {

      const file =
        event.target.files?.[0];

      if (!file) return;

      const reader =
        new FileReader();

      reader.onload =
        function(readerEvent) {

          const preview =
            document.getElementById(
              'settingsPreviewAvatar'
            );

          if (preview) {

            preview.src =
              readerEvent.target.result;
          }
        };

      reader.readAsDataURL(
        file
      );
    }
  );
}

function setupBannerImagePreview() {

  const input =
    document.getElementById(
      'bannerImageInput'
    );

  if (!input) return;

  input.addEventListener(
    'change',
    function(event) {

      const file =
        event.target.files?.[0];

      if (!file) return;

      const bannerAdjustBox =
        document.getElementById(
          'bannerAdjustBox'
        );

      if (bannerAdjustBox) {
        bannerAdjustBox.classList.add(
          'show'
        );
      }

      const reader =
        new FileReader();

      reader.onload =
        function(readerEvent) {

          const preview =
            document.getElementById(
              'settingsPreviewBanner'
            );

          if (preview) {

            preview.src =
              readerEvent.target.result;
          }
        };

      reader.readAsDataURL(
        file
      );
    }
  );
}

function setupBannerPositionControl() {
  const input =
    document.getElementById('bannerPositionInput');

  if (!input) return;

  input.addEventListener('input', function() {
    const value = this.value;

    const profileBannerImage =
      document.getElementById('profileBannerImage');

    const settingsPreviewBanner =
      document.getElementById('settingsPreviewBanner');

    if (profileBannerImage) {
      profileBannerImage.style.objectPosition =
        `center ${value}%`;
    }

    if (settingsPreviewBanner) {
      settingsPreviewBanner.style.objectPosition =
        `center ${value}%`;
    }

    userProfile.bannerPosition = value;
  });
}

function setupSettingsInputs() {

  const displayNameInput =
    document.getElementById(
      'displayNameInput'
    );

  const usernameInput =
    document.getElementById(
      'usernameInput'
    );

  const bioInput =
    document.getElementById(
      'bioInput'
    );

  if (displayNameInput) {

    displayNameInput.addEventListener(
      'input',
      updateSettingsPreview
    );
  }

  if (usernameInput) {

    usernameInput.addEventListener(
      'input',
      validateUsernameInput
    );
  }

  if (bioInput) {

    bioInput.addEventListener(
      'input',
      updateBioCounter
    );
  }
}

function setupInitialState() {

  loadProfile();

  renderNotifications();

  renderProfileReviews();

  updateSettingsPreview();

  updateBioCounter();

  validateReviewCompletion();
}

function renderWeeklyTopAlbums() {

  const grid =
    document.querySelector(
      '#albumsSection .album-grid'
    );

  const title =
    document.querySelector(
      '#albumsSection .section-title'
    );

  const subtitle =
    document.querySelector(
      '#albumsSection .section-subtitle'
    );

  if (!grid) return;

  if (title) {
    title.textContent =
      'Álbuns em destaque';
  }

  if (subtitle) {
    subtitle.textContent =
      'Os 10 álbuns mais bem avaliados da semana.';
  }

  const reviews =
    JSON.parse(
      localStorage.getItem('critickReviews')
    ) || [];

  const sevenDaysAgo =
    new Date();

  sevenDaysAgo.setDate(
    sevenDaysAgo.getDate() - 7
  );

  const weeklyReviews =
    reviews

      .filter(review => {

        if (!review.date) {
          return true;
        }

        const [day, month, year] =
          review.date.split('/');

        const reviewDate =
          new Date(
            `${year}-${month}-${day}`
          );

        return reviewDate >= sevenDaysAgo;
      })

      .sort((a, b) => {
        return Number(b.average) -
          Number(a.average);
      })

      .slice(0, 10);

  if (!weeklyReviews.length) {

    grid.innerHTML = `
      <div class="album-card">
        <div class="album-card-body">
          <h3>
            Nenhuma avaliação ainda
          </h3>

          <p>
            Avalie alguns álbuns para montar o ranking.
          </p>
        </div>
      </div>
    `;

    return;
  }

  grid.innerHTML =
    weeklyReviews.map((review, index) => {

      const albumKey =
  getAlbumKeyByName(review.album);

return `
  <article
    class="album-card"
    ${albumKey ? `onclick="openAlbum('${albumKey}')"` : ''}
  >

          <div class="album-cover">
            <img
              src="${review.cover}"
              alt="${review.album}"
            />
          </div>

          <div class="album-card-body">

            <div>
              <h3>
                #${index + 1} ${review.album}
              </h3>

              <p>
                ${review.artist} · ${review.year || '—'}
              </p>
            </div>

            <div class="album-meta">

              <span class="score-pill">
                ${Number(review.average).toFixed(1)}
              </span>

              <span class="muted-pill">
                ${review.trackCount || 0} faixas
              </span>

            </div>

          </div>

        </article>
      `;
    }).join('');
}

function openFriendReview(reviewId) {
  alert('Aqui vai abrir a avaliação completa: ' + reviewId);
}

document.addEventListener(
  'DOMContentLoaded',
  function() {

    renderWeeklyTopAlbums();

    setupSettingsInputs();

    setupProfileImagePreview();

    setupBannerImagePreview();

    setupBannerPositionControl();

    setupInitialState();
  }
);

