import { H as Hls } from './hls.js';

const players = document.querySelectorAll('[data-player]');

players.forEach((player) => {
  const video = player.querySelector('video');
  const button = player.querySelector('[data-play-button]');
  const message = player.querySelector('[data-player-message]');
  const source = video?.dataset.src;
  let hls = null;
  let isAttached = false;

  if (!video || !source) {
    setMessage('未找到可用播放源。');
    return;
  }

  const attachSource = () => {
    if (isAttached) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      isAttached = true;
      setMessage('已启用浏览器原生 HLS 播放。');
      return;
    }

    if (typeof Hls !== 'undefined' && typeof Hls.isSupported === 'function' && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      isAttached = true;
      setMessage('已初始化 HLS 播放源。');

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
          setMessage('网络波动，正在重新加载播放源。');
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
          setMessage('媒体播放异常，正在恢复。');
        } else {
          setMessage('当前播放源暂时不可用，请稍后重试。');
          hls.destroy();
        }
      });

      return;
    }

    video.src = source;
    isAttached = true;
    setMessage('当前浏览器不支持 HLS 扩展，已尝试直接播放。');
  };

  button?.addEventListener('click', async () => {
    attachSource();

    try {
      await video.play();
      button.classList.add('is-hidden');
    } catch (error) {
      setMessage('播放被浏览器拦截，请再次点击播放按钮。');
    }
  });

  video.addEventListener('play', () => {
    button?.classList.add('is-hidden');
  });

  video.addEventListener('pause', () => {
    if (!video.ended) {
      return;
    }

    button?.classList.remove('is-hidden');
  });

  window.addEventListener('beforeunload', () => {
    if (hls) {
      hls.destroy();
    }
  });

  function setMessage(value) {
    if (message) {
      message.textContent = value;
    }
  }
});
