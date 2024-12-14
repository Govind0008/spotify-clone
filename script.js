let currentsong = new Audio();
let currfolder;
let songs = [];

function SecondsToMinutes(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${remainingSeconds}`;
}

async function getsongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();

    let element = document.createElement("div");
    element.innerHTML = response;

    let as = element.getElementsByTagName("a");
    let mp3Links = Array.from(as).filter(link => link.href.endsWith(".mp3"));
    let songUrls = mp3Links.map(link => link.href);
    return songUrls;
}

const playmusic = (track, pause = false) => {
    if (!track.startsWith("http://") && !track.startsWith("https://")) {
        track = `/${currfolder}/` + track;
    }
    currentsong.src = track;
    if (!pause) {
        currentsong.play();
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track.split('/').pop());
    document.querySelector(".songtime").innerHTML = "0:00/0:00"; // Reset song time display
    updateSeekbar();
};

// Function to update the seekbar and song time
const updateSeekbar = () => {
    if (currentsong.duration) {
        const progressPercentage = (currentsong.currentTime / currentsong.duration) * 100;
        document.querySelector(".circle").style.left = progressPercentage + "%";
        document.querySelector(".songtime").innerHTML = `${SecondsToMinutes(currentsong.currentTime)}/${SecondsToMinutes(currentsong.duration)}`;
    }
};

// Function to handle time update for song
const handleTimeUpdate = () => {
    updateSeekbar();
};

// Seekbar click event to update the song time
const handleSeekbarClick = (e) => {
    const seekbarWidth = e.target.getBoundingClientRect().width;
    const newPosition = (e.offsetX / seekbarWidth) * 100;
    document.querySelector(".circle").style.left = newPosition + "%";
    const newTime = (newPosition / 100) * currentsong.duration;
    currentsong.currentTime = newTime;
};

async function loadSongs(folder) {
    songs = await getsongs(folder);

    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songul.innerHTML = ""; // Clear previous songs

    songs.forEach(song => {
        let songName = decodeURIComponent(song.split('/').pop());
        let songArtist = "Unknown Artist";
        let li = document.createElement("li");

        li.innerHTML = `
            <img class="invert" src="info.svg" alt="Info Icon">
            <div class="info">
                <div>${songName}</div>
                <div>${songArtist}</div>
            </div>
            <div class="playnow">
                <span><img class="invert" src="playc.svg" alt="Play Icon"></span>
            </div>
        `;
        songul.appendChild(li);

        li.querySelector(".playnow").addEventListener("click", () => {
            playmusic(song);
            play.src = "pause.svg";
        });
    });
}

async function main() {
    // Default folder load on page load
    await loadSongs("songs/ncs");
    playmusic(songs[0], true);

    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "pause.svg";
        } else {
            currentsong.pause();
            play.src = "play.svg";
        }
    });

    // Time update event listener
    currentsong.addEventListener("timeupdate", handleTimeUpdate);

    // Seekbar click event listener
    document.querySelector(".seekbar").addEventListener("click", handleSeekbarClick);

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".backarrow").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    });

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src);
        if (index > 0) {
            playmusic(songs[index - 1]);
            play.src = "pause.svg";
        }
    });

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src);
        if (index < songs.length - 1) {
            playmusic(songs[index + 1]);
            play.src = "pause.svg";
        }
    });

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentsong.volume = parseInt(e.target.value) / 100;
        const volume = document.querySelector(".volume");
        if (currentsong.volume === 0) {
            volume.src = "mute.svg";
        } else {
            volume.src = "volume.svg";
        }
    });

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async (item) => {
            await loadSongs(`songs/${item.currentTarget.dataset.folder}`)
            playmusic(songs[0], true);
        });
    });
}

main();