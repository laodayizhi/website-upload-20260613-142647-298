(function () {
  function prepare(video) {
    if (!video || video.dataset.ready === "true") {
      return;
    }

    var streamUrl = video.getAttribute("data-stream");
    if (!streamUrl) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      video._player = hls;
    } else {
      video.src = streamUrl;
    }

    video.dataset.ready = "true";
    if (video.parentElement) {
      video.parentElement.classList.add("is-ready");
    }
  }

  function play(video) {
    prepare(video);
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  document.querySelectorAll(".js-video-player").forEach(function (video) {
    var shell = video.closest(".video-shell");
    var button = shell ? shell.querySelector(".js-play-button") : null;

    if (button) {
      button.addEventListener("click", function () {
        play(video);
      });
    }

    video.addEventListener("click", function () {
      if (video.dataset.ready !== "true") {
        play(video);
      }
    });

    video.addEventListener("play", function () {
      if (shell) {
        shell.classList.add("is-playing");
      }
    });

    video.addEventListener("pause", function () {
      if (shell) {
        shell.classList.remove("is-playing");
      }
    });
  });
}());
