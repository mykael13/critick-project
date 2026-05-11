export default async function handler(req, res) {
  try {
    const query = String(req.query.q || '').trim();

    if (!query) {
      return res.status(400).json({
        error: 'Digite o nome de um álbum.'
      });
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res.status(500).json({
        error: 'Credenciais do Spotify não configuradas.'
      });
    }

    const auth = Buffer
      .from(`${clientId}:${clientSecret}`)
      .toString('base64');

    const tokenResponse = await fetch(
      'https://accounts.spotify.com/api/token',
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      }
    );

    const tokenText = await tokenResponse.text();

    if (tokenResponse.status === 429) {
      return res.status(429).json({
        error: 'Muitas buscas feitas em pouco tempo. Espere alguns minutos e tente novamente.'
      });
    }

    let tokenData;

    try {
      tokenData = JSON.parse(tokenText);
    } catch {
      return res.status(500).json({
        error: 'Resposta inválida ao gerar token.',
        details: tokenText
      });
    }

    if (!tokenResponse.ok || !tokenData.access_token) {
      return res.status(500).json({
        error: 'Erro ao gerar token do Spotify.',
        details: tokenData
      });
    }

    const accessToken = tokenData.access_token;

    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&limit=5&market=BR`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    const searchText = await searchResponse.text();

    if (searchResponse.status === 429) {
      return res.status(429).json({
        error: 'Limite temporário do Spotify atingido. Aguarde alguns minutos.'
      });
    }

    let searchData;

    try {
      searchData = JSON.parse(searchText);
    } catch {
      return res.status(500).json({
        error: 'Resposta inválida ao buscar álbuns.',
        details: searchText
      });
    }

    if (!searchResponse.ok) {
      return res.status(500).json({
        error: 'Erro ao buscar álbuns.',
        details: searchData
      });
    }

    const spotifyAlbums = searchData.albums?.items || [];

    const albumsWithTracks = await Promise.all(
      spotifyAlbums.map(async album => {
        const albumResponse = await fetch(
          `https://api.spotify.com/v1/albums/${album.id}/tracks?market=BR&limit=50`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );

        const albumText = await albumResponse.text();

        if (albumResponse.status === 429) {
          return {
            id: album.id,
            name: album.name,
            artist: album.artists?.map(artist => artist.name).join(', ') || 'Artista desconhecido',
            year: album.release_date?.slice(0, 4) || '',
            cover: album.images?.[0]?.url || '',
            spotifyUrl: album.external_urls?.spotify || '',
            tracks: [],
            tracklistError: 'Limite temporário do Spotify.'
          };
        }

        let albumData;

        try {
          albumData = JSON.parse(albumText);
        } catch {
          albumData = {};
        }

        const tracks = albumData.items?.map(track => ({
          title: track.name || 'Faixa sem nome',
          score: null
        })) || [];

        return {
          id: album.id,
          name: album.name,
          artist: album.artists?.map(artist => artist.name).join(', ') || 'Artista desconhecido',
          year: album.release_date?.slice(0, 4) || '',
          cover: album.images?.[0]?.url || '',
          spotifyUrl: album.external_urls?.spotify || '',
          tracks
        };
      })
    );

    return res.status(200).json({
      albums: albumsWithTracks
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Erro interno no servidor.',
      details: error.message
    });
  }
}